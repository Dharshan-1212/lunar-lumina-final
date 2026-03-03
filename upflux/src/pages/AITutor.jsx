import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const MAX_HISTORY_MESSAGES = 14;
const API_BASE = "http://localhost:5000";

function AITutor() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) {
        setLoadingProfile(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        setProfile(snap.exists() ? snap.data() : null);
      } catch (err) {
        console.error("AI Tutor profile fetch error:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  const learningProfile = profile?.learningProfile || {};
  const weakTopics = learningProfile.weakTopics || [];
  const learningVelocity = learningProfile.learningVelocity ?? null;
  const riskLevel = learningProfile.riskLevel || "Unknown";

  const handleAsk = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please type a question for the AI tutor.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    const userMsg = { role: "user", content: trimmed };
    setConversation((prev) => [...prev, userMsg]);

    try {
      const historyForApi = conversation.slice(-Math.floor(MAX_HISTORY_MESSAGES / 2) * 2);
      const res = await fetch(`${API_BASE}/ai-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: trimmed,
          weakTopics,
          learningVelocity,
          riskLevel,
          conversationHistory: historyForApi,
        }),
      });

      const data = await res.json();
      const replyText = data?.reply || "AI Tutor is temporarily unavailable.";

      setConversation((prev) => {
        const next = [...prev, { role: "assistant", content: replyText }];
        return next.slice(-MAX_HISTORY_MESSAGES - 2);
      });
    } catch (err) {
      console.error("AI Tutor request error:", err);
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: "AI Tutor is temporarily unavailable. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const containerStyle = {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    height: "calc(100vh - 60px)",
    display: "flex",
    flexDirection: "column",
  };

  const cardStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    overflow: "hidden",
  };

  const chatAreaStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const bubbleStyle = (isUser) => ({
    alignSelf: isUser ? "flex-end" : "flex-start",
    maxWidth: "85%",
    padding: "12px 16px",
    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    backgroundColor: isUser ? "#6366f1" : "#f3f4f6",
    color: isUser ? "#fff" : "#1f2937",
    fontSize: "14px",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  });

  const inputAreaStyle = {
    padding: "16px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#fafafa",
  };

  const inputStyle = {
    width: "100%",
    minHeight: "48px",
    maxHeight: "120px",
    padding: "12px 16px",
    borderRadius: "24px",
    border: "1px solid #e5e7eb",
    resize: "none",
    boxSizing: "border-box",
    fontSize: "14px",
  };

  const buttonStyle = {
    marginTop: "8px",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  };

  const disabledButtonStyle = { ...buttonStyle, opacity: 0.6, cursor: "not-allowed" };

  const profilePillStyle = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
    fontSize: "12px",
    marginRight: "8px",
    marginBottom: "4px",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          <h2 style={{ margin: "0 0 4px 0" }}>AI Tutor</h2>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            Conversational mentor. Ask anything—I remember our chat.
          </p>
          {!loadingProfile && weakTopics.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600 }}>Focus areas: </span>
              {weakTopics.map((t) => (
                <span key={t} style={profilePillStyle}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={chatAreaStyle}>
          {conversation.length === 0 && !loading && (
            <div
              style={{
                color: "#9ca3af",
                fontSize: "14px",
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              Start the conversation. Ask about data structures, algorithms, OOP, Python, or any topic you're learning.
            </div>
          )}
          {conversation.map((msg, idx) => (
            <div key={idx} style={bubbleStyle(msg.role === "user")}>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div style={bubbleStyle(false)}>
              Thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div style={inputAreaStyle}>
          {error && (
            <p style={{ color: "#b91c1c", fontSize: "13px", marginBottom: "8px" }}>{error}</p>
          )}
          <textarea
            style={inputStyle}
            placeholder="Type your question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <button
            type="button"
            style={loading ? disabledButtonStyle : buttonStyle}
            onClick={handleAsk}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

export default AITutor;
