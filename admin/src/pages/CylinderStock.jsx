import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function getStockLevel(item) {
  if (item.available <= item.lowStockThreshold) return "critical";
  if (item.available / item.total < 0.35) return "low";
  return "healthy";
}

const levelMeta = {
  healthy: { label: "In Stock", var: "--admin-success" },
  low: { label: "Running Low", var: "--admin-warning" },
  critical: { label: "Critical", var: "--admin-danger" },
};

function CylinderStock() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStock = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3000/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStock(res.data.stock || []);
    } catch (err) {
      setError("Could not load cylinder stock.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const totals = stock.reduce(
    (acc, item) => {
      acc.total += item.total;
      acc.available += item.available;
      acc.reserved += item.reserved;
      return acc;
    },
    { total: 0, available: 0, reserved: 0 }
  );

  return (
    <div className="dashboard-content">
      <div className="container-fluid">

        {/* Page heading */}
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-boxes"></i>
            </span>
            <div>
              <span className="eyebrow">Inventory Management</span>
              <h1>Cylinder Stock</h1>
              <p className="text-muted mb-0">
                Live stock levels across all cylinder categories.
              </p>
            </div>
          </div>

          <div className="heading-actions">
            <button className="btn btn-outline-secondary" onClick={fetchStock} disabled={loading}>
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
            <button className="btn btn-primary text-white" onClick={() => navigate("/restock-cylinders")}>
              <i className="bi bi-plus-lg"></i> Restock
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {/* Summary metric cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="metric-card metric-primary">
              <div className="metric-top">
                <span className="metric-label">Total Capacity</span>
                <span className="metric-icon">
                  <i className="bi bi-stack"></i>
                </span>
              </div>
              <div className="metric-value">{loading ? "—" : totals.total}</div>
              <div className="metric-meta">Across all categories</div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="metric-card metric-success">
              <div className="metric-top">
                <span className="metric-label">Available</span>
                <span className="metric-icon">
                  <i className="bi bi-check-circle"></i>
                </span>
              </div>
              <div className="metric-value">{loading ? "—" : totals.available}</div>
              <div className="metric-meta">Ready to dispatch</div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="metric-card metric-warning">
              <div className="metric-top">
                <span className="metric-label">Reserved / Out</span>
                <span className="metric-icon">
                  <i className="bi bi-truck"></i>
                </span>
              </div>
              <div className="metric-value">{loading ? "—" : totals.reserved}</div>
              <div className="metric-meta">Booked or in transit</div>
            </div>
          </div>
        </div>

        {/* Category breakdown panel */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="section-title" style={{ fontSize: "1.1rem", margin: 0 }}>
                <i className="bi bi-grid-1x2"></i> Stock by Category
              </h2>
              <p className="text-muted mb-0">All cylinder types currently tracked</p>
            </div>
          </div>

          {loading ? (
            <p className="text-muted mb-0 py-3">Loading stock…</p>
          ) : stock.length === 0 ? (
            <p className="text-muted mb-0 py-3">
              No cylinder types found. Run the seed script to initialize inventory.
            </p>
          ) : (
            <div className="row g-3">
              {stock.map((item) => {
                const level = getStockLevel(item);
                const meta = levelMeta[level];
                const percentFull = item.total > 0 ? Math.round((item.available / item.total) * 100) : 0;

                return (
                  <div className="col-12 col-md-6 col-lg-4" key={item.id}>
                    <div
                      className="mini-card"
                      style={{ display: "grid", gap: "0.75rem", minHeight: "auto", padding: "1.1rem" }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <span className="nav-icon" style={{ width: 34, height: 34, fontSize: "1rem" }}>
                            <i className={`bi ${item.icon}`}></i>
                          </span>
                          <div>
                            <strong style={{ display: "block", fontSize: "0.98rem" }}>
                              {item.label}
                            </strong>
                            <span>{item.weight}</span>
                          </div>
                        </div>

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
                      </div>

                      <div className="d-flex justify-content-between" style={{ fontSize: "0.88rem" }}>
                        <span className="text-muted">Available</span>
                        <strong>{item.available} / {item.total}</strong>
                      </div>

                      <div className="chart-bar-wrap" style={{ height: 10 }}>
                        <span
                          className="chart-bar"
                          style={{
                            "--bar-size": `${percentFull}%`,
                            background: `var(${meta.var})`,
                            boxShadow: "none",
                          }}
                        ></span>
                      </div>

                      <div className="d-flex justify-content-between" style={{ fontSize: "0.82rem" }}>
                        <span className="text-muted">Reserved: {item.reserved}</span>
                        <strong>₹{item.price}</strong>
                      </div>

                      {level === "critical" && (
                        <div
                          className="alert alert-danger mb-0"
                          style={{ padding: "0.5rem 0.7rem", fontSize: "0.78rem" }}
                        >
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Below threshold ({item.lowStockThreshold}) — restock needed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default CylinderStock;