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
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
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
          cancelling={cancelling}
        />
      )}
    </div>
  );
}

function OrderDetail({ order, onBack, onCancel, cancelling }) {
  const currentStepIndex = steps.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";

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
        <div className="price-row total">
          <span>Total Amount</span>
          <span>{order.price > 0 ? `₹${order.price}` : "To be confirmed"}</span>
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

          {/* Cancel button — only for Pending or Confirmed orders */}
          {(order.status === "Pending" || order.status === "Confirmed") && (
            <button
              className="btn-cancel"
              onClick={() => onCancel(order._id)}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling…" : "Cancel Order"}
            </button>
          )}
        </>
      ) : (
        <div className="cancelled-box">
          <h3>✖ Order Cancelled</h3>
          <p>{order.cancelReason || "This booking was cancelled and is no longer active."}</p>
        </div>
      )}
    </div>
  );
}

export default Orders;