import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const STATUS_OPTIONS = ["Pending", "Delivered", "Cancelled"];

function getStatusBadgeClass(status) {
  switch (status) {
    case "Delivered":
      return "badge text-bg-success";
    case "Pending":
      return "badge text-bg-warning";
    case "Cancelled":
      return "badge text-bg-danger";
    default:
      return "badge text-bg-secondary";
  }
}

function LpgBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.bookings || res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load bookings from server"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await axios.patch(
        `http://localhost:3000/api/bookings/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to update booking status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const term = search.toLowerCase();
    return (
      b.consumerName?.toLowerCase().includes(term) ||
      b.phone?.toLowerCase().includes(term) ||
      b.bookingId?.toLowerCase().includes(term)
    );
  });

  const summary = {
    total: bookings.length,
    delivered: bookings.filter((b) => b.status === "Delivered").length,
    pending: bookings.filter((b) => b.status === "Pending").length,
    cancelled: bookings.filter((b) => b.status === "Cancelled").length,
  };

  return (
    <>
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="page-heading">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-ticket" aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow mb-1">Management</p>
                <h1 className="h3 mb-1">LPG Bookings</h1>
                <p className="text-muted mb-0">
                  Review, filter, and manage cylinder booking requests.
                </p>
              </div>
            </div>
            <div className="heading-actions">
              <Link className="btn btn-primary btn-sm" to="/addbooking">
                <i className="bi bi-plus-lg" aria-hidden="true" /> New Booking
              </Link>
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={fetchBookings}
              >
                <i className="bi bi-arrow-clockwise" aria-hidden="true" /> Refresh
              </button>
            </div>
          </div>
          <section className="row g-3 mt-1" aria-label="Booking summary">
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-primary">
                <div className="metric-top">
                  <span className="metric-label">Total Bookings</span>
                  <span className="metric-icon">
                    <i className="bi bi-ticket-perforated" aria-hidden="true" />
                  </span>
                </div>
                <div className="metric-value">{summary.total}</div>
                <div className="metric-meta">
                  <span>all-time records</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-success">
                <div className="metric-top">
                  <span className="metric-label">Delivered</span>
                  <span className="metric-icon">
                    <i className="bi bi-check2-circle" aria-hidden="true" />
                  </span>
                </div>
                <div className="metric-value">{summary.delivered}</div>
                <div className="metric-meta">
                  <span>Deliveries Done</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-warning">
                <div className="metric-top">
                  <span className="metric-label">Pending</span>
                  <span className="metric-icon">
                    <i className="bi bi-hourglass-split" aria-hidden="true" />
                  </span>
                </div>
                <div className="metric-value">{summary.pending}</div>
                <div className="metric-meta">
                  <span>need review</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-danger">
                <div className="metric-top">
                  <span className="metric-label">Cancelled</span>
                  <span className="metric-icon">
                    <i className="bi bi-slash-circle" aria-hidden="true" />
                  </span>
                </div>
                <div className="metric-value">{summary.cancelled}</div>
                <div className="metric-meta">
                  <span>this month</span>
                </div>
              </article>
            </div>
          </section>

          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true" />
                  <span>Booking List</span>
                </h2>
                <p className="text-muted mb-0">
                  Search bookings and update their delivery status.
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <input
                  className="form-control form-control-sm table-search"
                  type="search"
                  placeholder="Search by name, phone, booking ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search bookings"
                />
              </div>
            </div>

            {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

            {loading ? (
              <div className="blank-panel">
                <div className="blank-state">
                  <p className="text-muted mb-0">Loading bookings…</p>
                </div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="blank-panel">
                <div className="blank-state">
                  <p className="text-muted mb-0">No bookings found.</p>
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
                      <th scope="col">Booked On</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-end">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="fw-semibold">{booking.bookingId}</td>
                        <td>
                          <div>
                            <p className="fw-semibold mb-0">
                              {booking.consumerName}
                            </p>
                            <p className="text-muted small mb-0">
                              {booking.phone}
                            </p>
                          </div>
                        </td>
                        <td>{booking.cylinderType}</td>
                        <td>{booking.quantity}</td>
                        <td>
                          {booking.bookingDate
                            ? new Date(booking.bookingDate).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short", year: "numeric" }
                              )
                            : "—"}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(booking.status)}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <select
                            className="form-select form-select-sm d-inline-block w-auto"
                            value={booking.status}
                            disabled={updatingId === booking._id}
                            onChange={(e) =>
                              handleStatusChange(booking._id, e.target.value)
                            }
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mt-3">
              <p className="text-muted small mb-0">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default LpgBookings;