import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import '../styles/auth.css';

export default function Signup() {
  const { setUserInfo } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    setUserInfo({ email });
    navigate("/");
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      const res = await fetch('http://localhost:5000/google-login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
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
          <h1 className="auth-heading">Signup</h1>

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

          {error && <p className="auth-error">{error}</p>}

          <button onClick={handleSignup} className="auth-button">
            Signup
          </button>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
        </div>
      </main>
    </GoogleOAuthProvider>
  );
}
