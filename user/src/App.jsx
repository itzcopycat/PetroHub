import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Statistics from "./components/Statistics.jsx";
import Testimonials from "./components/Testimonials";
import SafetyTips from "./components/SafetyTips.jsx";
import WhyChoose from "./components/WhyChoose.jsx";
import FAQ from "./components/FAQ.jsx";
import CTA from "./components/CTA.jsx";
import Footer from "./components/Footer.jsx";
import Contact from "./components/Contact.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import BookCylinder from "./pages/BookCylinder.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";
import Orders from "./pages/Orders.jsx";
import "./App.css";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ScrollToTopButton from "./components/ScrollToToTopButton.jsx";

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/book-cylinder" element={<BookCylinder />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/about" element={<About />} />
        <Route path="/safety" element={<SafetyTips />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/whychoose" element={<WhyChoose />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/cta" element={<CTA />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>

      <Footer />
      <ScrollToTopButton />
    </>
  );
}

export default App;
