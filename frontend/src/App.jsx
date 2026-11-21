import { lazy, Suspense } from 'react'
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
import Reviews from './pages/Reviews'
import Services from './pages/Services'
import ProtectedRoute from './routes/ProtectedRoute'

const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'))
const AdminCategories = lazy(() => import('./pages/Admin/AdminCategories'))
const AdminServices = lazy(() => import('./pages/Admin/AdminServices'))
const AdminWorkplaces = lazy(() => import('./pages/Admin/AdminWorkplaces'))
const AdminMasters = lazy(() => import('./pages/Admin/AdminMasters'))
const AdminSchedules = lazy(() => import('./pages/Admin/AdminSchedules'))
const AdminAbsences = lazy(() => import('./pages/Admin/AdminAbsences'))
const AdminBookings = lazy(() => import('./pages/Admin/AdminBookings'))
const AdminReviews = lazy(() => import('./pages/Admin/AdminReviews'))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-sand)] border-t-[var(--color-plum)]" />
        Загрузка раздела...
      </div>
    </div>
  )
}

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
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/reviews" element={<Reviews />} />
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
      </Suspense>
    </BrowserRouter>
  )
}

export default App
