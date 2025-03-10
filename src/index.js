import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

// Import spinner styles (optional if using Tailwind or external CSS)
const spinnerStyle = {
  width: "50px",
  height: "50px",
  border: "5px solid #ddd",
  borderTop: "5px solid #4CAF50",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

const RootComponent = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Delay app rendering for 3 seconds
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "#000",
        textAlign: "center"
      }}>
        <img 
          src={`${process.env.PUBLIC_URL}/logo512.png`} 
          alt="App Icon" 
          width="80" 
          height="80" 
          style={{ marginBottom: "20px" }} 
        />
        <div style={spinnerStyle}></div> {/* Loading Spinner */}
        <p style={{ fontSize: "18px", fontWeight: "bold", color: "#4CAF50", marginTop: "15px" }}>
          Loading...
        </p>

        {/* Add spinner animation using inline styles */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RootComponent />);

reportWebVitals();