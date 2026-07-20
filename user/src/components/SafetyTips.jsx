function SafetyTips() {
  return (
    <section className="safety-section" id="safety">
      <div className="safety-header">
        <h2>LPG Safety Tips</h2>
        <p>
          Follow these important safety guidelines while using LPG at home.
        </p>
      </div>

      <div className="safety-container">

        <div className="safety-card">
          <div className="safety-icon">🔥</div>
          <h3>Check for Gas Leaks</h3>
          <p>
            Regularly inspect the gas pipe and regulator for any leakage.
          </p>
        </div>

        <div className="safety-card">
          <div className="safety-icon">🛢️</div>
          <h3>Keep Cylinder Upright</h3>
          <p>
            Always place your LPG cylinder in an upright position.
          </p>
        </div>

        <div className="safety-card">
          <div className="safety-icon">🌬️</div>
          <h3>Ensure Ventilation</h3>
          <p>
            Keep your kitchen well ventilated while using LPG.
          </p>
        </div>

        <div className="safety-card">
          <div className="safety-icon">📞</div>
          <h3>Emergency Support</h3>
          <p>
            Contact PetroHub support immediately if you suspect a gas leak.
          </p>
        </div>

      </div>
    </section>
  );
}

export default SafetyTips;