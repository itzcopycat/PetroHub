import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function iconFor(cylinderType) {
  if (cylinderType === "5kg-domestic") return "bi-droplet-half";
  if (cylinderType === "5kg-ftl") return "bi-truck";
  if (cylinderType === "14.2kg") return "bi-fire";
  return "bi-building";
}

function EditLpgPrice() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [cylinders, setCylinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingType, setEditingType] = useState(null);
  const [draftPrice, setDraftPrice] = useState("");
  const [draftGst, setDraftGst] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [toast, setToast] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/api/pricing`, authHeaders);
      setCylinders(res.data.settings.cylinderPrices || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load cylinder prices");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/pricing/history`, authHeaders);
      setHistory(
        (res.data.logs || []).filter((log) =>
          ["cylinderPrice", "cylinderGst"].includes(log.fieldType)
        )
      );
    } catch {
      // Non-critical — history panel just stays empty on failure.
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (item) => {
    setEditingType(item.cylinderType);
    setDraftPrice(item.price ?? 0);
    setDraftGst(item.gstRatePercent ?? 0);
    setSaveError("");
  };

  const cancelEdit = () => {
    setEditingType(null);
    setDraftPrice("");
    setDraftGst("");
    setSaveError("");
  };

  const saveEdit = async (item) => {
    const newPrice = Number(draftPrice);
    const newGst = Number(draftGst);

    if (Number.isNaN(newPrice) || newPrice <= 0) {
      setSaveError("Enter a valid price");
      return;
    }
    if (Number.isNaN(newGst) || newGst < 0) {
      setSaveError("Enter a valid GST rate");
      return;
    }
    if (newPrice === item.price && newGst === item.gstRatePercent) {
      cancelEdit();
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      const res = await axios.patch(
        `${API_BASE}/api/pricing/cylinder/${encodeURIComponent(item.cylinderType)}`,
        { price: newPrice, gstRatePercent: newGst },
        authHeaders
      );
      setCylinders(res.data.settings.cylinderPrices || []);
      setToast(`${item.label} updated to ₹${newPrice} · ${newGst}% GST`);
      setTimeout(() => setToast(null), 2500);
      cancelEdit();
      fetchHistory();
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to update price");
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
              <i className="bi bi-currency-rupee"></i>
            </span>
            <div>
              <span className="eyebrow">Inventory Management</span>
              <h1>Edit LPG Price</h1>
              <p className="text-muted mb-0">
                Update price and GST rate across all cylinder categories.
              </p>
            </div>
          </div>

          <div className="heading-actions">
            <button className="btn btn-outline-secondary" onClick={() => navigate("/fees-and-taxes")}>
              <i className="bi bi-receipt-cutoff"></i> Delivery &amp; Platform Fees
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate("/cylinderstock")}>
              <i className="bi bi-arrow-left"></i> Back to Stock
            </button>
          </div>
        </div>

        {toast && (
          <div className="alert alert-success mb-3" style={{ padding: "0.6rem 0.85rem", fontSize: "0.85rem" }}>
            <i className="bi bi-check-circle me-1"></i>
            {toast}
          </div>
        )}

        <div className="panel mb-4">
          <div className="panel-header">
            <div>
              <h2 className="section-title" style={{ fontSize: "1.1rem", margin: 0 }}>
                <i className="bi bi-grid-1x2"></i> Cylinder Pricing
              </h2>
              <p className="text-muted mb-0">Mini Domestic, FTL Mini, Domestic and Commercial cylinders</p>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={fetchSettings}>
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>

          {error && <div className="alert alert-danger mb-3">{error}</div>}

          {loading ? (
            <p className="text-muted mb-0">Loading cylinder prices…</p>
          ) : (
            <div className="row g-3">
              {cylinders.map((item) => {
                const isEditing = editingType === item.cylinderType;

                return (
                  <div className="col-12 col-md-6 col-lg-3" key={item.cylinderType}>
                    <div
                      className="mini-card"
                      style={{ display: "grid", gap: "0.75rem", minHeight: "auto", padding: "1.1rem" }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <span className="nav-icon" style={{ width: 34, height: 34, fontSize: "1rem" }}>
                            <i className={`bi ${iconFor(item.cylinderType)}`}></i>
                          </span>
                          <div>
                            <strong style={{ display: "block", fontSize: "0.95rem" }}>
                              {item.label}
                            </strong>
                            <span style={{ fontSize: "0.78rem" }}>{item.primaryUsage}</span>
                          </div>
                        </div>

                        {!isEditing && (
                          <button
                            className="icon-button"
                            style={{ width: 34, height: 34, fontSize: "0.85rem" }}
                            onClick={() => startEdit(item)}
                            title="Edit price"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <>
                          {saveError && (
                            <div className="alert alert-danger mb-0" style={{ padding: "0.4rem 0.6rem", fontSize: "0.78rem" }}>
                              {saveError}
                            </div>
                          )}
                          <div>
                            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                              Price (₹)
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="form-control"
                              value={draftPrice}
                              onChange={(e) => setDraftPrice(e.target.value)}
                              autoFocus
                              disabled={saving}
                            />
                          </div>
                          <div>
                            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                              GST Rate (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              className="form-control"
                              value={draftGst}
                              onChange={(e) => setDraftGst(e.target.value)}
                              disabled={saving}
                            />
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-primary text-white"
                              style={{ flex: 1 }}
                              onClick={() => saveEdit(item)}
                              disabled={saving}
                            >
                              <i className="bi bi-check-lg"></i> {saving ? "Saving…" : "Save"}
                            </button>
                            <button
                              className="btn btn-outline-secondary"
                              style={{ flex: 1 }}
                              onClick={cancelEdit}
                              disabled={saving}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="d-flex justify-content-between align-items-baseline">
                            <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                              Price
                            </span>
                            <span style={{ fontSize: "1.3rem", fontWeight: 800 }}>
                              ₹{item.price}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-baseline">
                            <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                              GST Rate
                            </span>
                            <span style={{ fontSize: "1rem", fontWeight: 700 }}>
                              {item.gstRatePercent ?? 0}%
                            </span>
                          </div>
                          <div className="d-flex justify-content-between" style={{ fontSize: "0.78rem" }}>
                            <span className="text-muted">Address Proof</span>
                            <span>{item.addressProofRequired ? "Required" : "Not required"}</span>
                          </div>
                          <div className="d-flex justify-content-between" style={{ fontSize: "0.78rem" }}>
                            <span className="text-muted">Last updated</span>
                            <span>{formatDate(item.lastUpdated)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="section-title" style={{ fontSize: "1.1rem", margin: 0 }}>
                <i className="bi bi-clock-history"></i> Price Change History
              </h2>
              <p className="text-muted mb-0">Recent cylinder price and GST updates</p>
            </div>
          </div>

          {historyLoading ? (
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Loading history…
            </p>
          ) : history.length === 0 ? (
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              No price changes yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Change ID</th>
                    <th>Category</th>
                    <th>Field</th>
                    <th>Old Value</th>
                    <th>New Value</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.changeId}>
                      <td>{entry.changeId}</td>
                      <td>{entry.category}</td>
                      <td>{entry.fieldType === "cylinderGst" ? "GST Rate" : "Price"}</td>
                      <td>
                        {entry.unit === "percent" ? `${entry.oldValue}%` : `₹${entry.oldValue}`}
                      </td>
                      <td>
                        <strong
                          style={{
                            color:
                              entry.newValue > entry.oldValue
                                ? "var(--admin-danger)"
                                : "var(--admin-success)",
                          }}
                        >
                          {entry.unit === "percent" ? `${entry.newValue}%` : `₹${entry.newValue}`}
                        </strong>
                      </td>
                      <td>{formatDate(entry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default EditLpgPrice;