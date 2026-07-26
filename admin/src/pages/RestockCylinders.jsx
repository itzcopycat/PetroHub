import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const categories = [
  { id: "14.2kg", label: "Domestic Cylinder (14.2 kg)" },
  { id: "19kg", label: "Commercial Cylinder (19 kg)" },
  { id: "5kg-ftl", label: "Mini Cylinder FTL (5 kg)" },
  { id: "5kg-domestic", label: "Mini Cylinder Domestic (5 kg)" },
];

const statusMeta = {
  Received: { label: "Received", var: "--admin-success" },
  Pending: { label: "Pending", var: "--admin-warning" },
  Cancelled: { label: "Cancelled", var: "--admin-danger" },
};

function RestockCylinders() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    category: categories[0].id,
    quantity: "",
    date: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [actionErrorId, setActionErrorId] = useState(null);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/inventory/restock", authHeader);
      setHistory(res.data.requests || []);
    } catch (err) {
      setError("Could not load restock history.");
    } finally {
      setHistoryLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.quantity || !form.date) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:3000/api/inventory/restock",
        {
          cylinderType: form.category,
          quantity: Number(form.quantity),
          expectedDate: form.date,
          notes: form.notes,
        },
        authHeader
      );

      setHistory((prev) => [res.data.request, ...prev]);
      setForm({ category: categories[0].id, quantity: "", date: "", notes: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit restock request.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateRequestStatus = async (id, status) => {
    setActionErrorId(null);
    try {
      const res = await axios.patch(
        `http://localhost:3000/api/inventory/restock/${id}`,
        { status },
        authHeader
      );
      setHistory((prev) => prev.map((r) => (r._id === id ? res.data.request : r)));
    } catch (err) {
      setActionErrorId(id);
    }
  };

  const categoryLabel = (id) => categories.find((c) => c.id === id)?.label || id;

  return (
    <div className="dashboard-content">
      <div className="container-fluid">

        {/* Page heading */}
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-box-seam"></i>
            </span>
            <div>
              <span className="eyebrow">Inventory Management</span>
              <h1>Restock Cylinders</h1>
              <p className="text-muted mb-0">
                Log new stock arrivals and track restock requests.
              </p>
            </div>
          </div>

          <div className="heading-actions">
            <button className="btn btn-outline-secondary" onClick={() => navigate("/cylinderstock")}>
              <i className="bi bi-arrow-left"></i> Back to Stock
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="row g-3">

          {/* Restock form */}
          <div className="col-12 col-lg-5">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="section-title" style={{ fontSize: "1.1rem", margin: 0 }}>
                    <i className="bi bi-plus-circle"></i> New Restock Entry
                  </h2>
                  <p className="text-muted mb-0">Add incoming stock to inventory</p>
                </div>
              </div>

              {submitted && (
                <div className="alert alert-success mb-3" style={{ padding: "0.6rem 0.85rem", fontSize: "0.85rem" }}>
                  <i className="bi bi-check-circle me-1"></i>
                  Restock request added successfully.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    Cylinder Category
                  </label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={handleChange("category")}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="e.g. 50"
                    value={form.quantity}
                    onChange={handleChange("quantity")}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.date}
                    onChange={handleChange("date")}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    Notes (optional)
                  </label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Any additional details..."
                    value={form.notes}
                    onChange={handleChange("notes")}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary text-white w-100" disabled={submitting}>
                  <i className="bi bi-check-lg"></i>{" "}
                  {submitting ? "Submitting…" : "Submit Restock Request"}
                </button>
              </form>
            </div>
          </div>

          {/* Restock history */}
          <div className="col-12 col-lg-7">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="section-title" style={{ fontSize: "1.1rem", margin: 0 }}>
                    <i className="bi bi-clock-history"></i> Restock History
                  </h2>
                  <p className="text-muted mb-0">Recent stock arrivals and requests</p>
                </div>
              </div>

              <div className="table-responsive">
                {historyLoading ? (
                  <p className="text-muted mb-0 py-3">Loading history…</p>
                ) : history.length === 0 ? (
                  <p className="text-muted mb-0 py-3">No restock requests yet.</p>
                ) : (
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>Expected</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry) => {
                        const meta = statusMeta[entry.status];
                        return (
                          <tr key={entry._id}>
                            <td>{entry.requestId}</td>
                            <td>{categoryLabel(entry.cylinderType)}</td>
                            <td>{entry.quantity}</td>
                            <td>
                              {entry.expectedDate
                                ? new Date(entry.expectedDate).toLocaleDateString("en-IN")
                                : "-"}
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  color: `var(${meta.var})`,
                                  background: `color-mix(in srgb, var(${meta.var}) 14%, transparent)`,
                                  fontWeight: 700,
                                  fontSize: "0.72rem",
                                }}
                              >
                                {meta.label}
                              </span>
                            </td>
                            <td>
                              {entry.status === "Pending" && (
                                <div className="d-flex gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => updateRequestStatus(entry._id, "Received")}
                                  >
                                    Mark Received
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => updateRequestStatus(entry._id, "Cancelled")}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                              {actionErrorId === entry._id && (
                                <div className="text-danger" style={{ fontSize: "0.72rem" }}>
                                  Action failed — try again.
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RestockCylinders;