import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const CYLINDER_LABELS = {
  "14.2kg": "Domestic (14.2 kg)",
  "19kg": "Commercial (19 kg)",
  "5kg": "Mini (5 kg)",
  "5kg-ftl": "Mini FTL (5 kg)",
  "5kg-domestic": "Mini Domestic (5 kg)",
};

const steps = ["Pending", "Confirmed", "Delivered"];
const stepLabels = {
  Pending: "Order Placed",
  Confirmed: "Agent Assigned",
  Delivered: "Delivered",
};

const RATING_LABELS = {
  1: "Very Poor",
  2: "Poor",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAddress(addr) {
  if (!addr) return "—";
  const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function StarIcon({ filled, size = 30 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 2.9l2.79 5.94 6.51.67-4.86 4.5 1.35 6.42L12 17.35l-5.79 3.08 1.35-6.42-4.86-4.5 6.51-.67L12 2.9z"
        fill={filled ? "url(#starGradientTrack)" : "#E7E9ED"}
        stroke={filled ? "#E8791A" : "#C9CED6"}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="starGradientTrack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB648" />
          <stop offset="100%" stopColor="#FF7A1A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TrackOrder() {
  // ---- Lookup form ----
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // ---- Actions on the tracked order ----
  const [cancelling, setCancelling] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  async function fetchBooking(id, phone) {
    setLoading(true);
    setLookupError("");
    try {
      const res = await axios.get(
        `${API_BASE}/api/bookings/track/${encodeURIComponent(id)}`,
        { params: { phone } }
      );
      setOrder(res.data.booking);
      setHasRated(Boolean(res.data.booking.rating));
    } catch (err) {
      setOrder(null);
      setLookupError(
        err.response?.data?.message ||
          "Could not find that booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleTrack(e) {
    e.preventDefault();
    const id = bookingIdInput.trim();
    const phone = phoneInput.trim();
    if (!id || !phone) {
      setLookupError("Enter both your Booking ID and registered phone number.");
      return;
    }
    fetchBooking(id, phone);
  }

  function authHeaders() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }

  async function handleCancelConfirm() {
    const headers = authHeaders();
    if (!headers) {
      alert("Please log in to your account to cancel this booking.");
      setShowCancelModal(false);
      return;
    }
    setCancelling(true);
    try {
      await axios.patch(
        `${API_BASE}/api/bookings/${order._id}`,
        { status: "Cancelled" },
        { headers }
      );
      await fetchBooking(order.bookingId, phoneInput.trim());
      setShowCancelModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel order. Try again.");
    } finally {
      setCancelling(false);
    }
  }

  // 🔧 Hook this up once your backend's /api/bookings/:id/report route exists
  // (same endpoint referenced in Orders.jsx — it isn't implemented yet).
  async function handleReportSubmit(e) {
    e.preventDefault();
    const headers = authHeaders();
    if (!headers) {
      alert("Please log in to your account to report a problem.");
      return;
    }
    setReporting(true);
    try {
      await axios.post(
        `${API_BASE}/api/bookings/${order._id}/report`,
        { reason: reportReason },
        { headers }
      );
      setReportSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit report. Try again.");
    } finally {
      setReporting(false);
    }
  }

  function closeReportModal() {
    setShowReportModal(false);
    setReportReason("");
    setReportSubmitted(false);
  }

  function closeRateModal() {
    setShowRateModal(false);
    setSelectedRating(0);
    setHoverRating(0);
  }

  async function handleRateSubmit(e) {
    e.preventDefault();
    if (!selectedRating || hasRated) return;
    const headers = authHeaders();
    if (!headers) {
      alert("Please log in to your account to rate this delivery.");
      return;
    }
    setRatingSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/api/bookings/${order._id}/rate`,
        { rating: selectedRating },
        { headers }
      );

      // Re-sync the tracked booking from the backend (source of truth)
      // instead of just flipping local state — guarantees that re-tracking
      // this same booking always shows it as already rated.
      await fetchBooking(order.bookingId, phoneInput.trim());
      setHasRated(true);
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit rating. Try again.");
    } finally {
      setRatingSubmitting(false);
    }
  }

  const isCancelled = order?.status === "Cancelled";
  const isDelivered = order?.status === "Delivered";
  const currentStepIndex = order ? steps.indexOf(order.status) : -1;
  const showDeliveryPartner = Boolean(order?.deliveryPartner || order?.assignedDeliveryAgent);

  const priceBreakup = order?.priceBreakup || null;

  return (
    <div className="track-page">
      <div className="track-card">
        <h1>Track Your LPG Order</h1>

        <p className="track-subtitle">
          Enter your Booking ID and registered phone number to check the
          current delivery status.
        </p>

        <form className="track-search" onSubmit={handleTrack}>
          <input
            type="text"
            placeholder="Enter Booking ID (Example: PH-BK-2026-00028)"
            value={bookingIdInput}
            onChange={(e) => setBookingIdInput(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Registered phone number"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Tracking…" : "Track Order"}
          </button>
        </form>

        {lookupError && <p className="track-error">{lookupError}</p>}

        {order && (
          <div className="tracking-result">
            <div className="booking-header">
              <h2>Booking Details</h2>
            </div>

            <div className="details-grid">
              <div>
                <span>Booking ID</span>
                <h4>{order.bookingId}</h4>
              </div>

              <div>
                <span>Booking Date</span>
                <h4>{formatDate(order.bookingDate)}</h4>
              </div>

              <div>
                <span>Cylinder</span>
                <h4>
                  {CYLINDER_LABELS[order.cylinderType] || order.cylinderType}
                  {order.quantity > 1 ? ` × ${order.quantity}` : ""}
                </h4>
              </div>

              <div>
                <span>Preferred Delivery Date</span>
                <h4>{formatDate(order.preferredDeliveryDate)}</h4>
              </div>

              <div>
                <span>Delivery Address</span>
                <h4>{formatAddress(order.deliveryAddress)}</h4>
              </div>

              <div>
                <span>Payment Method</span>
                <h4>{order.paymentMethod}</h4>
              </div>

              <div>
                <span>Payment Status</span>
                <h4>{order.paymentStatus}</h4>
              </div>

              {order.deliveredAt && (
                <div>
                  <span>Delivered On</span>
                  <h4>{formatDate(order.deliveredAt)}</h4>
                </div>
              )}
            </div>

            {/* Price Breakup — real snapshot from the booking */}
            <div className="price-box">
              <h3>Price Summary</h3>

              {priceBreakup ? (
                <>
                  <div className="price-row">
                    <span>
                      Cylinder Price{order.quantity > 1 ? ` (× ${order.quantity})` : ""}
                    </span>
                    <span>₹{priceBreakup.cylinderPrice}</span>
                  </div>

                  <div className="price-row">
                    <span>Delivery Fee</span>
                    <span>₹{priceBreakup.deliveryFee}</span>
                  </div>

                  <div className="price-row">
                    <span>Platform Fee</span>
                    <span>₹{priceBreakup.platformFee}</span>
                  </div>

                  <div className="price-row">
                    <span>GST & Taxes ({priceBreakup.taxRatePercent}%)</span>
                    <span>₹{priceBreakup.taxAmount}</span>
                  </div>

                  <div className="price-row total">
                    <span>Total Amount</span>
                    <span>₹{priceBreakup.total}</span>
                  </div>
                </>
              ) : (
                // Legacy bookings created before priceBreakup existed
                <div className="price-row total">
                  <span>Total Amount</span>
                  <span>{order.price > 0 ? `₹${order.price}` : "To be confirmed"}</span>
                </div>
              )}
            </div>

            {order.specialInstructions && (
              <div className="delivery-box">
                <h3>Special Instructions</h3>
                <p>{order.specialInstructions}</p>
              </div>
            )}

            {!isCancelled ? (
              <>
                {/* Progress bar */}
                <div className="progress-box">
                  <h3>Order Status</h3>
                  <div className="progress-bar">
                    {steps.map((step, index) => (
                      <div
                        key={step}
                        className={
                          "progress-step " + (index <= currentStepIndex ? "completed" : "")
                        }
                      >
                        <div className="progress-dot">
                          {index <= currentStepIndex ? "✓" : index + 1}
                        </div>
                        <p>{stepLabels[step]}</p>
                        {index < steps.length - 1 && (
                          <div
                            className={
                              "progress-line " + (index < currentStepIndex ? "filled" : "")
                            }
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery partner — only once assigned, with live rating */}
                {showDeliveryPartner && (
                  <div className="delivery-box delivery-box-with-rating">
                    <div>
                      <h3>Delivery Partner</h3>
                      <p>
                        <strong>Name:</strong>{" "}
                        {order.deliveryPartner?.name || order.assignedDeliveryAgent}
                      </p>
                      {order.deliveryPartner?.phone && (
                        <p>
                          <strong>Phone:</strong> {order.deliveryPartner.phone}
                        </p>
                      )}
                    </div>

                    {typeof order.deliveryPartner?.rating === "number" && (
                      <div
                        className="partner-rating-pill"
                        title="Delivery partner's overall rating"
                      >
                        <StarIcon filled size={16} />
                        <span>{order.deliveryPartner.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="track-actions">
                  <button className="report-btn" onClick={() => setShowReportModal(true)}>
                    ⚠ Report a Problem
                  </button>

                  {isDelivered ? (
                    <button
                      className={`rate-btn${hasRated ? " is-rated" : ""}`}
                      onClick={() => {
                        if (!hasRated) setShowRateModal(true);
                      }}
                      disabled={hasRated}
                    >
                      {hasRated ? (
                        "✓ Experience Rated"
                      ) : (
                        <>
                          <StarIcon filled size={16} /> Rate Delivery Experience
                        </>
                      )}
                    </button>
                  ) : (
                    (order.status === "Pending" || order.status === "Confirmed") && (
                      <button
                        className="cancel-btn"
                        onClick={() => setShowCancelModal(true)}
                        disabled={cancelling}
                      >
                        {cancelling ? "Cancelling…" : "✖ Cancel Booking"}
                      </button>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="cancelled-box">
                <h3>✖ Order Cancelled</h3>
                <p>
                  {order.cancelReason ||
                    `Your booking ${order.bookingId} has been cancelled successfully.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel this order?</h3>
            <p>
              Are you sure you want to cancel booking {order?.bookingId}? This
              action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn-outline"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Order
              </button>
              <button
                className="modal-btn-danger"
                onClick={handleCancelConfirm}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report a problem modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={closeReportModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {!reportSubmitted ? (
              <>
                <h3>Report a Problem</h3>
                <p>Let us know what went wrong with booking {order?.bookingId}.</p>

                <form onSubmit={handleReportSubmit}>
                  <textarea
                    rows="4"
                    placeholder="Describe the issue (e.g. late delivery, damaged cylinder, wrong item)..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                  ></textarea>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="modal-btn-outline"
                      onClick={closeReportModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="modal-btn-primary" disabled={reporting}>
                      {reporting ? "Submitting…" : "Submit Report"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3>✅ Report Submitted</h3>
                <p>
                  Thanks for letting us know. Our support team will reach
                  out to you shortly regarding booking {order?.bookingId}.
                </p>
                <div className="modal-actions">
                  <button className="modal-btn-primary" onClick={closeReportModal}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rate Delivery Experience modal */}
      {showRateModal && (
        <div className="modal-overlay" onClick={closeRateModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {!hasRated ? (
              <>
                <h3>Rate Delivery Experience</h3>
                <p>How was your delivery for booking {order?.bookingId}?</p>

                <form onSubmit={handleRateSubmit}>
                  <div className="star-rating" role="radiogroup" aria-label="Delivery rating">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoverRating || selectedRating) >= star;
                      return (
                        <button
                          type="button"
                          key={star}
                          className={`star-btn${active ? " is-active" : ""}`}
                          aria-label={`${star} star${star > 1 ? "s" : ""}`}
                          aria-pressed={selectedRating === star}
                          onClick={() => setSelectedRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <StarIcon filled={active} />
                        </button>
                      );
                    })}
                  </div>

                  <p className="star-rating-caption">
                    {RATING_LABELS[hoverRating || selectedRating] || "Tap a star to rate"}
                  </p>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="modal-btn-outline"
                      onClick={closeRateModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="modal-btn-primary"
                      disabled={!selectedRating || ratingSubmitting}
                    >
                      {ratingSubmitting ? "Submitting…" : "Submit Rating"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3>✅ Thanks for rating!</h3>
                <p>
                  Your feedback for booking {order?.bookingId} has been
                  recorded and helps us keep delivery quality high.
                </p>
                <div className="modal-actions">
                  <button className="modal-btn-primary" onClick={closeRateModal}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackOrder;