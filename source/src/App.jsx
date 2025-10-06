import { Routes, Route } from "react-router-dom";
import Signup from './pages/SignUp'
import CourseDetailPage from './pages/CourseDetailPage'
import CourseList from './pages/CourseList'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
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
        <Route path="*" element={<Login />} />
      </Routes>
    </>
  )
}

export default App
