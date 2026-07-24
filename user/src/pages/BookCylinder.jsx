import { useState } from "react";
import axios from "axios";

const CYLINDER_OPTIONS = [
  { value: "14.2kg", label: "Domestic (14.2 kg)" },
  { value: "19kg", label: "Commercial (19 kg)" },
  { value: "5kg", label: "Mini (5 kg)" },
];

const PAYMENT_OPTIONS = ["Cash on Delivery", "UPI", "Credit / Debit Card"];

function BookCylinder() {
  const [form, setForm] = useState({
    cylinderType: "",
    quantity: 1,
    deliveryAddress: "",
    preferredDeliveryDate: "",
    paymentMethod: "",
    specialInstructions: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null); // holds the created booking on success

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Please log in to your account before booking a cylinder.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/bookings/me",
        {
          cylinderType: form.cylinderType,
          quantity: Number(form.quantity),
          deliveryAddress: form.deliveryAddress,
          preferredDeliveryDate: form.preferredDeliveryDate || null,
          paymentMethod: form.paymentMethod,
          specialInstructions: form.specialInstructions,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBooking(res.data.booking);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to book cylinder. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-card">

        <h2>📦 Book LPG Cylinder</h2>
        <p>Fill in your details to book your LPG cylinder.</p>

        {!booking ? (
          <form onSubmit={handleSubmit}>

            {error && <p className="booking-error">{error}</p>}

            <textarea
              name="deliveryAddress"
              placeholder="Delivery Address"
              rows="4"
              value={form.deliveryAddress}
              onChange={handleChange}
              required
            ></textarea>

            <select
              name="cylinderType"
              value={form.cylinderType}
              onChange={handleChange}
              required
            >
              <option value="">Select Cylinder Type</option>
              {CYLINDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="quantity"
              min="1"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              required
            />

            <input
              type="date"
              name="preferredDeliveryDate"
              value={form.preferredDeliveryDate}
              onChange={handleChange}
              required
            />

            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">Payment Method</option>
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <textarea
              name="specialInstructions"
              placeholder="Special Instructions (Optional)"
              rows="3"
              value={form.specialInstructions}
              onChange={handleChange}
            ></textarea>

            <button type="submit" disabled={submitting}>
              {submitting ? "Booking..." : "Book Cylinder"}
            </button>

          </form>
        ) : (
          <div className="success-box">
            <h3>✅ Booking Successful!</h3>

            <p>
              Your LPG cylinder has been booked successfully.
            </p>

            <h4>Booking ID</h4>

            <span>{booking.bookingId}</span>

            <p>
              Preferred Delivery Date:
              <strong>
                {" "}
                {booking.preferredDeliveryDate
                  ? new Date(booking.preferredDeliveryDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "To be confirmed"}
              </strong>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default BookCylinder;