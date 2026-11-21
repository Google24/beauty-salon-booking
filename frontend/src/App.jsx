import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminLayout from './components/AdminLayout'
import Layout from './components/Layout'
import About from './pages/About'
import Booking from './pages/Booking'
import Home from './pages/Home'
import Login from './pages/Login'
import MasterBookings from './pages/MasterBookings'
import Masters from './pages/Masters'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Services from './pages/Services'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminUsers from './pages/Admin/AdminUsers'
import AdminCategories from './pages/Admin/AdminCategories'
import AdminServices from './pages/Admin/AdminServices'
import AdminWorkplaces from './pages/Admin/AdminWorkplaces'
import AdminMasters from './pages/Admin/AdminMasters'
import AdminSchedules from './pages/Admin/AdminSchedules'
import AdminAbsences from './pages/Admin/AdminAbsences'
import AdminBookings from './pages/Admin/AdminBookings'
import AdminReviews from './pages/Admin/AdminReviews'
import ProtectedRoute from './routes/ProtectedRoute'

function SiteLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/masters" element={<Masters />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/booking" element={<Booking />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route element={<ProtectedRoute requiredRole="master" />}>
            <Route path="/master/bookings" element={<MasterBookings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="workplaces" element={<AdminWorkplaces />} />
            <Route path="masters" element={<AdminMasters />} />
            <Route path="schedules" element={<AdminSchedules />} />
            <Route path="absences" element={<AdminAbsences />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
