import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";

function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  // Guard: if someone lands here directly without an email, send them back
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return; // only allow single digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next box
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    // Hook this up to your backend to actually verify the OTP
    console.log("Verifying OTP:", enteredOtp, "for", email);

    navigate("/reset-password", { state: { email, otp: enteredOtp } });
  };

  const handleResend = () => {
    console.log("Resending OTP to:", email);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputsRef.current[0].focus();
  };

  if (!email) return null;

  return (
    <div className="login-page">
      <div className="login-card">

        <FaShieldAlt className="login-icon" />

        <h2>Verify OTP</h2>
        <p>
          We've sent a 6-digit code to <strong>{email}</strong>. Enter it
          below to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="otp-group">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputsRef.current[index] = el)}
                className="otp-box"
              />
            ))}
          </div>

          {error && <p className="otp-error">{error}</p>}

          <button type="submit" className="login-button">
            Verify OTP
          </button>
        </form>

        <div className="login-links">
          <p>
            Didn't receive the code?{" "}
            <span className="resend-link" onClick={handleResend}>
              Resend OTP
            </span>
          </p>
          <p>
            <Link to="/forgot-password">Change Email</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default VerifyOtp;