import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/consumers/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("consumer", JSON.stringify(res.data.consumer));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <FaUserCircle className="login-icon" />

        <h2>Welcome Back</h2>
        <p>Login to your PetroHub account</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="login-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <p>
            Don't have an account?{" "}
            <Link to="/register">Register</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;