import { useEffect, useMemo, useState } from "react";
import axios from "axios";

// Mock delivery partner data — swap this out for your API call once a
// Delivery Partner model/route exists on the server.
const INITIAL_PARTNERS = [
  {
    id: "DP-1042",
    name: "Ravi Kumar Sharma",
    phone: "+91 98765 43210",
    area: "Shrirampur, Zone 3",
    capacity: 45,
    rating: 4.8,
  },
  {
    id: "DP-1043",
    name: "Anita Das",
    phone: "+91 91234 56789",
    area: "Hooghly North",
    capacity: 30,
    rating: 4.5,
  },
  {
    id: "DP-1044",
    name: "Suresh Patel",
    phone: "+91 99887 66554",
    area: "Bandel, Zone 1",
    capacity: 60,
    rating: 4.2,
  },
  {
    id: "DP-1045",
    name: "Meena Roy",
    phone: "+91 90123 45678",
    area: "Rishra East",
    capacity: 25,
    rating: 3.9,
  },
  {
    id: "DP-1046",
    name: "Arjun Ghosh",
    phone: "+91 98111 22334",
    area: "Serampore Central",
    capacity: 50,
    rating: 4.7,
  },
];

const emptyForm = {
  name: "",
  phone: "",
  area: "",
  capacity: "",
  rating: "",
};

