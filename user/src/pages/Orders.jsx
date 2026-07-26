import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const RATING_LABELS = {
  1: "Very Poor",
  2: "Poor",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const statusMeta = {
  Pending: { label: "Pending", className: "badge-pending" },
  Confirmed: { label: "Confirmed", className: "badge-confirmed" },
  Delivered: { label: "Delivered", className: "badge-delivered" },
  Cancelled: { label: "Cancelled", className: "badge-cancelled" },
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
        fill={filled ? "url(#starGradient)" : "#E7E9ED"}
        stroke={filled ? "#E8791A" : "#C9CED6"}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="starGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB648" />
          <stop offset="100%" stopColor="#FF7A1A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Orders() {
  // ✅ ALL state and functions declared at the top — before any return
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/api/bookings/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(res.data.bookings || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Couldn't load your orders.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelOrder(orderId) {
    setCancelling(true);
    try {
      await axios.patch(
        `${API_BASE}/api/bookings/${orderId}`,
        { status: "Cancelled" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel order. Try again.");
    } finally {
      setCancelling(false);
    }
  }

  // 🔧 Hook this up to your backend's report/complaint endpoint
  async function reportOrder(orderId, reason) {
    setReporting(true);
    try {
      await axios.post(
        `${API_BASE}/api/bookings/${orderId}/report`,
        { reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit report. Try again.");
      return false;
    } finally {
      setReporting(false);
    }
  }

  // 🔧 Hook this up to your backend's rating endpoint. This also updates the
  // assigned delivery partner's aggregate rating, which is what powers the
  // "Rating" badge on the admin Delivery Partners screen.
  async function rateOrder(orderId, rating) {
    setRatingSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/api/bookings/${orderId}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      // Re-sync from the backend (source of truth) instead of trusting local
      // state. This guarantees that if the user navigates back to the list
      // and reopens this same order, it shows as already rated — closing
      // the window where a stale local copy could let them try again.
      const res = await axios.get(`${API_BASE}/api/bookings/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const freshOrders = res.data.bookings || [];
      setOrders(freshOrders);
      setSelectedOrder((prev) => freshOrders.find((o) => o._id === orderId) || prev);

      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit rating. Try again.");
      return false;
    } finally {
      setRatingSubmitting(false);
    }
  }

  const openOrder = (order) => setSelectedOrder(order);
  const goBack = () => setSelectedOrder(null);

  // ✅ Early returns come AFTER all hooks and functions
  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Loading your bookings…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>{error}</p>
        </div>
        <button className="btn-flame" onClick={fetchOrders}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {!selectedOrder ? (
        <>
          <div className="orders-header">
            <h1>My Orders</h1>
            <p>View your booking history and track any active order.</p>
          </div>

          {orders.length === 0 ? (
            <p>You haven't booked a cylinder yet.</p>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => {
                const meta = statusMeta[order.status] || {
                  label: order.status,
                  className: "badge-default",
                };
                return (
                  <div
                    key={order._id}
                    className="order-card"
                    onClick={() => openOrder(order)}
                  >
                    <div className="order-card-top">
                      <h3>#{order.bookingId}</h3>
                      <span className={`status-badge ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>

                    <p className="order-card-cylinder">
                      {CYLINDER_LABELS[order.cylinderType] || order.cylinderType}
                      {order.quantity > 1 ? ` × ${order.quantity}` : ""}
                    </p>

                    <div className="order-card-bottom">
                      <span>{formatDate(order.bookingDate)}</span>
                      <span className="view-details">View Details →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <OrderDetail
          order={selectedOrder}
          onBack={goBack}
          onCancel={cancelOrder}
          onReport={reportOrder}
          onRate={rateOrder}
          cancelling={cancelling}
          reporting={reporting}
          ratingSubmitting={ratingSubmitting}
        />
      )}
    </div>
  );
}

function OrderDetail({
  order,
  onBack,
  onCancel,
  onReport,
  onRate,
  cancelling,
  reporting,
  ratingSubmitting,
}) {
  const currentStepIndex = steps.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";
  const isDelivered = order.status === "Delivered";

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Rating flow — only relevant once the order has been delivered.
  // `hasRated` seeds from order.rating/order.deliveryRating in case the
  // backend already returns a previously-submitted rating for this booking.
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(
    Boolean(order.rating || order.deliveryRating)
  );

  // Re-derive hasRated any time the order prop actually changes (not just on
  // first mount) — e.g. after the resync in rateOrder() updates selectedOrder
  // in place without necessarily remounting this component. Without this,
  // hasRated could be computed once from a stale/incomplete order object and
  // never correct itself, letting the rate flow reopen even though the
  // booking is already rated on the backend.
  useEffect(() => {
    setHasRated(Boolean(order.rating || order.deliveryRating));
  }, [order._id, order.rating, order.deliveryRating]);

  const [copied, setCopied] = useState(false);

  const handleCopyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(order.bookingId);
    } catch (err) {
      // Clipboard API unavailable/blocked — fall back to a manual copy
      const textarea = document.createElement("textarea");
      textarea.value = order.bookingId;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Static price breakup — same mock values as TrackOrder.jsx.
  // Replace with real values from your backend once bookings return a price breakdown.
  const priceBreakup = {
    cylinderPrice: 850,
    deliveryFee: 30,
    tax: 44,
  };
  const totalAmount =
    priceBreakup.cylinderPrice + priceBreakup.deliveryFee + priceBreakup.tax;

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportReason("");
    setReportSubmitted(false);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const ok = await onReport(order._id, reportReason);
    if (ok) setReportSubmitted(true);
  };

  const closeRateModal = () => {
    setShowRateModal(false);
    setSelectedRating(0);
    setHoverRating(0);
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRating || hasRated) return;
    const ok = await onRate(order._id, selectedRating);
    if (ok) setHasRated(true);
  };

  return (
    <div className="order-detail-card">
      <button className="back-btn" onClick={onBack}>
        ← Back to Orders
      </button>

      <div className="booking-header">
        <h2>Booking Details</h2>
      </div>

      <div className="details-grid">
        <div>
          <span>Booking ID</span>
          <div className="booking-id-row">
            <h4>{order.bookingId}</h4>
            <button
              type="button"
              className={`copy-btn${copied ? " is-copied" : ""}`}
              onClick={handleCopyBookingId}
              title="Copy Booking ID"
              aria-label="Copy Booking ID"
            >
              <i
                className={`bi ${copied ? "bi-clipboard-check-fill" : "bi-clipboard"}`}
                aria-hidden="true"
              />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
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

      {/* Price Breakup — real snapshot captured when this booking was placed */}
      <div className="price-box">
        <h3>Price Summary</h3>

        {order.priceBreakup ? (
          <>
            <div className="price-row">
              <span>Cylinder Price{order.quantity > 1 ? ` (× ${order.quantity})` : ""}</span>
              <span>₹{order.priceBreakup.cylinderPrice}</span>
            </div>

            <div className="price-row">
              <span>Delivery Fee</span>
              <span>₹{order.priceBreakup.deliveryFee}</span>
            </div>

            <div className="price-row">
              <span>Platform Fee</span>
              <span>₹{order.priceBreakup.platformFee}</span>
            </div>

            <div className="price-row">
              <span>GST & Taxes ({order.priceBreakup.taxRatePercent}%)</span>
              <span>₹{order.priceBreakup.taxAmount}</span>
            </div>

            <div className="price-row total">
              <span>Total Amount</span>
              <span>₹{order.priceBreakup.total}</span>
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
                  <p>{step}</p>
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

          {/* order.deliveryPartner is the populated { name, phone } object
              from GET /me's .populate("deliveryPartner", "name phone").
              Falls back to the legacy assignedDeliveryAgent string if a
              partner was assigned before this field existed. */}
          {(order.deliveryPartner || order.assignedDeliveryAgent) && (
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
                <div className="partner-rating-pill" title="Delivery partner's overall rating">
                  <StarIcon filled size={16} />
                  <span>{order.deliveryPartner.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions — Report a Spam + Cancel Order / Rate Delivery Experience */}
          <div className="track-actions">
            <button
              className="report-btn"
              onClick={() => setShowReportModal(true)}
            >
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
                  {cancelling ? "Cancelling…" : "Cancel Order"}
                </button>
              )
            )}
          </div>
        </>
      ) : (
        <div className="cancelled-box">
          <h3>✖ Order Cancelled</h3>
          <p>{order.cancelReason || "This booking was cancelled and is no longer active."}</p>
        </div>
      )}

      {/* Report a Spam modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={closeReportModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {!reportSubmitted ? (
              <>
                <h3>Report a Spam</h3>
                <p>Let us know what's wrong with booking {order.bookingId}.</p>

                <form onSubmit={handleReportSubmit}>
                  <textarea
                    rows="4"
                    placeholder="Describe the issue (e.g. spam call, fake booking, wrong charge)..."
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
                  out to you shortly regarding booking {order.bookingId}.
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
                <p>How was your delivery for booking {order.bookingId}?</p>

                <form onSubmit={handleRateSubmit}>
                  <div
                    className="star-rating"
                    role="radiogroup"
                    aria-label="Delivery rating"
                  >
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
                  Your feedback for booking {order.bookingId} has been
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

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel this order?</h3>
            <p>
              Are you sure you want to cancel booking {order.bookingId}? This
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
                onClick={() => {
                  onCancel(order._id);
                  setShowCancelModal(false);
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;