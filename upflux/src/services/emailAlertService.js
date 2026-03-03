import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const API_BASE = "http://localhost:5000";

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function deriveTopicBuckets(topics = {}) {
  const weakTopics = [];
  const strongTopics = [];

  Object.entries(topics).forEach(([topic, stats]) => {
    const total = Number(stats?.total || 0);
    const correct = Number(stats?.correct || 0);
    if (total <= 0) return;
    const accuracy = (correct / total) * 100;
    if (accuracy < 50) weakTopics.push(topic);
    if (accuracy > 75) strongTopics.push(topic);
  });

  return { weakTopics, strongTopics };
}

const EMAIL_TYPE_LABELS = {
  plateau: "Plateau Detection Alert",
  streak: "Streak Loss Warning",
  dailySummary: "Daily Performance Summary",
};

export function generateEmailContent(type, userData) {
  const username = userData.username || "Learner";
  const weakTopics = userData.latestQuizAttempt?.weakTopics || [];
  const weakTopicsText =
    weakTopics.length > 0 ? weakTopics.join(", ") : "No major weak topics detected";
  const streakDays = Number(userData.streakDays || 0);
  const score = Number(userData.latestQuizAttempt?.score ?? 0);
  const velocity = userData.learningVelocity ?? "N/A";
  const riskLevel = userData.riskLevel || "Unknown";

  if (type === "plateau") {
    return {
      email_title: "Action Needed: Break Your Learning Plateau",
      email_message: `Your recent progress indicates a plateau. Focus on your weak topics and take one focused quiz plus a revision session today to regain momentum.`,
      dynamic_content: `Weak topics: ${weakTopicsText}\nSuggested action: Take a focused quiz on one weak topic and one short revision session.`,
    };
  }

  if (type === "streak") {
    return {
      email_title: "Streak Alert: Keep Your Momentum Alive",
      email_message: `Your learning streak is about to break. Complete a quick quiz today to keep the streak active.`,
      dynamic_content: `Current streak: ${streakDays} day${streakDays === 1 ? "" : "s"}.\nAction: Complete any quiz today to maintain your streak.`,
    };
  }

  return {
    email_title: "Your Daily Learning Summary",
    email_message: `Here is your latest learning summary. Great job staying consistent.`,
    dynamic_content: `Score: ${score}\nLearning Velocity: ${velocity}\nRisk Level: ${riskLevel}\nWeak Topics: ${weakTopicsText}`,
  };
}

function determineEmailType(userData, now = new Date()) {
  if (userData.plateauStatus === true) return "plateau";

  const lastActiveDate = toDate(userData.lastActiveDate);
  if (lastActiveDate) {
    const inactivityMs = now.getTime() - lastActiveDate.getTime();
    if (inactivityMs > ONE_DAY_MS) return "streak";
  }

  const latestDate = toDate(userData.latestQuizAttempt?.createdAt);
  if (latestDate && isSameDay(latestDate, now)) return "dailySummary";

  return null;
}

function canSendEmail(lastEmailSent, now = new Date()) {
  const lastSent = toDate(lastEmailSent);
  if (!lastSent) return true;
  return now.getTime() - lastSent.getTime() >= ONE_DAY_MS;
}

async function fetchUserEmailData(user) {
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);
  const profileData = userDocSnap.exists() ? userDocSnap.data() : {};

  const latestQuizQ = query(
    collection(db, "quizAttempts"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const latestQuizSnap = await getDocs(latestQuizQ);
  const latestQuizData = latestQuizSnap.docs.length
    ? latestQuizSnap.docs[0].data()
    : null;

  const latestQuizAttempt = latestQuizData
    ? {
        score: Number(latestQuizData.score || 0),
        createdAt: latestQuizData.createdAt || null,
        ...deriveTopicBuckets(latestQuizData.topics || {}),
      }
    : null;

  return {
    username:
      user.username ||
      profileData.username ||
      user.displayName ||
      "Learner",
    email: user.email || profileData.email || "",
    plateauStatus:
      Boolean(profileData.plateauStatus) ||
      Boolean(profileData.learningProfile?.plateauDetected),
    learningVelocity:
      profileData.learningVelocity ??
      profileData.learningProfile?.learningVelocity ??
      null,
    riskLevel:
      profileData.riskLevel ||
      profileData.learningProfile?.riskLevel ||
      "Unknown",
    streakDays:
      profileData.streakDays ??
      profileData.currentStreak ??
      0,
    lastActiveDate: profileData.lastActiveDate || latestQuizAttempt?.createdAt || null,
    lastEmailSent: profileData.lastEmailSent || null,
    latestQuizAttempt,
  };
}

export async function sendEmailAlert(user) {
  if (!user?.uid) return { sent: false, reason: "missing_user" };

  const userData = await fetchUserEmailData(user);
  if (!userData.email) return { sent: false, reason: "missing_email" };

  const emailType = determineEmailType(userData);
  if (!emailType) return { sent: false, reason: "no_email_type" };

  if (!canSendEmail(userData.lastEmailSent)) {
    return { sent: false, reason: "cooldown_active" };
  }

  const content = generateEmailContent(emailType, userData);
  const payload = {
    to: userData.email,
    user_name: userData.username,
    email_title: content.email_title,
    email_message: content.email_message,
    dynamic_content: content.dynamic_content,
    email_type: EMAIL_TYPE_LABELS[emailType] || emailType,
  };

  try {
    const res = await fetch(`${API_BASE}/send-alert-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Email Error:", data?.error || res.statusText);
      return { sent: false, reason: "backend_error" };
    }

    if (!data.success) {
      return { sent: false, reason: "send_failed" };
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        lastEmailSent: serverTimestamp(),
        lastEmailType: emailType,
      },
      { merge: true }
    );

    return { sent: true, type: emailType };
  } catch (err) {
    console.error("Email Error:", err.message);
    return { sent: false, reason: "network_error" };
  }
}
