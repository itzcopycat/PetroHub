import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaKey } from "react-icons/fa";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hook this up to your backend to actually send the OTP
    console.log("Sending OTP to:", email);

    navigate("/verify-otp", { state: { email } });
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <FaKey className="login-icon" />

        <h2>Forgot Password?</h2>
        <p>
          Enter your registered email and we'll send you a One-Time
          Password (OTP) to verify it's you.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Send OTP
          </button>
        </form>

        <div className="login-links">
          <p>
            Remembered your password?{" "}
            <Link to="/login">Back to Login</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;