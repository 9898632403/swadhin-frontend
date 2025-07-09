import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash, FaArrowRight, FaSignInAlt, FaUserPlus, FaLock } from "react-icons/fa";
import "../styles/auth.css";

const Auth = () => {
  const { setUserInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const toggleForm = () => {
    setError("");
    setMessage("");
    setIsLogin(!isLogin);
    setIsForgot(false);
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const url = isLogin
      ? "http://127.0.0.1:5000/login"
      : "http://127.0.0.1:5000/signup";

    const bodyData = isLogin
      ? { email, password }
      : { username: email.split("@")[0], email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        return;
      }

      setUserInfo({
        email: data.email,
        token: data.token || null,
        isAdmin: data.isAdmin || false,
      });

      setEmail("");
      setPassword("");

      if (data.isAdmin) {
        navigate("/admin/add-product", { replace: true });
      } else {
        const redirectTo = location.state?.from?.pathname || "/";
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Try again.");
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed to send OTP.");
      setMessage(data.message || "OTP sent to your email.");
      setOtpTimer(300);
      setCanResend(false);
    } catch (err) {
      console.error(err);
      setError("Error sending OTP.");
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Reset failed.");

      setMessage(data.message || "Password updated. Please login.");
      setIsForgot(false);
      setPassword("");
      setNewPassword("");
      setOtp("");
    } catch (err) {
      console.error(err);
      setError("Error resetting password.");
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-container-wrapper">
        <div className="auth-left-panel">
          <div className="auth-welcome-content">
            <h1>Welcome to Swadhin</h1>
            <p>
              {isForgot
                ? "Reset your password securely"
                : isLogin
                ? "Login to access your account and explore our services."
                : "Join us today and discover amazing features waiting for you."}
            </p>
            <div className="auth-welcome-icon">
              {isForgot ? (
                <FaLock size={80} />
              ) : isLogin ? (
                <FaSignInAlt size={80} />
              ) : (
                <FaUserPlus size={80} />
              )}
            </div>
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-form-container">
            <h2 className="auth-heading">
              {isForgot ? "Reset Password" : isLogin ? "Login" : "Sign Up"}
            </h2>

            {error && <div className="auth-error-message">{error}</div>}
            {message && <div className="auth-success-message">{message}</div>}

            {!isForgot ? (
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="password">Password</label>
                  <div className="auth-password-wrapper">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit-button">
                  {isLogin ? "Login" : "Sign Up"} <FaArrowRight />
                </button>
              </form>
            ) : (
              <div className="auth-form">
                <div className="auth-input-group">
                  <label htmlFor="forgot-email">Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <button
                  onClick={handleForgotPassword}
                  className="auth-submit-button"
                  disabled={!canResend}
                >
                  {canResend ? "Send OTP" : `Resend in ${otpTimer}s`}
                </button>

                <div className="auth-input-group">
                  <label htmlFor="otp">OTP</label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <div className="auth-input-group">
                  <label htmlFor="new-password">New Password</label>
                  <div className="auth-password-wrapper">
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleResetPassword}
                  className="auth-submit-button"
                  disabled={!email || !otp || !newPassword || newPassword.length < 6}
                >
                  Reset Password <FaArrowRight />
                </button>
              </div>
            )}

            {!isForgot && (
              <div className="auth-actions">
                <p className="auth-toggle-text">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button onClick={toggleForm} className="auth-toggle-link">
                    {isLogin ? "Sign Up" : "Login"}
                  </button>
                </p>
                {isLogin && (
                  <button
                    onClick={() => setIsForgot(true)}
                    className="auth-forgot-link"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
            )}

            {isForgot && (
              <div className="auth-actions">
                <button
                  onClick={() => setIsForgot(false)}
                  className="auth-toggle-link"
                >
                  Back to {isLogin ? "Login" : "Sign Up"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;