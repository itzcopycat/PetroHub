import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";

function ChangePassword() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setError("New password must be different from the current password.");
      return;
    }

    setSaving(true);
    try {
      await axios.patch(
        `${API_BASE}/api/admin/change-password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        authHeaders
      );
      setSuccess("Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="container-fluid">

        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-shield-lock"></i>
            </span>
            <div>
              <span className="eyebrow">Settings</span>
              <h1>Change Password</h1>
              <p className="text-muted mb-0">
                Update the password used to sign in to the admin panel.
              </p>
            </div>
          </div>

          <div className="heading-actions">
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i> Back
            </button>
          </div>
        </div>

        <div className="change-password-card-wrap">
          <div className="panel change-password-card">
          <div className="panel-header">
            <div>
              <h2 className="section-title" style={{ fontSize: "1.1rem", margin: 0 }}>
                <i className="bi bi-key"></i> Update Credentials
              </h2>
              <p className="text-muted mb-0">
                You'll need your current password to confirm this change.
              </p>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mb-3" style={{ padding: "0.6rem 0.85rem", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success mb-3" style={{ padding: "0.6rem 0.85rem", fontSize: "0.85rem" }}>
              <i className="bi bi-check-circle me-1"></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                Current Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                name="currentPassword"
                className="form-control"
                value={form.currentPassword}
                onChange={handleChange}
                disabled={saving}
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                name="newPassword"
                className="form-control"
                value={form.newPassword}
                onChange={handleChange}
                disabled={saving}
                autoComplete="new-password"
              />
              <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                At least 6 characters.
              </span>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                Confirm New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                name="confirmPassword"
                className="form-control"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={saving}
                autoComplete="new-password"
              />
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="showPasswords"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showPasswords" style={{ fontSize: "0.85rem" }}>
                Show passwords
              </label>
            </div>

            <button type="submit" className="btn btn-primary text-white" disabled={saving}>
              <i className="bi bi-check-lg"></i> {saving ? "Updating…" : "Update Password"}
            </button>
          </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ChangePassword;
