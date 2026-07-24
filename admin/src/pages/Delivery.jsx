import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

const emptyForm = {
  name: "",
  phone: "",
  area: "",
  dailyCapacity: "",
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

function effectiveLoad(partner) {
  if (!partner.lastAssignedDate) return 0;
  const today = new Date().toDateString();
  const lastDate = new Date(partner.lastAssignedDate).toDateString();
  return lastDate === today ? partner.currentLoad : 0;
}

function availableToday(partner) {
  return Math.max(partner.dailyCapacity - effectiveLoad(partner), 0);
}

function capacityBadgeClass(partner) {
  const available = availableToday(partner);
  const ratio = available / partner.dailyCapacity;
  if (available === 0) return "text-bg-danger";
  if (ratio <= 0.25) return "text-bg-warning";
  return "text-bg-success";
}

function Delivery() {
  // ---- Delivery partner directory (real API) ----
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [partnerError, setPartnerError] = useState("");
  const [query, setQuery] = useState("");

  // Modal now serves both Add and Edit — editingPartner is null in Add mode,
  // or the partner object being edited.
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [savingPartner, setSavingPartner] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ---- Pending bookings needing assignment (real API) ----
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState("");
  const [assignSelections, setAssignSelections] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [assignError, setAssignError] = useState("");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const filteredPartners = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter((p) =>
      [p.partnerId, p.name, p.phone, p.area].some((field) =>
        field?.toLowerCase().includes(q)
      )
    );
  }, [partners, query]);

  const fetchPartners = async () => {
    setLoadingPartners(true);
    setPartnerError("");
    try {
      const res = await axios.get(`${API_BASE}/api/delivery-partners`, authHeaders);
      setPartners(res.data.partners || []);
    } catch (err) {
      setPartnerError(
        err.response?.data?.message || "Could not load delivery partners"
      );
    } finally {
      setLoadingPartners(false);
    }
  };

  const fetchPendingBookings = async () => {
    setLoadingBookings(true);
    setBookingError("");
    try {
      const res = await axios.get(`${API_BASE}/api/bookings`, authHeaders);
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
    fetchPartners();
    fetchPendingBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAssignSelect(bookingId, partnerId) {
    setAssignSelections((prev) => ({ ...prev, [bookingId]: partnerId }));
    setAssignError("");
  }

  async function handleAssign(bookingId) {
    const partnerId = assignSelections[bookingId];
    if (!partnerId) return;

    setAssigningId(bookingId);
    setAssignError("");
    try {
      await axios.post(
        `${API_BASE}/api/bookings/${bookingId}/assign`,
        { partnerId },
        authHeaders
      );
      setPendingBookings((prev) => prev.filter((b) => b._id !== bookingId));
      fetchPartners();
    } catch (err) {
      setAssignError(
        err.response?.data?.message || "Failed to assign delivery partner"
      );
    } finally {
      setAssigningId(null);
    }
  }

  function openAddModal() {
    setEditingPartner(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function openEditModal(partner) {
    setEditingPartner(partner);
    setForm({
      name: partner.name,
      phone: partner.phone,
      area: partner.area,
      dailyCapacity: partner.dailyCapacity,
      rating: partner.rating,
    });
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    if (savingPartner) return;
    setShowModal(false);
    setEditingPartner(null);
  }

  function handleFormChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmitPartner(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.area.trim() || !form.dailyCapacity) {
      setFormError("Name, phone number, serviceable area, and daily capacity are required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      area: form.area.trim(),
      dailyCapacity: Number(form.dailyCapacity),
      rating: form.rating ? Number(form.rating) : 0,
    };

    setSavingPartner(true);
    setFormError("");
    try {
      if (editingPartner) {
        const res = await axios.patch(
          `${API_BASE}/api/delivery-partners/${editingPartner._id}`,
          payload,
          authHeaders
        );
        setPartners((prev) =>
          prev.map((p) => (p._id === res.data.partner._id ? res.data.partner : p))
        );
      } else {
        const res = await axios.post(
          `${API_BASE}/api/delivery-partners`,
          payload,
          authHeaders
        );
        setPartners((prev) => [res.data.partner, ...prev]);
      }
      setShowModal(false);
      setEditingPartner(null);
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          `Failed to ${editingPartner ? "update" : "add"} delivery partner`
      );
    } finally {
      setSavingPartner(false);
    }
  }

  async function handleDeletePartner(partner) {
    const confirmed = window.confirm(
      `Delete ${partner.name} (${partner.partnerId})? This can't be undone.`
    );
    if (!confirmed) return;

    setDeletingId(partner._id);
    setPartnerError("");
    try {
      await axios.delete(`${API_BASE}/api/delivery-partners/${partner._id}`, authHeaders);
      setPartners((prev) => prev.filter((p) => p._id !== partner._id));
    } catch (err) {
      setPartnerError(err.response?.data?.message || "Failed to delete delivery partner");
    } finally {
      setDeletingId(null);
    }
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
            <button type="button" className="btn btn-primary btn-sm" onClick={openAddModal}>
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

          {bookingError && <div className="alert alert-danger py-2 mb-3">{bookingError}</div>}
          {assignError && <div className="alert alert-danger py-2 mb-3">{assignError}</div>}

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
                          style={{ minWidth: "200px" }}
                          value={assignSelections[booking._id] || ""}
                          onChange={(e) => handleAssignSelect(booking._id, e.target.value)}
                          disabled={assigningId === booking._id}
                        >
                          <option value="">Select partner…</option>
                          {partners.map((partner) => {
                            const available = availableToday(partner);
                            return (
                              <option
                                key={partner._id}
                                value={partner._id}
                                disabled={available === 0}
                              >
                                {partner.name} · {partner.area} ({available} left today)
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={
                            !assignSelections[booking._id] || assigningId === booking._id
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
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={fetchPartners}>
                <i className="bi bi-arrow-clockwise" aria-hidden="true" /> Refresh
              </button>
              <input
                type="search"
                className="form-control form-control-sm table-search"
                placeholder="Search by name, ID, phone, or area"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search delivery partners"
              />
            </div>
          </div>

          {partnerError && <div className="alert alert-danger py-2 mb-3">{partnerError}</div>}

          {loadingPartners ? (
            <div className="blank-panel">
              <div className="blank-state">
                <p className="text-muted mb-0">Loading delivery partners…</p>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">Partner</th>
                    <th scope="col">ID</th>
                    <th scope="col">Phone Number</th>
                    <th scope="col">Serviceable Area</th>
                    <th scope="col">Today's Load</th>
                    <th scope="col">Rating</th>
                    <th scope="col" className="text-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.map((partner) => (
                    <tr key={partner._id}>
                      <td>
                        <div className="table-media">
                          <span className="profile-avatar avatar-sm">
                            {initials(partner.name)}
                          </span>
                          <strong>{partner.name}</strong>
                        </div>
                      </td>
                      <td className="text-muted">{partner.partnerId}</td>
                      <td>{partner.phone}</td>
                      <td>{partner.area}</td>
                      <td>
                        <span className={`badge ${capacityBadgeClass(partner)}`}>
                          {availableToday(partner)} / {partner.dailyCapacity} left
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${ratingBadgeClass(partner.rating)}`}>
                          <i className="bi bi-star-fill" aria-hidden="true" /> {partner.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            aria-label={`Edit ${partner.name}`}
                            title="Edit"
                            onClick={() => openEditModal(partner)}
                          >
                            <i className="bi bi-pencil" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            aria-label={`Delete ${partner.name}`}
                            title="Delete"
                            disabled={deletingId === partner._id}
                            onClick={() => handleDeletePartner(partner)}
                          >
                            {deletingId === partner._id ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            ) : (
                              <i className="bi bi-trash" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredPartners.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        No delivery partners match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showModal && (
          <>
            <div
              className="modal fade show"
              style={{ display: "block" }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="partnerModalTitle"
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <form onSubmit={handleSubmitPartner}>
                    <div className="modal-header">
                      <h5 className="modal-title" id="partnerModalTitle">
                        {editingPartner ? `Edit ${editingPartner.name}` : "Add new Delivery partner"}
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
                            Daily delivery capacity
                          </label>
                          <input
                            id="partnerCapacity"
                            type="number"
                            min="1"
                            className="form-control"
                            placeholder="e.g. 40"
                            value={form.dailyCapacity}
                            onChange={handleFormChange("dailyCapacity")}
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
                        disabled={savingPartner}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={savingPartner}>
                        {savingPartner
                          ? editingPartner
                            ? "Saving…"
                            : "Adding…"
                          : editingPartner
                          ? "Save changes"
                          : "Add partner"}
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