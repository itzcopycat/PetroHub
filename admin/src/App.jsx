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
import ConsumerDetail from "./pages/ConsumerDetail.jsx";
import Login from "./pages/Login.jsx";
import AddBooking from "./pages/AddBooking.jsx";
import LpgBookings from "./pages/LpgBookings.jsx";
import Delivery from "./pages/Delivery.jsx";
import RestockCylinders from "./pages/RestockCylinders.jsx";
import CylinderStock from "./pages/CylinderStock.jsx";
import EditLpgPrice from "./pages/EditLpgPrice.jsx";
import EditFeesAndTaxes from "./pages/EditFeesAndTaxes.jsx";
import Profile from "./pages/Profile.jsx";
import Reports from "./pages/Reports.jsx"
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
            <Route path="/users/:id" element={<ConsumerDetail />} />
            <Route path="/lpgbookings" element={<LpgBookings />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/cylinderstock" element={<CylinderStock />} />
            <Route path="/addconsumer" element={<AddConsumer />} />
            <Route path="/addbooking" element={<AddBooking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<Consumers />} />
            <Route path="/restock-cylinders" element={<RestockCylinders />} />
            <Route path="/edit-lpg-prices" element={<EditLpgPrice />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/fees-and-taxes" element={<EditFeesAndTaxes />} />

            {/* <Route path="add-user" element={<AddUser />} /> */}
            {/* <Route path="profile" element={<Profile />} /> */}
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;