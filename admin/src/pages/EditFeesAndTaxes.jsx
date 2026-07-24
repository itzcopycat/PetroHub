import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";

const FIELD_META = {
  deliveryFee: {
    key: "deliveryFee",
    label: "Delivery Fee",
    icon: "bi-truck",
    unit: "₹",
    endpoint: "delivery-fee",
    description: "Flat fee charged per delivery",
  },
  platformFee: {
    key: "platformFee",
    label: "Platform Fee",
    icon: "bi-diagram-3",
    unit: "₹",
    endpoint: "platform-fee",
    description: "Flat fee charged per booking",
  },
  taxRatePercent: {
    key: "taxRatePercent",
    label: "GST / Tax Rate",
    icon: "bi-receipt",
    unit: "%",
    endpoint: "tax",
    description: "Applied to the cylinder price",
  },
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function EditFeesAndTaxes() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingKey, setEditingKey] = useState(null);
  const [draftValue, setDraftValue] = useState("");
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
      setSettings(res.data.settings);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load fee settings");
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
          ["deliveryFee", "platformFee", "tax"].includes(log.fieldType)
        )
      );
    } catch {
      // Non-critical
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (meta) => {
    setEditingKey(meta.key);
    setDraftValue(settings[meta.key].value);
    setSaveError("");
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setDraftValue("");
    setSaveError("");
  };

  const saveEdit = async (meta) => {
    const newValue = Number(draftValue);
    const current = settings[meta.key].value;
    if (Number.isNaN(newValue) || newValue < 0 || newValue === current) {
      cancelEdit();
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      const res = await axios.patch(
        `${API_BASE}/api/pricing/${meta.endpoint}`,
        { value: newValue },
        authHeaders
      );
      setSettings(res.data.settings);
      setToast(`${meta.label} updated to ${meta.unit === "%" ? `${newValue}%` : `₹${newValue}`}`);
      setTimeout(() => setToast(null), 2500);
      cancelEdit();
      fetchHistory();
    } catch (err) {
      setSaveError(err.response?.data?.message || `Failed to update ${meta.label.toLowerCase()}`);
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
              <i className="bi bi-receipt-cutoff"></i>
            </span>
            <div>
              <span className="eyebrow">Inventory Management</span>
              <h1>Fees &amp; Taxes</h1>
              <p className="text-muted mb-0">
                Set the delivery fee, platform fee, and tax rate applied to every booking.
              </p>
            </div>
          </div>

          <div className="heading-actions">
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

        {saveError && (
          <div className="alert alert-danger mb-3" style={{ padding: "0.6rem 0.85rem", fontSize: "0.85rem" }}>
            {saveError}
          </div>
        )}

        <div className="panel mb-4">
          <div className="panel-header">
            <div>
              <h2 className="section-title" style={{ fontSize: "1.1rem", margin: 0 }}>
                <i className="bi bi-grid-1x2"></i> Fee Configuration
              </h2>
              <p className="text-muted mb-0">Applied automatically to every new booking</p>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={fetchSettings}>
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>

          {error && <div className="alert alert-danger mb-3">{error}</div>}

          {loading || !settings ? (
            <p className="text-muted mb-0">Loading fee settings…</p>
          ) : (
            <div className="row g-3">
              {Object.values(FIELD_META).map((meta) => {
                const isEditing = editingKey === meta.key;
                const field = settings[meta.key];

                return (
                  <div className="col-12 col-md-6 col-lg-4" key={meta.key}>
                    <div
                      className="mini-card"
                      style={{ display: "grid", gap: "0.75rem", minHeight: "auto", padding: "1.1rem" }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <span className="nav-icon" style={{ width: 34, height: 34, fontSize: "1rem" }}>
                            <i className={`bi ${meta.icon}`}></i>
                          </span>
                          <div>
                            <strong style={{ display: "block", fontSize: "0.98rem" }}>
                              {meta.label}
                            </strong>
                            <span>{meta.description}</span>
                          </div>
                        </div>

                        {!isEditing && (
                          <button
                            className="icon-button"
                            style={{ width: 34, height: 34, fontSize: "0.85rem" }}
                            onClick={() => startEdit(meta)}
                            title={`Edit ${meta.label.toLowerCase()}`}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <>
                          <div>
                            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                              New {meta.label} ({meta.unit})
                            </label>
                            <input
                              type="number"
                              min="0"
                              step={meta.unit === "%" ? "0.1" : "1"}
                              className="form-control"
                              value={draftValue}
                              onChange={(e) => setDraftValue(e.target.value)}
                              autoFocus
                              disabled={saving}
                            />
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-primary text-white"
                              style={{ flex: 1 }}
                              onClick={() => saveEdit(meta)}
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
                              Current Value
                            </span>
                            <span style={{ fontSize: "1.4rem", fontWeight: 800 }}>
                              {meta.unit === "%" ? `${field.value}%` : `₹${field.value}`}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between" style={{ fontSize: "0.78rem" }}>
                            <span className="text-muted">Last updated</span>
                            <span>{formatDate(field.lastUpdated)}</span>
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
                <i className="bi bi-clock-history"></i> Change History
              </h2>
              <p className="text-muted mb-0">Recent fee and tax updates</p>
            </div>
          </div>

          {historyLoading ? (
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Loading history…
            </p>
          ) : history.length === 0 ? (
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              No changes yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Change ID</th>
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
                      <td>{entry.fieldType === "tax" ? `${entry.oldValue}%` : `₹${entry.oldValue}`}</td>
                      <td>
                        <strong
                          style={{
                            color:
                              entry.newValue > entry.oldValue
                                ? "var(--admin-danger)"
                                : "var(--admin-success)",
                          }}
                        >
                          {entry.fieldType === "tax" ? `${entry.newValue}%` : `₹${entry.newValue}`}
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

export default EditFeesAndTaxes;