function ratingBadgeClass(rating) {
  if (rating >= 4.5) return "text-bg-success";
  if (rating >= 4) return "text-bg-primary";
  if (rating >= 3) return "text-bg-warning";
  return "text-bg-danger";
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function nextId(partners) {
  const max = partners.reduce((acc, p) => {
    const n = parseInt(p.id.replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? acc : Math.max(acc, n);
  }, 1041);
  return `DP-${max + 1}`;
}

function Delivery() {
  // ---- Delivery partner directory (mock data) ----
  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // ---- Pending bookings needing assignment (real API) ----
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState("");
  const [assignSelections, setAssignSelections] = useState({});
  const [assigningId, setAssigningId] = useState(null);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const filteredPartners = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter((p) =>
      [p.id, p.name, p.phone, p.area].some((field) =>
        field.toLowerCase().includes(q)
      )
    );
  }, [partners, query]);

  const fetchPendingBookings = async () => {
    setLoadingBookings(true);
    setBookingError("");
    try {
      const res = await axios.get("http://localhost:3000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data.bookings || res.data;
      setPendingBookings(all.filter((b) => b.status === "Pending"));
    } catch (err) {
      setBookingError(
        err.response?.data?.message || "Could not load pending deliveries"
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  function handleAssignSelect(bookingId, partnerName) {
    setAssignSelections((prev) => ({ ...prev, [bookingId]: partnerName }));
  }

  async function handleAssign(bookingId) {
    const agentName = assignSelections[bookingId];
    if (!agentName) return;

    setAssigningId(bookingId);
    try {
      await axios.patch(
        `http://localhost:3000/api/bookings/${bookingId}`,
        { assignedDeliveryAgent: agentName, status: "Confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Assigned bookings move out of "Pending" — drop them from this list.
      setPendingBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign delivery partner");
    } finally {
      setAssigningId(null);
    }
  }

  function openModal() {
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  function handleFormChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleAddPartner(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.area.trim()) {
      setFormError("Name, phone number, and serviceable area are required.");
      return;
    }

    const capacityNum = Number(form.capacity);
    const ratingNum = Number(form.rating);

    const newPartner = {
      id: nextId(partners),
      name: form.name.trim(),
      phone: form.phone.trim(),
      area: form.area.trim(),
      capacity: Number.isFinite(capacityNum) && capacityNum > 0 ? capacityNum : 0,
      rating: Number.isFinite(ratingNum) && ratingNum > 0 ? Math.min(ratingNum, 5) : 0,
    };

    setPartners((prev) => [newPartner, ...prev]);
    setShowModal(false);
  }

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-truck" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow mb-1">Delivery</p>
              <h1 className="h3 mb-1">Delivery Partners</h1>
              <p className="text-muted mb-0">
                Manage your partner directory and assign pending deliveries.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={openModal}>
              <i className="bi bi-plus-lg" aria-hidden="true" /> Add new Delivery partner
            </button>
          </div>
        </div>

        {/* ---------------- Assign pending deliveries ---------------- */}
        <section className="panel mt-3">
          <div className="panel-header">
            <div>
              <h2
                className="section-title mb-1"
                style={{ fontSize: "1.05rem", fontWeight: 800, whiteSpace: "nowrap" }}
              >
                <i className="bi bi-signpost-split" aria-hidden="true" />
                Assign Pending Deliveries
              </h2>
              <p className="text-muted mb-0">
                {pendingBookings.length} booking
                {pendingBookings.length === 1 ? "" : "s"} waiting for a delivery partner
              </p>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm"
              type="button"
              onClick={fetchPendingBookings}
            >
              <i className="bi bi-arrow-clockwise" aria-hidden="true" /> Refresh
            </button>
          </div>

          {bookingError && (
            <div className="alert alert-danger py-2 mb-3">{bookingError}</div>
          )}

          {loadingBookings ? (
            <div className="blank-panel">
              <div className="blank-state">
                <p className="text-muted mb-0">Loading pending deliveries…</p>
              </div>
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="blank-panel">
              <div className="blank-state">
                <p className="text-muted mb-0">
                  No pending deliveries right now — nice and clear.
                </p>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">Booking ID</th>
                    <th scope="col">Consumer</th>
                    <th scope="col">Cylinder</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Delivery Address</th>
                    <th scope="col">Assign to</th>
                    <th scope="col" className="text-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="fw-semibold">{booking.bookingId}</td>
                      <td>
                        <p className="fw-semibold mb-0">{booking.consumerName}</p>
                        <p className="text-muted small mb-0">{booking.phone}</p>
                      </td>
                      <td>{booking.cylinderType}</td>
                      <td>{booking.quantity}</td>
                      <td className="text-muted small">
                        {[
                          booking.deliveryAddress?.line1,
                          booking.deliveryAddress?.city,
                          booking.deliveryAddress?.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          style={{ minWidth: "170px" }}
                          value={assignSelections[booking._id] || ""}
                          onChange={(e) =>
                            handleAssignSelect(booking._id, e.target.value)
                          }
                          disabled={assigningId === booking._id}
                        >
                          <option value="">Select partner…</option>
                          {partners.map((partner) => (
                            <option key={partner.id} value={partner.name}>
                              {partner.name} · {partner.area}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={
                            !assignSelections[booking._id] ||
                            assigningId === booking._id
                          }
                          onClick={() => handleAssign(booking._id)}
                        >
                          {assigningId === booking._id ? "Assigning…" : "Assign"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ---------------- Partner directory ---------------- */}
        <section className="panel mt-3">
          <div className="panel-header">
            <div>
              <h2
                className="section-title mb-1"
                style={{ fontSize: "1.05rem", fontWeight: 800, whiteSpace: "nowrap" }}
              >
                <i className="bi bi-people" aria-hidden="true" />
                All partners
              </h2>
              <p className="text-muted mb-0">
                {filteredPartners.length} of {partners.length} partners shown
              </p>
            </div>
            <input
              type="search"
              className="form-control form-control-sm table-search"
              placeholder="Search by name, ID, phone, or area"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search delivery partners"
            />
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Partner</th>
                  <th scope="col">ID</th>
                  <th scope="col">Phone Number</th>
                  <th scope="col">Serviceable Area</th>
                  <th scope="col">Delivery Capacity</th>
                  <th scope="col">Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredPartners.map((partner) => (
                  <tr key={partner.id}>
                    <td>
                      <div className="table-media">
                        <span className="profile-avatar avatar-sm">
                          {initials(partner.name)}
                        </span>
                        <strong>{partner.name}</strong>
                      </div>
                    </td>
                    <td className="text-muted">{partner.id}</td>
                    <td>{partner.phone}</td>
                    <td>{partner.area}</td>
                    <td>{partner.capacity} cylinders/day</td>
                    <td>
                      <span className={`badge ${ratingBadgeClass(partner.rating)}`}>
                        <i className="bi bi-star-fill" aria-hidden="true" />{" "}
                        {partner.rating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredPartners.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No delivery partners match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showModal && (
          <>
            <div
              className="modal fade show"
              style={{ display: "block" }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="addPartnerModalTitle"
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <form onSubmit={handleAddPartner}>
                    <div className="modal-header">
                      <h5 className="modal-title" id="addPartnerModalTitle">
                        Add new Delivery partner
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={closeModal}
                      />
                    </div>
                    <div className="modal-body">
                      {formError && (
                        <div className="alert alert-danger" role="alert">
                          {formError}
                        </div>
                      )}
                      <div className="mb-3">
                        <label className="form-label" htmlFor="partnerName">
                          Full name
                        </label>
                        <input
                          id="partnerName"
                          type="text"
                          className="form-control"
                          placeholder="e.g. Priya Nair"
                          value={form.name}
                          onChange={handleFormChange("name")}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="partnerPhone">
                          Phone number
                        </label>
                        <input
                          id="partnerPhone"
                          type="tel"
                          className="form-control"
                          placeholder="e.g. +91 90000 00000"
                          value={form.phone}
                          onChange={handleFormChange("phone")}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="partnerArea">
                          Serviceable area
                        </label>
                        <input
                          id="partnerArea"
                          type="text"
                          className="form-control"
                          placeholder="e.g. Serampore Central"
                          value={form.area}
                          onChange={handleFormChange("area")}
                        />
                      </div>
                      <div className="row">
                        <div className="col-6 mb-3">
                          <label className="form-label" htmlFor="partnerCapacity">
                            Delivery capacity (per day)
                          </label>
                          <input
                            id="partnerCapacity"
                            type="number"
                            min="0"
                            className="form-control"
                            placeholder="e.g. 40"
                            value={form.capacity}
                            onChange={handleFormChange("capacity")}
                          />
                        </div>
                        <div className="col-6 mb-3">
                          <label className="form-label" htmlFor="partnerRating">
                            Rating (0-5)
                          </label>
                          <input
                            id="partnerRating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            className="form-control"
                            placeholder="e.g. 4.5"
                            value={form.rating}
                            onChange={handleFormChange("rating")}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Add partner
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show" onClick={closeModal} />
          </>
        )}
      </div>
    </main>
  );
}

export default Delivery;