import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

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

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "Active":
      return "badge text-bg-success";
    case "Pending":
      return "badge text-bg-warning";
    case "Suspended":
      return "badge text-bg-secondary";
    default:
      return "badge text-bg-secondary";
  }
}

function resolveAvatarUrl(avatarUrl) {
  if (!avatarUrl) return "/assets/images/avatar/avatar.jpg";
  return avatarUrl.startsWith("http")
    ? avatarUrl
    : `http://localhost:3000${avatarUrl}`;
}

function ConsumerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [consumer, setConsumer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchConsumer = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:3000/api/consumers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsumer(res.data.consumer);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load this consumer."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateConsumer = async (payload) => {
    setActionLoading(true);
    try {
      const res = await axios.patch(
        `http://localhost:3000/api/consumers/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConsumer(res.data.consumer);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="blank-panel">
            <div className="blank-state">
              <p className="text-muted mb-0">Loading consumer…</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !consumer) {
    return (
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="alert alert-danger py-2 mb-3">{error}</div>
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchConsumer}>
            <i className="bi bi-arrow-clockwise" aria-hidden="true" /> Retry
          </button>
        </div>
      </main>
    );
  }

  if (!consumer) return null;

  const { address } = consumer;
  const age = calculateAge(consumer.dob);

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-person-vcard" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow mb-1">Consumer Profile</p>
              <h1 className="h3 mb-1">{consumer.name}</h1>
              <p className="text-muted mb-0">
                {consumer.consumerId} · Joined {formatDate(consumer.joinedAt)}
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/users">
              <i className="bi bi-arrow-left" aria-hidden="true" /> Back to Consumers
            </Link>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 mt-3 mb-0">{error}</div>}

        <div className="row g-3 mt-1">
          {/* Profile summary */}
          <div className="col-12 col-lg-4">
            <section className="panel h-100">
              <div className="panel-header">
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-person" aria-hidden="true" />
                  <span>Profile</span>
                </h2>
              </div>
              <div className="d-flex flex-column align-items-center text-center py-3">
                <img
                  className="avatar-img avatar-lg mb-3"
                  src={resolveAvatarUrl(consumer.avatarUrl)}
                  alt={consumer.name}
                />
                <h3 className="h5 mb-1">{consumer.name}</h3>
                <p className="text-muted small mb-2">{consumer.consumerId}</p>
                <div className="d-flex gap-2 mb-3">
                  <span className={getStatusBadgeClass(consumer.status)}>
                    {consumer.status}
                  </span>
                  <span
                    className={
                      consumer.kycVerified
                        ? "badge text-bg-success"
                        : "badge text-bg-warning"
                    }
                  >
                    {consumer.kycVerified ? "KYC Verified" : "KYC Pending"}
                  </span>
                </div>

                <div className="w-100 text-start px-2">
                  <div className="profile-row d-flex justify-content-between py-1">
                    <span className="text-muted">Gender</span>
                    <span>{consumer.gender || "—"}</span>
                  </div>
                  <div className="profile-row d-flex justify-content-between py-1">
                    <span className="text-muted">Date of Birth</span>
                    <span>
                      {formatDate(consumer.dob)}
                      {age !== null ? ` (${age} yrs)` : ""}
                    </span>
                  </div>
                  <div className="profile-row d-flex justify-content-between py-1">
                    <span className="text-muted">Email</span>
                    <span>{consumer.email}</span>
                  </div>
                  <div className="profile-row d-flex justify-content-between py-1">
                    <span className="text-muted">Phone</span>
                    <span>{consumer.mobileNumber}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="col-12 col-lg-8">
            <div className="row g-3">
              {/* Address */}
              <div className="col-12">
                <section className="panel">
                  <div className="panel-header">
                    <h2 className="h5 mb-1 section-title">
                      <i className="bi bi-geo-alt" aria-hidden="true" />
                      <span>Address</span>
                    </h2>
                  </div>
                  <p className="mb-0">
                    {address?.line1}
                    {address?.line2 ? `, ${address.line2}` : ""}
                    {`, ${address?.city}, ${address?.district}, ${address?.state} - ${address?.pincode}`}
                  </p>
                </section>
              </div>

              {/* LPG connection */}
              <div className="col-12 col-md-6">
                <section className="panel h-100">
                  <div className="panel-header">
                    <h2 className="h5 mb-1 section-title">
                      <i className="bi bi-fire" aria-hidden="true" />
                      <span>LPG Connection</span>
                    </h2>
                  </div>
                  <div className="profile-row d-flex justify-content-between py-1">
                    <span className="text-muted">Connection Type</span>
                    <span>{consumer.connectionType || "Not set"}</span>
                  </div>
                  <div className="profile-row d-flex justify-content-between py-1">
                    <span className="text-muted">Cylinder Size</span>
                    <span>{consumer.cylinderSize || "Not set"}</span>
                  </div>
                  <div className="profile-row d-flex justify-content-between py-1">
                    <span className="text-muted">Cylinder Count</span>
                    <span>{consumer.cylinderCount || "Not set"}</span>
                  </div>
                  <div className="profile-row d-flex justify-content-between py-1">
                    <span className="text-muted">Subsidy Eligible</span>
                    <span>{consumer.subsidyEligible ? "Yes" : "No"}</span>
                  </div>
                </section>
              </div>

              {/* Account meta */}
              <div className="col-12 col-md-6">
                <section className="panel h-100">
                  <div className="panel-header">
                    <h2 className="h5 mb-1 section-title">
                      <i className="bi bi-clock-history" aria-hidden="true" />
                      <span>Account</span>
                    </h2>
                  </div>
                  <div className="profile-row d-flex justify-content-between py-1">
                    <span className="text-muted">Joined</span>
                    <span>{formatDate(consumer.joinedAt)}</span>
                  </div>
                  <div className="profile-row d-flex justify-content-between py-1">
                    <span className="text-muted">Created By</span>
                    <span>{consumer.createdBy?.name || "Self-registered"}</span>
                  </div>
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    {consumer.status !== "Active" && (
                      <button
                        className="btn btn-success btn-sm"
                        disabled={actionLoading}
                        onClick={() => updateConsumer({ status: "Active" })}
                      >
                        Mark Active
                      </button>
                    )}
                    {consumer.status !== "Suspended" && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        disabled={actionLoading}
                        onClick={() => updateConsumer({ status: "Suspended" })}
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      className="btn btn-outline-primary btn-sm"
                      disabled={actionLoading}
                      onClick={() =>
                        updateConsumer({ kycVerified: !consumer.kycVerified })
                      }
                    >
                      {consumer.kycVerified ? "Revoke KYC" : "Verify KYC"}
                    </button>
                  </div>
                </section>
              </div>

              {/* KYC documents */}
              <div className="col-12">
                <section className="panel">
                  <div className="panel-header">
                    <h2 className="h5 mb-1 section-title">
                      <i className="bi bi-file-earmark-text" aria-hidden="true" />
                      <span>Government ID Documents</span>
                    </h2>
                  </div>
                  <div className="row g-3">
                    <div className="col-6 col-md-4">
                      <span className="text-muted d-block small">Aadhaar Number</span>
                      <span>{consumer.aadhaarNumber || "—"}</span>
                    </div>
                    <div className="col-6 col-md-4">
                      <span className="text-muted d-block small">PAN Number</span>
                      <span>{consumer.panNumber || "—"}</span>
                    </div>
                    <div className="col-6 col-md-4">
                      <span className="text-muted d-block small">Form 60 Submitted</span>
                      <span>{consumer.form60Submitted ? "Yes" : "No"}</span>
                    </div>
                    <div className="col-6 col-md-4">
                      <span className="text-muted d-block small">Driving License</span>
                      <span>{consumer.drivingLicenseNumber || "—"}</span>
                    </div>
                    <div className="col-6 col-md-4">
                      <span className="text-muted d-block small">Passport Number</span>
                      <span>{consumer.passportNumber || "—"}</span>
                    </div>
                    <div className="col-6 col-md-4">
                      <span className="text-muted d-block small">Ration Card</span>
                      <span>{consumer.rationCardNumber || "—"}</span>
                    </div>
                    <div className="col-6 col-md-4">
                      <span className="text-muted d-block small">Voter ID</span>
                      <span>{consumer.voterIdNumber || "—"}</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ConsumerDetail;