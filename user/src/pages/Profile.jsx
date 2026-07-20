import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaVenusMars,
  FaIdBadge,
  FaSignOutAlt,
} from "react-icons/fa";
import Avatar from "../Components/Avatar";

function calculateAge(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function formatDate(dobString) {
  if (!dobString) return "—";
  return new Date(dobString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function Profile() {
  const [consumer, setConsumer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("consumer");
    if (!stored) {
      navigate("/login");
      return;
    }
    setConsumer(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("consumer");
    navigate("/login");
  };

  if (!consumer) return null;

  const { address } = consumer;
  const age = calculateAge(consumer.dob);

  return (
    <div className="profile-page">
      <div className="profile-card">

        <div className="profile-header">
          <Avatar gender={consumer.gender} className="profile-avatar" />
          <h2>{consumer.name}</h2>
          {consumer.consumerId && (
            <p className="profile-id">
              <FaIdBadge /> {consumer.consumerId}
            </p>
          )}
        </div>

        <div className="profile-details">

          <div className="profile-row">
            <span className="profile-label"><FaVenusMars /> Gender</span>
            <span className="profile-value">{consumer.gender || "—"}</span>
          </div>

          <div className="profile-row">
            <span className="profile-label"><FaBirthdayCake /> Date of Birth</span>
            <span className="profile-value">
              {formatDate(consumer.dob)}
              {age !== null && ` (${age} yrs)`}
            </span>
          </div>

          <div className="profile-row">
            <span className="profile-label"><FaEnvelope /> Email</span>
            <span className="profile-value">{consumer.email}</span>
          </div>

          <div className="profile-row">
            <span className="profile-label"><FaPhoneAlt /> Phone</span>
            <span className="profile-value">{consumer.mobileNumber}</span>
          </div>

          <div className="profile-row profile-row--address">
            <span className="profile-label"><FaMapMarkerAlt /> Address</span>
            <span className="profile-value">
              {address?.line1}
              {address?.line2 ? `, ${address.line2}` : ""}
              {`, ${address?.city}, ${address?.district}, ${address?.state} - ${address?.pincode}`}
            </span>
          </div>

        </div>

        <button className="profile-logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>

      </div>
    </div>
  );
}

export default Profile;