import "./App.css"
import "./assets/css/bootstrap.min.css"
import "./assets/js/bootstrap.bundle.min.js"
import "./assets/js/main.js"
import "./assets/vendors/bootstrap-icons/bootstrap-icons.css"
import "./context/ThemeContext.jsx"

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Consumers from "./pages/Consumers.jsx";
import AddConsumer from "./pages/AddConsumer.jsx";
import Login from "./pages/Login.jsx";
import AddBooking from "./pages/AddBooking.jsx";
import LpgBookings from "./pages/LpgBookings.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="/consumers" element={<Consumers />} />
            <Route path="/lpgbookings" element={<LpgBookings />} />
            <Route path="/addconsumer" element={<AddConsumer />} />
            <Route path="/addbooking" element={<AddBooking />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="add-user" element={<AddUser />} /> */}
            {/* <Route path="profile" element={<Profile />} /> */}
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;