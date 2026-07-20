function Statistics() {
  return (
    <section className="statistics-section">
      <div className="statistics-header">
        <h2>Our Impact</h2>
        <p>Trusted by thousands of customers across the country.</p>
      </div>

      <div className="statistics">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h2>10K+</h2>
          <p>Happy Customers</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <h2>25K+</h2>
          <p>Cylinders Delivered</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <h2>50+</h2>
          <p>Cities Covered</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <h2>99%</h2>
          <p>On-Time Delivery</p>
        </div>
      </div>
    </section>
  );
}

export default Statistics;