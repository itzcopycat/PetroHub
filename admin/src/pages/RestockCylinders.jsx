import { useState } from "react";

// Mock data — replace with real inventory + history API calls later
const categories = [
  { id: "mini", label: "Mini Cylinder (5 kg)" },
  { id: "domestic", label: "Domestic Cylinder (14.2 kg)" },
  { id: "commercial", label: "Commercial Cylinder (19 kg)" },
];

const suppliers = ["IndianOil Distributor", "HP Gas Depot", "Bharat Gas Warehouse"];

const initialHistory = [
  
];

const statusMeta = {
  received: { label: "Received", var: "--admin-success" },
  pending: { label: "Pending", var: "--admin-warning" },
  cancelled: { label: "Cancelled", var: "--admin-danger" },
};

function RestockCylinders({ onBack }) {
  const [history, setHistory] = useState(initialHistory);
  const [form, setForm] = useState({
    category: categories[0].id,
    quantity: "",
    date: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.quantity || !form.date) return;

    const categoryLabel = categories.find((c) => c.id === form.category)?.label;

    const newEntry = {
      id: `RS${Math.floor(2026000 + Math.random() * 999)}`,
      category: categoryLabel,
      quantity: Number(form.quantity),
      date: form.date,
      status: "pending",
    };

    setHistory((prev) => [newEntry, ...prev]);
    setForm({ category: categories[0].id, quantity: "", supplier: suppliers[0], date: "", notes: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

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

                <button type="submit" className="btn btn-primary text-white w-100">
                  <i className="bi bi-check-lg"></i> Submit Restock Request
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
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry) => {
                      const meta = statusMeta[entry.status];
                      return (
                        <tr key={entry.id}>
                          <td>{entry.id}</td>
                          <td>{entry.category}</td>
                          <td>{entry.quantity}</td>
                          <td>{entry.date}</td>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RestockCylinders;