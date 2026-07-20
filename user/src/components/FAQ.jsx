function FAQ() {
  return (
    <section className="faq-section">
      <div className="faq-header">
        <h2>Frequently Asked Questions</h2>
        <p>Find answers to the most common questions about PetroHub.</p>
      </div>

      <div className="faq-container">

        <div className="faq-item">
          <h3>How do I book an LPG cylinder?</h3>
          <p>
            Simply click the "Book Cylinder" button, fill in your details,
            and confirm your booking.
          </p>
        </div>

        <div className="faq-item">
          <h3>Can I track my order?</h3>
          <p>
            Yes. Use the "Track Order" option on the homepage to view your
            delivery status.
          </p>
        </div>

        <div className="faq-item">
          <h3>Which payment methods are accepted?</h3>
          <p>
            We support UPI, Debit Card, Credit Card, Net Banking, and Cash on
            Delivery.
          </p>
        </div>

        <div className="faq-item">
          <h3>How long does delivery take?</h3>
          <p>
            Most deliveries are completed within 24 hours depending on your
            location.
          </p>
        </div>

      </div>
    </section>
  );
}

export default FAQ;