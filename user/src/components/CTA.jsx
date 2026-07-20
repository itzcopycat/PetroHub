import { Link } from "react-router-dom";

function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2>Ready to Book Your LPG Cylinder?</h2>

        <p>
          Experience fast, safe and reliable LPG cylinder delivery with
          PetroHub. Book online in just a few clicks or track your
          existing order instantly.
        </p>

        <div className="cta-buttons">
          <Link to="/book-cylinder" className="cta-book">
            Book Cylinder
          </Link>

          <Link to="/track-order" className="cta-track">
            Track Order
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTA;