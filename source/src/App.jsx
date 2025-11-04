import { Routes, Route } from "react-router-dom";
import Signup from './pages/SignUp/SignUp.jsx'
import CourseDetailPage from './pages/CourseDetail/CourseDetailPage.jsx'
import CourseList from './pages/CourseList/CourseList.jsx'
import Login from './pages/Login/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from "./pages/Homepage.jsx";
import LandingPage from "./pages/LandingPage.jsx";

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
          <Route path="/landing-page" element={<LandingPage />} />

        {/* Protected routes */}
            <Route path="/homepage" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute>
            <CourseList />
          </ProtectedRoute>
        } />
        <Route path="/courses/:id" element={
          <ProtectedRoute>
            <CourseDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <CourseList />
          </ProtectedRoute>
        } />
        <Route path="/assignments" element={
          <ProtectedRoute>
            <CourseList />
          </ProtectedRoute>
        } />
        <Route path="/discussions" element={
          <ProtectedRoute>
            <CourseList />
          </ProtectedRoute>
        } />

        {/* Default route: show Login for any unknown path */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </>
  )
}

export default App
