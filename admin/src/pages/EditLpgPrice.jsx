import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Mock data — replace with a real API call later
const initialPrices = [
  {
    id: "mini",
    label: "Mini Cylinder",
    weight: "5 kg",
    icon: "bi-droplet-half",
    price: 450,
    lastUpdated: "10 July 2026",
  },
  {
    id: "domestic",
    label: "Domestic Cylinder",
    weight: "14.2 kg",
    icon: "bi-fire",
    price: 850,
    lastUpdated: "10 July 2026",
  },
  {
    id: "commercial",
    label: "Commercial Cylinder",
    weight: "19 kg",
    icon: "bi-building",
    price: 1750,
    lastUpdated: "10 July 2026",
  },
];

function EditLpgPrice() {
  const navigate = useNavigate();
  

  const [prices, setPrices] = useState(initialPrices);
  const [editingId, setEditingId] = useState(null);
  const [draftPrice, setDraftPrice] = useState("");
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraftPrice(item.price);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftPrice("");
  };

  const saveEdit = (item) => {
    const newPrice = Number(draftPrice);
    if (!newPrice || newPrice <= 0 || newPrice === item.price) {
      cancelEdit();
      return;
    }

    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    setPrices((prev) =>
      prev.map((p) =>
        p.id === item.id ? { ...p, price: newPrice, lastUpdated: today } : p
      )
    );

    setHistory((prev) => [
      {
        id: `PR${Math.floor(2026000 + Math.random() * 999)}`,
        category: `${item.label} (${item.weight})`,
        oldPrice: item.price,
        newPrice,
        date: today,
      },
      ...prev,
    ]);

    setToast(`${item.label} price updated to ₹${newPrice}`);
    setTimeout(() => setToast(null), 2500);

    cancelEdit();
  };

  return (
    <div className="dashboard-content">
      <div className="container-fluid">

        {/* Page heading */}
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-currency-rupee"></i>
            </span>
            <div>
              <span className="eyebrow">Inventory Management</span>
              <h1>Edit LPG Price</h1>
              <p className="text-muted mb-0">
                Update cylinder prices across all categories.
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

        {/* Price cards — same category grid pattern as Cylinder Stock */}
        <div className="panel mb-4">
          <div className="panel-header">
            <div>
              <h2 className="section-title" style={{ fontSize: "1.1rem", margin: 0 }}>
                <i className="bi bi-grid-1x2"></i> Cylinder Pricing
              </h2>
              <p className="text-muted mb-0">Mini, Domestic and Commercial cylinders</p>
            </div>
          </div>

          <div className="row g-3">
            {prices.map((item) => {
              const isEditing = editingId === item.id;

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
                        <div>
                          <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                            New Price (₹)
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={draftPrice}
                            onChange={(e) => setDraftPrice(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary text-white"
                            style={{ flex: 1 }}
                            onClick={() => saveEdit(item)}
                          >
                            <i className="bi bi-check-lg"></i> Save
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            style={{ flex: 1 }}
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-baseline">
                          <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                            Current Price
                          </span>
                          <span style={{ fontSize: "1.4rem", fontWeight: 800 }}>
                            ₹{item.price}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between" style={{ fontSize: "0.78rem" }}>
                          <span className="text-muted">Last updated</span>
                          <span>{item.lastUpdated}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price change history */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="section-title" style={{ fontSize: "1.1rem", margin: 0 }}>
                <i className="bi bi-clock-history"></i> Price Change History
              </h2>
              <p className="text-muted mb-0">Recent price updates across categories</p>
            </div>
          </div>

          {history.length === 0 ? (
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              No price changes yet in this session.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Change ID</th>
                    <th>Category</th>
                    <th>Old Price</th>
                    <th>New Price</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.id}</td>
                      <td>{entry.category}</td>
                      <td>₹{entry.oldPrice}</td>
                      <td>
                        <strong
                          style={{
                            color:
                              entry.newPrice > entry.oldPrice
                                ? "var(--admin-danger)"
                                : "var(--admin-success)",
                          }}
                        >
                          ₹{entry.newPrice}
                        </strong>
                      </td>
                      <td>{entry.date}</td>
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