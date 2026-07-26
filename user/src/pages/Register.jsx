import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function Register() {
  const [form, setForm] = useState({
    name: "",
    gender: "",
    dob: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    address: { line1: "", line2: "", city: "", district: "", state: "", pincode: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.dob) {
      toast.error("Date of birth is required.");
      return;
    }

    if (calculateAge(form.dob) < 18) {
      toast.error("You must be at least 18 years old to register.");
      return;
    }

    if (!form.gender) {
      toast.error("Please select your gender.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (!/^\d{10}$/.test(form.mobileNumber)) {
      toast.error("Mobile number must be exactly 10 digits.");
      return;
    }

    if (!form.address.district.trim()) {
      toast.error("District is required.");
      return;
    }

    if (!/^\d{6}$/.test(form.address.pincode)) {
      toast.error("Pincode must be exactly 6 digits.");
      return;
    }

    if (!agreed) {
      toast.error("Please agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...payload } = form;

      const res = await axios.post(
        "http://localhost:3000/api/consumers/register",
        payload
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("consumer", JSON.stringify(res.data.consumer));

      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Max date a user can pick to be considered 18 today
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const maxDob = eighteenYearsAgo.toISOString().split("T")[0];

  return (
    <div className="register-page">
      <div className="register-card">

        <FaUserPlus className="register-icon" />

        <h2>Create Account</h2>
        <p>Join PetroHub and book LPG cylinders easily.</p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="address-row">
            <div className="input-group">
              <label>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                max={maxDob}
                required
              />
            </div>
          </div>

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
            <label>Phone Number</label>
            <input
              type="tel"
              name="mobileNumber"
              placeholder="Enter your 10-digit phone number"
              value={form.mobileNumber}
              onChange={handleChange}
              maxLength={10}
              required
            />
          </div>

          {/* Address */}
          <div className="input-group">
            <label>Address Line</label>
            <input
              type="text"
              name="address.line1"
              placeholder="House no., street, area"
              value={form.address.line1}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Lanmark (Optional)</label>
            <input
              type="text"
              name="address.line2"
              placeholder="building, apartment, floor etc."
              value={form.address.line2}
              onChange={handleChange}
            />
          </div>

          <div className="address-row">
            <div className="input-group">
              <label>City</label>
              <input
                type="text"
                name="address.city"
                placeholder="City"
                value={form.address.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>District</label>
              <input
                type="text"
                name="address.district"
                placeholder="District"
                value={form.address.district}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>State</label>
              <input
                type="text"
                name="address.state"
                placeholder="State"
                value={form.address.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Pincode</label>
              <input
                type="text"
                name="address.pincode"
                placeholder="6-digit pincode"
                value={form.address.pincode}
                onChange={handleChange}
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the Terms & Conditions
            </label>
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <div className="register-links">
          <p>
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;