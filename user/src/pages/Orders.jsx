import { useState } from "react";

// Mock data — replace with a real API call later
const mockOrders = [
  {
    id: "PH2026001",
    date: "15 July 2026",
    cylinder: "Domestic (14.2 kg)",
    deliveryDate: "Tomorrow",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    status: "out-for-delivery", // confirmed | assigned | out-for-delivery | delivered | cancelled
    price: { cylinderPrice: 850, deliveryFee: 30, tax: 44 },
    deliveryPartner: { name: "Amit Kumar", phone: "+91 9876543210", vehicle: "WB-20-AB-1234" },
  },
  {
    id: "PH2026002",
    date: "10 July 2026",
    cylinder: "Commercial (19 kg)",
    deliveryDate: "10 July 2026",
    paymentMethod: "Online Payment",
    paymentStatus: "Paid",
    status: "delivered",
    price: { cylinderPrice: 1750, deliveryFee: 40, tax: 89 },
    deliveryPartner: { name: "Suresh Roy", phone: "+91 9123456780", vehicle: "WB-11-CD-5678" },
  },
  {
    id: "PH2026003",
    date: "5 July 2026",
    cylinder: "Domestic (14.2 kg)",
    deliveryDate: "—",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Not Charged",
    status: "cancelled",
    price: { cylinderPrice: 850, deliveryFee: 30, tax: 44 },
    deliveryPartner: null,
  },
  {
    id: "PH2026004",
    date: "17 July 2026",
    cylinder: "Domestic (14.2 kg)",
    deliveryDate: "Within 2 days",
    paymentMethod: "Online Payment",
    paymentStatus: "Paid",
    status: "confirmed",
    price: { cylinderPrice: 850, deliveryFee: 30, tax: 44 },
    deliveryPartner: null,
  },
];

const steps = ["confirmed", "assigned", "out-for-delivery", "delivered"];
const stepLabels = {
  confirmed: "Order Confirmed",
  assigned: "Agent Assigned",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
};

const statusMeta = {
  confirmed: { label: "Confirmed", className: "badge-confirmed" },
  assigned: { label: "Agent Assigned", className: "badge-assigned" },
  "out-for-delivery": { label: "Out for Delivery", className: "badge-active" },
  delivered: { label: "Delivered", className: "badge-delivered" },
  cancelled: { label: "Cancelled", className: "badge-cancelled" },
};

function Orders() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const openOrder = (order) => setSelectedOrder(order);
  const goBack = () => setSelectedOrder(null);

  return (
    <div className="orders-page">

      {!selectedOrder ? (
        <>
          <div className="orders-header">
            <h1>My Orders</h1>
            <p>View your booking history and track any active order.</p>
          </div>

          <div className="orders-grid">
            {mockOrders.map((order) => (
              <div
                key={order.id}
                className="order-card"
                onClick={() => openOrder(order)}
              >
                <div className="order-card-top">
                  <h3>#{order.id}</h3>
                  <span className={`status-badge ${statusMeta[order.status].className}`}>
                    {statusMeta[order.status].label}
                  </span>
                </div>

                <p className="order-card-cylinder">{order.cylinder}</p>

                <div className="order-card-bottom">
                  <span>{order.date}</span>
                  <span className="view-details">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <OrderDetail order={selectedOrder} onBack={goBack} />
      )}

    </div>
  );
}

function OrderDetail({ order, onBack }) {
  const currentStepIndex = steps.indexOf(order.status);
  const totalAmount =
    order.price.cylinderPrice + order.price.deliveryFee + order.price.tax;

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
          <h4>{order.id}</h4>
        </div>

        <div>
          <span>Booking Date</span>
          <h4>{order.date}</h4>
        </div>

        <div>
          <span>Cylinder</span>
          <h4>{order.cylinder}</h4>
        </div>

        <div>
          <span>Delivery Date</span>
          <h4>{order.deliveryDate}</h4>
        </div>

        <div>
          <span>Payment Method</span>
          <h4>{order.paymentMethod}</h4>
        </div>

        <div>
          <span>Payment Status</span>
          <h4>{order.paymentStatus}</h4>
        </div>

      </div>

      {/* Price Breakup */}
      <div className="price-box">
        <h3>Price Summary</h3>

        <div className="price-row">
          <span>Cylinder Price</span>
          <span>₹{order.price.cylinderPrice}</span>
        </div>

        <div className="price-row">
          <span>Delivery Fee</span>
          <span>₹{order.price.deliveryFee}</span>
        </div>

        <div className="price-row">
          <span>GST & Taxes</span>
          <span>₹{order.price.tax}</span>
        </div>

        <div className="price-row total">
          <span>Total Amount</span>
          <span>₹{totalAmount}</span>
        </div>
      </div>

      {order.status !== "cancelled" ? (
        <>
          {/* Progress bar */}
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
                  <p>{stepLabels[step]}</p>
                  {index < steps.length - 1 && (
                    <div
                      className={
                        "progress-line " +
                        (index < currentStepIndex ? "filled" : "")
                      }
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery partner — only once assigned */}
          {order.deliveryPartner && (
            <div className="delivery-box">
              <h3>Delivery Partner</h3>
              <p><strong>Name:</strong> {order.deliveryPartner.name}</p>
              <p><strong>Phone:</strong> {order.deliveryPartner.phone}</p>
              <p><strong>Vehicle:</strong> {order.deliveryPartner.vehicle}</p>
            </div>
          )}
        </>
      ) : (
        <div className="cancelled-box">
          <h3>✖ Order Cancelled</h3>
          <p>This booking was cancelled and is no longer active.</p>
        </div>
      )}

    </div>
  );
}

export default Orders;