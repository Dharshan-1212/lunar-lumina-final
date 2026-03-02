import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Challenges() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Challenges</h2>
        <p>Please login to access challenges.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎮 AI Challenges</h2>
      <p>Welcome to the challenges page!</p>
      <p>User: {user.email}</p>
      <p>Current Level: 1</p>
      <button onClick={() => alert("Challenge coming soon!")}>
        Start Challenge
      </button>
    </div>
  );
}

export default Challenges;
