import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

function Header({ onMenuClick }) {
  const { user } = useContext(AuthContext);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      }
    };

    fetchUsername();
  }, [user]);

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  };

  const userSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  };

  const usernameStyle = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#4b5563'
  };

  const hamburgerStyle = {
    width: '24px',
    height: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    padding: '5px'
  };

  const lineStyle = {
    width: '100%',
    height: '2px',
    backgroundColor: '#4b5563',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={headerStyle}>
      <h1 style={titleStyle}>Dashboard</h1>
      
      <div style={userSectionStyle}>
        <span style={usernameStyle}>
          {username || 'Set your username in Profile'}
        </span>

        <div style={hamburgerStyle} onClick={onMenuClick}>
          <div style={lineStyle}></div>
          <div style={lineStyle}></div>
          <div style={lineStyle}></div>
        </div>
      </div>
    </div>
  );
}

export default Header;
