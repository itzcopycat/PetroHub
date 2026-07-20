import { Link } from "react-router-dom";
import truckImage from "../assets/truck.png";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-left">
        <p className="tagline">SAFE • RELIABLE • FAST</p>

        <h1>
          LPG Cylinder <br />
          Delivered To Your <br />
          Doorstep
        </h1>

        <p className="description">
          Book your LPG cylinder online in just a few clicks and get
          quick, safe and reliable delivery at your doorstep.
        </p>

        <div className="hero-buttons">
          <Link to="/book-cylinder" className="book-btn">
            Book Cylinder
          </Link>

          <Link to="/track-order" className="track-btn">
            Track Order
          </Link>
        </div>
      </div>

      <div className="hero-right">
        <img
          src={truckImage}
          alt="PetroHub Delivery Truck"
          className="truck-img"
        />
      </div>
    </section>
  );
}

export default Hero;