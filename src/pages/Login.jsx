import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import "../styles/auth.css";

export default function Login() {
  const { setUserInfo } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }), // assuming newPassword as login password
      });
      const data = await res.json();

      if (data.token) {
        setUserInfo({ email, token: data.token });
        navigate("/");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleForgotSubmit = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter your registered email.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        setError("");
      } else {
        setError(data.message || "Email not found.");
      }
    } catch (err) {
      setError("Failed to send OTP.");
    }
  };

  const handleVerifyOTPAndReset = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Password reset successful! Please login.");
        setShowForgot(false);
        setOtpSent(false);
        setOtp("");
        setNewPassword("");
      } else {
        setError(data.message || "Invalid OTP or error.");
      }
    } catch (err) {
      setError("Reset failed. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      const res = await fetch("http://localhost:5000/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.token) {
        setUserInfo({ email: data.email || "Google User", token: data.token });
        navigate("/");
      } else {
        setError("Google login failed");
      }
    } catch (err) {
      setError("Google login error");
    }
  };

  const handleGoogleError = () => {
    setError("Google Login Failed");
  };

  return (
    <GoogleOAuthProvider clientId="708284276278-l0mfiatvh14vcp5nd2loofa7aat3psfb.apps.googleusercontent.com">
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-heading">Login</h1>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="auth-input"
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="auth-input"
          />

          {error && <p className="auth-error">{error}</p>}

          <button onClick={handleLogin} className="auth-button">
            Login
          </button>

          <p className="forgot-link" onClick={() => setShowForgot(true)}>
            Forgot Password?
          </p>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgot && (
          <div className="modal-backdrop" onClick={() => setShowForgot(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Reset Password</h2>

              {!otpSent ? (
                <>
                  <input
                    type="email"
                    placeholder="Enter registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                  />
                  <button onClick={handleForgotSubmit} className="auth-button">
                    Send OTP
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="auth-input"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="auth-input"
                  />
                  <button onClick={handleVerifyOTPAndReset} className="auth-button">
                    Reset Password
                  </button>
                </>
              )}

              {error && <p className="auth-error">{error}</p>}
              <button className="closeBtn" onClick={() => setShowForgot(false)}>
                ×
              </button>
            </div>
          </div>
        )}
      </main>
    </GoogleOAuthProvider>
  );
}
