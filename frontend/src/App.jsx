import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Booking from './pages/Booking'
import Home from './pages/Home'
import AdminUsers from './pages/AdminUsers'
import AdminServices from './pages/AdminServices'
import AdminBookings from './pages/AdminBookings'
import About from './pages/About'
import Login from './pages/Login'
import MasterBookings from './pages/MasterBookings'
import Masters from './pages/Masters'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Services from './pages/Services'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
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
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
          </Route>
          <Route element={<ProtectedRoute requiredRole="master" />}>
            <Route path="/master/bookings" element={<MasterBookings />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App