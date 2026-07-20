import { useState } from "react";

function BookCylinder() {
  const [booking, setBooking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setBooking(true);
  };

  return (
    <div className="booking-page">
      <div className="booking-card">

        <h2>📦 Book LPG Cylinder</h2>
        <p>Fill in your details to book your LPG cylinder.</p>

        {!booking ? (
          <form onSubmit={handleSubmit}>

            <input type="text" placeholder="Full Name" required />

            <input type="tel" placeholder="Phone Number" required />

            <textarea
              placeholder="Delivery Address"
              rows="4"
              required
            ></textarea>

            <select required>
              <option value="">Select Cylinder Type</option>
              <option>Domestic (14.2 kg)</option>
              <option>Commercial (19 kg)</option>
              <option>Mini (5 kg)</option>
            </select>

            <input type="date" required />

            <select required>
              <option value="">Payment Method</option>
              <option>Cash on Delivery</option>
              <option>UPI</option>
              <option>Credit / Debit Card</option>
            </select>

            <textarea
              placeholder="Special Instructions (Optional)"
              rows="3"
            ></textarea>

            <button type="submit">
              Book Cylinder
            </button>

          </form>
        ) : (
          <div className="success-box">
            <h3>✅ Booking Successful!</h3>

            <p>
              Your LPG cylinder has been booked successfully.
            </p>

            <h4>Booking ID</h4>

            <span>PH2026001</span>

            <p>
              Estimated Delivery:
              <strong> Tomorrow</strong>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default BookCylinder;