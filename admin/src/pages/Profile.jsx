import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [admin, setAdmin] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const storageType = localStorage.getItem("token") ? localStorage : sessionStorage;

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmin(res.data.admin);
    } catch (err) {
      setError("Could not load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!avatarFile) return;
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const uploadRes = await axios.post(
        "http://localhost:3000/api/upload/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const avatarUrl = uploadRes.data.avatarUrl;

      const updateRes = await axios.patch(
        "http://localhost:3000/api/admin/me",
        { avatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAdmin(updateRes.data.admin);

      // Keep Navbar in sync — update the stored admin object and notify the app
      const storedAdmin = JSON.parse(storageType.getItem("admin") || "{}");
      storageType.setItem(
        "admin",
        JSON.stringify({ ...storedAdmin, avatarUrl })
      );
      window.dispatchEvent(new Event("admin-updated"));

      setSuccess("Profile photo updated successfully.");
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile photo");
    } finally {
      setUploading(false);
    }
  };

  if (!admin) {
    return (
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <p className="text-muted">Loading profile…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-person-badge" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow mb-1">Account</p>
              <h1 className="h3 mb-1">Profile</h1>
              <p className="text-muted mb-0">
                Manage your administrator profile photo and details.
              </p>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
        {success && <div className="alert alert-success py-2 mb-3">{success}</div>}

        <section className="panel profile-card mt-3">
          <div className="profile-hero">
            <img
              className="avatar-img avatar-xl profile-photo"
              src={
                avatarPreview ||
                (admin.avatarUrl
                  ? `http://localhost:3000${admin.avatarUrl}`
                  : "/assets/images/avatar/avatar.jpg")
              }
              alt={admin.name}
            />
            <h2 className="h5 mt-3 mb-1">{admin.name}</h2>
            <p className="text-muted mb-3">{admin.email}</p>

            <div className="d-flex flex-column align-items-center gap-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="form-control form-control-sm"
                onChange={handleAvatarSelect}
              />
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={handleUpload}
                disabled={!avatarFile || uploading}
              >
                {uploading ? "Uploading..." : "Save Photo"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Profile;