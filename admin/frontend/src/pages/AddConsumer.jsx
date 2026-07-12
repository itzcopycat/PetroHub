import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const emptyForm = {
  name: "",
  dob: "",
  gender: "",
  mobileNumber: "",
  email: "",
  address: { line1: "", line2: "", district: "", city: "", state: "", pincode: "" },
  aadhaarNumber: "",
  panNumber: "",
  form60Submitted: false,
  drivingLicenseNumber: "",
  passportNumber: "",
  rationCardNumber: "",
  voterIdNumber: "",
  connectionType: "",
  cylinderSize: "",
  cylinderCount: "",
  subsidyEligible: true,
  status: "Pending",
};

function calculateAge(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function AddConsumer() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await axios.post(
        "http://localhost:3000/api/upload/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data.avatarUrl;
    } catch (err) {
      setError(err.response?.data?.message || "Avatar upload failed");
      return null;
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Age check
  const age = calculateAge(form.dob);
  if (age === null || age < 18) {
    setError("Consumer must be at least 18 years old to create an account.");
    return;
  }

  // Name check (separated for a specific message)
  if (!form.name.trim() || !/^[A-Za-z\s.'-]{2,}$/.test(form.name.trim())) {
    setError("Please enter a valid name (letters only, at least 2 characters).");
    return;
  }

  // Required field checks (mirrors backend requirements)
  if (
    !form.mobileNumber.trim() ||
    !form.address.line1.trim() ||
    !form.address.district.trim() ||
    !form.address.city.trim() ||
    !form.address.state.trim() ||
    !form.address.pincode.trim() ||
    !form.gender ||
    !form.connectionType ||
    !form.cylinderSize ||
    !form.cylinderCount
  ) {
    setError("Please fill in all required fields.");
    return;
  }

  if (!/^\d{10}$/.test(form.mobileNumber)) {
    setError("Mobile number must be exactly 10 digits.");
    return;
  }

  if (!/^\d{6}$/.test(form.address.pincode)) {
    setError("Pincode must be exactly 6 digits.");
    return;
  }

  if (!/^\d{12}$/.test(form.aadhaarNumber)) {
    setError("Aadhaar number must be exactly 12 digits.");
    return;
  }

  if (!form.panNumber && !form.form60Submitted) {
    setError(
      "PAN number is required. If the consumer doesn't have a PAN, please confirm Form 60 is submitted."
    );
    return;
  }

  setLoading(true);

  try {
    let avatarUrl = "";
    if (avatarFile) {
      avatarUrl = await uploadAvatar();
      if (!avatarUrl) {
        setLoading(false);
        return;
      }
    }

    await axios.post(
      "http://localhost:3000/api/consumers",
      { ...form, avatarUrl },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    navigate("/consumers");
  } catch (err) {
    setError(err.response?.data?.message || "Could not add consumer");
  } finally {
    setLoading(false);
  }
};

  const maxDobForAdult = new Date(
    Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-person-plus" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Add Consumer</h1>
              <p className="text-muted mb-0">
                Register a new LPG consumer with KYC and connection details.
              </p>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Personal details */}
          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-person-badge" aria-hidden="true" />
                  <span>Personal Details</span>
                </h2>
                <p className="text-muted mb-0">Basic consumer information.</p>
              </div>
            </div>

            <div className="col-12 mb-3">
              <label className="form-label fw-semibold">Profile Photo</label>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="avatar-img avatar-md"
                  style={{
                    display: "grid",
                    placeItems: "center",
                    background: "#eaf2ff",
                    color: "var(--admin-primary-dark)",
                    overflow: "hidden",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                  }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <i className="bi bi-person" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="form-control form-control-sm"
                    onChange={handleAvatarSelect}
                  />
                  <p className="text-muted small mb-0 mt-1">
                    JPEG, PNG, or WEBP. Max 3MB.
                  </p>
                  {avatarUploading && (
                    <p className="text-primary small mb-0">Uploading photo…</p>
                  )}
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">
                    Full Name <span className="text-danger">*</span>
                </label>
                <input
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    pattern="[A-Za-z\s.'-]{2,}"
                    title="Name must be at least 2 letters, using only letters, spaces, apostrophes, periods, or hyphens"
                    required
                />
                </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">
                  Date of Birth <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  max={maxDobForAdult}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">
                  Gender <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select gender --</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">
                  Mobile Number <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  pattern="\d{10}"
                  title="Mobile number must be exactly 10 digits"
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Email (optional)</label>
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                  <span>Address</span>
                </h2>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">
                  Address Line 1 <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  name="address.line1"
                  value={form.address.line1}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Address Line 2</label>
                <input
                  className="form-control"
                  name="address.line2"
                  value={form.address.line2}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">
                  City <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  name="address.city"
                  value={form.address.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">
                  District <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  name="address.district"
                  value={form.address.district}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">
                  State <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  name="address.state"
                  value={form.address.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">
                  Pincode <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  name="address.pincode"
                  value={form.address.pincode}
                  onChange={handleChange}
                  pattern="\d{6}"
                  title="Pincode must be exactly 6 digits"
                  required
                />
              </div>
            </div>
          </section>

          {/* Government documents */}
          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-file-earmark-text" aria-hidden="true" />
                  <span>Government Documents</span>
                </h2>
                <p className="text-muted mb-0">
                  Aadhaar is mandatory. PAN is required unless Form 60 is submitted.
                </p>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">
                  Aadhaar Number <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  name="aadhaarNumber"
                  value={form.aadhaarNumber}
                  onChange={handleChange}
                  maxLength={12}
                  pattern="\d{12}"
                  title="Aadhaar number must be exactly 12 digits"
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">PAN Number</label>
                <input
                  className="form-control"
                  name="panNumber"
                  value={form.panNumber}
                  onChange={handleChange}
                  maxLength={10}
                  style={{ textTransform: "uppercase" }}
                  disabled={form.form60Submitted}
                  placeholder={form.form60Submitted ? "Not applicable" : ""}
                />
              </div>

              <div className="col-12 col-md-4 d-flex align-items-end">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="form60Submitted"
                    name="form60Submitted"
                    checked={form.form60Submitted}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.checked) {
                        setForm((prev) => ({ ...prev, panNumber: "" }));
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor="form60Submitted">
                    Consumer has no PAN — Form 60 submitted instead
                  </label>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Driving License No.</label>
                <input
                  className="form-control"
                  name="drivingLicenseNumber"
                  value={form.drivingLicenseNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Passport No.</label>
                <input
                  className="form-control"
                  name="passportNumber"
                  value={form.passportNumber}
                  onChange={handleChange}
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Ration Card No.</label>
                <input
                  className="form-control"
                  name="rationCardNumber"
                  value={form.rationCardNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Voter ID No.</label>
                <input
                  className="form-control"
                  name="voterIdNumber"
                  value={form.voterIdNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Connection details */}
          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-fire" aria-hidden="true" />
                  <span>LPG Connection Details</span>
                </h2>
              </div>
            </div>
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold">
                  Connection Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  name="connectionType"
                  value={form.connectionType}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select type --</option>
                  <option>Domestic</option>
                  <option>Commercial</option>
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold">
                  Cylinder Size <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  name="cylinderSize"
                  value={form.cylinderSize}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select size --</option>
                  <option>14.2kg</option>
                  <option>19kg</option>
                  <option>5kg</option>
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold">
                  Cylinder Count <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  name="cylinderCount"
                  value={form.cylinderCount}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select count --</option>
                  <option value="Single">Single Cylinder</option>
                  <option value="Double">Double Cylinder</option>
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option>Pending</option>
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </div>
              <div className="col-12 col-md-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="subsidyEligible"
                    name="subsidyEligible"
                    checked={form.subsidyEligible}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="subsidyEligible">
                    Subsidy Eligible
                  </label>
                </div>
              </div>
            </div>
          </section>

          <div className="heading-actions mt-3 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/consumers")}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? "Saving..." : "Save Consumer"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddConsumer;