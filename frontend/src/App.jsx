import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Booking from './pages/Booking'
import Home from './pages/Home'
import Login from './pages/Login'
import Masters from './pages/Masters'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Services from './pages/Services'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/masters" element={<Masters />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App