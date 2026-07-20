import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const otp = location.state?.otp;

  // Guard: only accessible after email + otp verification step
  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, otp, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Hook this up to your backend to actually update the password
    console.log("Resetting password for:", email);

    setError("");
    setSuccess(true);

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);
  };

  if (!email || !otp) return null;

  return (
    <div className="login-page">
      <div className="login-card">

        {!success ? (
          <>
            <FaLock className="login-icon" />

            <h2>Set New Password</h2>
            <p>Create a new password for your PetroHub account.</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>New Password</label>
                <div className="password-box">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <div className="password-box">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              {error && <p className="otp-error">{error}</p>}

              <button type="submit" className="login-button">
                Reset Password
              </button>
            </form>
          </>
        ) : (
          <div className="reset-success">
            <FaCheckCircle className="success-icon" />
            <h2>Password Updated!</h2>
            <p>
              Your password has been reset successfully. Redirecting you
              to login...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default ResetPassword;