import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";

function Profile() {
  const [admin, setAdmin] = useState(null);

  // Avatar / crop state
  const [rawImageSrc, setRawImageSrc] = useState("");
  const [avatarBlob, setAvatarBlob] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Editable details state
  const [editingDetails, setEditingDetails] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [savingDetails, setSavingDetails] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const storageType = localStorage.getItem("token") ? localStorage : sessionStorage;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/me", authHeader);
      setAdmin(res.data.admin);
      setForm({ name: res.data.admin.name || "", email: res.data.admin.email || "" });
    } catch (err) {
      setError("Could not load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ---- Avatar select -> open crop modal ----
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setRawImageSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropModalOpen(true);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsValue) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  const handleConfirmCrop = async () => {
    try {
      const blob = await getCroppedImg(rawImageSrc, croppedAreaPixels);
      setAvatarBlob(blob);
      setAvatarPreview(URL.createObjectURL(blob));
      setCropModalOpen(false);
    } catch (err) {
      setError("Could not crop image, please try again");
    }
  };

  const handleCancelCrop = () => {
    setCropModalOpen(false);
    setRawImageSrc("");
  };

  const handleUploadAvatar = async () => {
    if (!avatarBlob) return;
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", avatarBlob, "avatar.jpg");

      const uploadRes = await axios.post("http://localhost:3000/api/upload/avatar", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      const avatarUrl = uploadRes.data.avatarUrl;

      const updateRes = await axios.patch(
        "http://localhost:3000/api/admin/me",
        { avatarUrl },
        authHeader
      );

      setAdmin(updateRes.data.admin);

      const storedAdmin = JSON.parse(storageType.getItem("admin") || "{}");
      storageType.setItem("admin", JSON.stringify({ ...storedAdmin, avatarUrl }));
      window.dispatchEvent(new Event("admin-updated"));

      setSuccess("Profile photo updated successfully.");
      setAvatarBlob(null);
      setAvatarPreview("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile photo");
    } finally {
      setUploading(false);
    }
  };

  // ---- Basic details ----
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveDetails = async () => {
    setError("");
    setSuccess("");
    setSavingDetails(true);
    try {
      const res = await axios.patch(
        "http://localhost:3000/api/admin/me",
        { name: form.name, email: form.email },
        authHeader
      );
      setAdmin(res.data.admin);

      const storedAdmin = JSON.parse(storageType.getItem("admin") || "{}");
      storageType.setItem(
        "admin",
        JSON.stringify({ ...storedAdmin, name: res.data.admin.name, email: res.data.admin.email })
      );
      window.dispatchEvent(new Event("admin-updated"));

      setSuccess("Profile details updated successfully.");
      setEditingDetails(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile details");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleCancelDetails = () => {
    setForm({ name: admin.name || "", email: admin.email || "" });
    setEditingDetails(false);
  };

  const initials = (name) =>
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");

  const resolvedAvatarSrc =
    avatarPreview || (admin?.avatarUrl ? `http://localhost:3000${admin.avatarUrl}` : "");

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [resolvedAvatarSrc]);

  if (!admin) {
    return (
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <p className="text-muted">Loading profile…</p>
        </div>
      </main>
    );
  }

  const showAvatarImage = resolvedAvatarSrc && !avatarLoadFailed;

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
            {showAvatarImage ? (
              <img
                className="avatar-img avatar-xl profile-photo"
                src={resolvedAvatarSrc}
                alt={admin.name || "Admin"}
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <div
                className="avatar-img avatar-xl profile-photo d-flex align-items-center justify-content-center"
                style={{
                  background: "var(--bs-primary, #0d6efd)",
                  color: "#fff",
                  fontSize: "clamp(20px, 4vw, 28px)",
                  fontWeight: 600,
                }}
                aria-label={`${admin.name || "Admin"} profile initials`}
              >
                {initials(admin.name || "Admin")}
              </div>
            )}

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
                onClick={handleUploadAvatar}
                disabled={!avatarBlob || uploading}
              >
                {uploading ? "Uploading..." : "Save Photo"}
              </button>
            </div>
          </div>

          <hr className="my-4" />

          <div className="profile-details">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h6 mb-0">Basic details</h3>
              {!editingDetails && (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  onClick={() => setEditingDetails(true)}
                >
                  <i className="bi bi-pencil" aria-hidden="true" /> Edit
                </button>
              )}
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small text-muted">Full name</label>
                {editingDetails ? (
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                  />
                ) : (
                  <p className="mb-0 fw-semibold">{admin.name}</p>
                )}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small text-muted">Email</label>
                {editingDetails ? (
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                  />
                ) : (
                  <p className="mb-0 fw-semibold">{admin.email}</p>
                )}
              </div>
            </div>

            {editingDetails && (
              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-primary btn-sm"
                  type="button"
                  onClick={handleSaveDetails}
                  disabled={savingDetails}
                >
                  {savingDetails ? "Saving..." : "Save changes"}
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  onClick={handleCancelDetails}
                  disabled={savingDetails}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Crop modal */}
      {cropModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div
            className="bg-white rounded p-3"
            style={{ width: "min(420px, 92vw)" }}
          >
            <h3 className="h6 mb-3">Crop your photo</h3>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "clamp(240px, 60vw, 320px)",
                background: "#333",
              }}
            >
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="form-range mt-3"
            />
            <div className="d-flex justify-content-end gap-2 mt-2">
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handleCancelCrop}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={handleConfirmCrop}>
                Apply crop
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Profile;
