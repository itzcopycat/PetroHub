function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="testimonials-header">
        <h2>What Our Customers Say</h2>
        <p>
          Thousands of customers trust PetroHub for safe and timely LPG
          deliveries.
        </p>
      </div>

      <div className="testimonials">

        <div className="testimonial-card">
          <div className="profile">👩</div>
          <h3>Priya Sharma</h3>
          <span>★★★★★</span>
          <p>
            Booking a cylinder was super easy. The delivery arrived on time,
            and the service was excellent.
          </p>
        </div>

        <div className="testimonial-card">
          <div className="profile">👨</div>
          <h3>Rahul Das</h3>
          <span>★★★★★</span>
          <p>
            I love the order tracking feature. It keeps me updated throughout
            the delivery process.
          </p>
        </div>

        <div className="testimonial-card">
          <div className="profile">👩‍🦰</div>
          <h3>Ananya Roy</h3>
          <span>★★★★★</span>
          <p>
            Fast delivery, secure payment, and very responsive customer
            support. Highly recommended!
          </p>
        </div>

      </div>
    </section>
  );
}

export default Testimonials;