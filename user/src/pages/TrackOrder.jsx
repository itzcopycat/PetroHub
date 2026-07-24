import { useState } from "react";

function TrackOrder() {
  const [tracked, setTracked] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // confirmed | assigned | out-for-delivery | delivered | cancelled
  const [orderStatus, setOrderStatus] = useState("out-for-delivery");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const steps = ["confirmed", "assigned", "out-for-delivery", "delivered"];
  const stepLabels = {
    confirmed: "Order Confirmed",
    assigned: "Agent Assigned",
    "out-for-delivery": "Out for Delivery",
    delivered: "Delivered",
  };

  const currentStepIndex = steps.indexOf(orderStatus);
  const showDeliveryPartner =
    orderStatus === "assigned" ||
    orderStatus === "out-for-delivery" ||
    orderStatus === "delivered";

  const handleTrack = () => {
    if (bookingId.trim() !== "") {
      setTracked(true);
    }
  };

  const handleCancelConfirm = () => {
    // Hook this up to your backend to actually cancel the order
    console.log("Cancelling order:", bookingId);
    setOrderStatus("cancelled");
    setShowCancelModal(false);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    // Hook this up to your backend to actually log the complaint
    console.log("Reporting issue for order:", bookingId, reportReason);
    setReportSubmitted(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportReason("");
    setReportSubmitted(false);
  };

  // Mock pricing — replace with real values from your backend
  const priceBreakup = {
    cylinderPrice: 850,
    deliveryFee: 30,
    tax: 44,
  };
  const totalAmount =
    priceBreakup.cylinderPrice + priceBreakup.deliveryFee + priceBreakup.tax;

  return (
    <div className="track-page">
      <div className="track-card">

        <h1>Track Your LPG Order</h1>

        <p className="track-subtitle">
          Enter your Booking ID to check the current delivery status.
        </p>

        <div className="track-search">
          <input
            type="text"
            placeholder="Enter Booking ID (Example: PH2026001)"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />

          <button onClick={handleTrack}>
            Track Order
          </button>
        </div>

        {tracked && (
          <div className="tracking-result">

            <div className="booking-header">
              <h2>Booking Details</h2>
            </div>

            <div className="details-grid">

              <div>
                <span>Booking ID</span>
                <h4>{bookingId}</h4>
              </div>

              <div>
                <span>Booking Date</span>
                <h4>15 July 2026</h4>
              </div>

              <div>
                <span>Cylinder</span>
                <h4>Domestic (14.2 kg)</h4>
              </div>

              <div>
                <span>Delivery Date</span>
                <h4>Tomorrow</h4>
              </div>

              <div>
                <span>Payment Method</span>
                <h4>Cash on Delivery</h4>
              </div>

              <div>
                <span>Payment Status</span>
                <h4>Pending</h4>
              </div>

            </div>

            {/* Price Breakup */}
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

            {orderStatus !== "cancelled" ? (
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

                {/* Delivery partner — only once assigned */}
                {showDeliveryPartner && (
                  <div className="delivery-box">
                    <h3>Delivery Partner</h3>
                    <p><strong>Name:</strong> Amit Kumar</p>
                    <p><strong>Phone:</strong> +91 9876543210</p>
                    <p><strong>Vehicle:</strong> WB-20-AB-1234</p>
                  </div>
                )}

                {/* Actions */}
                <div className="track-actions">
                  <button
                    className="report-btn"
                    onClick={() => setShowReportModal(true)}
                  >
                    ⚠ Report a Problem
                  </button>

                  {orderStatus !== "delivered" && (
                    <button
                      className="cancel-btn"
                      onClick={() => setShowCancelModal(true)}
                    >
                      ✖ Cancel Booking
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="cancelled-box">
                <h3>✖ Order Cancelled</h3>
                <p>Your booking {bookingId} has been cancelled successfully.</p>
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
              Are you sure you want to cancel booking {bookingId}? This
              action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn-outline" onClick={() => setShowCancelModal(false)}>
                Keep Order
              </button>
              <button className="modal-btn-danger" onClick={handleCancelConfirm}>
                Yes, Cancel
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
                <p>Let us know what went wrong with booking {bookingId}.</p>

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
                    <button type="submit" className="modal-btn-primary">
                      Submit Report
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3>✅ Report Submitted</h3>
                <p>
                  Thanks for letting us know. Our support team will reach
                  out to you shortly regarding booking {bookingId}.
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

    </div>
  );
}

export default TrackOrder;