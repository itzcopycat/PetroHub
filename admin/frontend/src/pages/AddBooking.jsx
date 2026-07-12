import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddBooking() {
  const [consumers, setConsumers] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [form, setForm] = useState({
    consumer: "",
    cylinderType: "14.2kg",
    quantity: 1,
    deliveryAddress: { line1: "", line2: "", city: "", state: "", pincode: "" },
  });
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    const fetchConsumers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/consumers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConsumers(res.data.consumers || []);
      } catch (err) {
        setError("Could not load consumers list");
      }
    };
    fetchConsumers();
  }, []);

  const handleConsumerChange = (e) => {
    const id = e.target.value;
    const consumer = consumers.find((c) => c._id === id);
    setSelectedConsumer(consumer || null);

    setForm((prev) => ({
      ...prev,
      consumer: id,
      cylinderType: consumer?.cylinderSize || "14.2kg",
      quantity: consumer?.cylinderCount === "Double" ? 2 : 1,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      deliveryAddress: { ...prev.deliveryAddress, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.consumer) {
      setError("Please select a consumer");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (useProfileAddress) {
        delete payload.deliveryAddress; // let backend fill from consumer profile
      }

      await axios.post("http://localhost:3000/api/bookings", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/lpg-bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-ticket-perforated" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">New Booking</h1>
              <p className="text-muted mb-0">
                Create a cylinder booking on behalf of a consumer.
              </p>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-person-check" aria-hidden="true" />
                  <span>Select Consumer</span>
                </h2>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Consumer</label>
                <select
                  className="form-select"
                  value={form.consumer}
                  onChange={handleConsumerChange}
                  required
                >
                  <option value="">-- Select a consumer --</option>
                  {consumers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.consumerId}) — {c.mobileNumber}
                    </option>
                  ))}
                </select>
              </div>

              {selectedConsumer && (
                <div className="col-12 col-md-6">
                  <div className="mini-card">
                    <span>Registered connection</span>
                    <strong>
                      {selectedConsumer.cylinderSize} ·{" "}
                      {selectedConsumer.cylinderCount} Cylinder
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-fire" aria-hidden="true" />
                  <span>Booking Details</span>
                </h2>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Cylinder Type</label>
                <select
                  className="form-select"
                  value={form.cylinderType}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, cylinderType: e.target.value }))
                  }
                >
                  <option>14.2kg</option>
                  <option>19kg</option>
                  <option>5kg</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          </section>

          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                  <span>Delivery Address</span>
                </h2>
              </div>
            </div>
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="useProfileAddress"
                checked={useProfileAddress}
                onChange={(e) => setUseProfileAddress(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="useProfileAddress">
                Use consumer's registered address
              </label>
            </div>

            {!useProfileAddress && (
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Address Line 1</label>
                  <input
                    className="form-control"
                    name="line1"
                    value={form.deliveryAddress.line1}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Address Line 2</label>
                  <input
                    className="form-control"
                    name="line2"
                    value={form.deliveryAddress.line2}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">City</label>
                  <input
                    className="form-control"
                    name="city"
                    value={form.deliveryAddress.city}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">State</label>
                  <input
                    className="form-control"
                    name="state"
                    value={form.deliveryAddress.state}
                    onChange={handleAddressChange}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">Pincode</label>
                  <input
                    className="form-control"
                    name="pincode"
                    value={form.deliveryAddress.pincode}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
            )}
          </section>

          <div className="heading-actions mt-3 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/lpgbookings")}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddBooking;