import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const CYLINDER_LABELS = {
  "14.2kg": "Domestic (14.2 kg)",
  "19kg": "Commercial (19 kg)",
  "5kg": "Mini (5 kg)",
};

const steps = ["Pending", "Confirmed", "Delivered"];

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

function Orders() {
  // ✅ ALL state and functions declared at the top — before any return
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [reporting, setReporting] = useState(false);

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
          cancelling={cancelling}
          reporting={reporting}
        />
      )}
    </div>
  );
}

function OrderDetail({ order, onBack, onCancel, onReport, cancelling, reporting }) {
  const currentStepIndex = steps.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";

 const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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

      <div className="price-box">
        <h3>Price Summary</h3>

        <div className="price-row">
          <span>Cylinder Price</span>
          <span>₹{priceBreakup.cylinderPrice}</span>
        </div>

        <div className="price-row">
          <span>Delivery Fee</span>
          <span>₹{priceBreakup.deliveryFee}</span>
        </div>

        <div className="price-row">
          <span>GST & Taxes</span>
          <span>₹{priceBreakup.tax}</span>
        </div>

        <div className="price-row total">
          <span>Total Amount</span>
          <span>₹{totalAmount}</span>
        </div>
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
                    "progress-step " +
                    (index < currentStepIndex
                      ? "completed"
                      : index === currentStepIndex
                      ? "active"
                      : "")
                  }
                >
                  <div className="progress-dot">
                    {index < currentStepIndex ? "✓" : index + 1}
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

          {order.assignedDeliveryAgent && (
            <div className="delivery-box">
              <h3>Delivery Partner</h3>
              <p>
                <strong>Name:</strong> {order.assignedDeliveryAgent}
              </p>
            </div>
          )}

          {/* Actions — Report a Spam + Cancel Order */}
          <div className="track-actions">
            <button
              className="report-btn"
              onClick={() => setShowReportModal(true)}
            >
              ⚠ Report a Problem
            </button>

            {(order.status === "Pending" || order.status === "Confirmed") && (
              <button
                className="cancel-btn"
                onClick={() => setShowCancelModal(true)}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Cancel Order"}
              </button>
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