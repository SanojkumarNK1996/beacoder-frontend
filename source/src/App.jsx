import { Routes, Route, Navigate } from "react-router-dom";
import Signup from './pages/SignUp/SignUp.jsx'
import CourseDetailPage from './pages/CourseDetail/CourseDetailPage.jsx'
import SubtopicContentPage from './pages/CourseDetail/SubtopicContentPage.jsx'
import CourseList from './pages/CourseList/CourseList.jsx'
import Login from './pages/Login/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from "./pages/Homepage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import AssignmentPage from "./pages/Assignment/AssignmentPage.jsx";
import DiscussionPage from "./pages/DiscussionPage.jsx";
import InstructorAssignments from "./pages/Instructor/InstructorAssignments.jsx";
import InstructorAssignmentDetail from "./pages/Instructor/InstructorAssignmentDetail.jsx";
import InstructorDiscussions from "./pages/Instructor/InstructorDiscussions.jsx";
import InstructorDiscussionDetail from "./pages/Instructor/InstructorDiscussionDetail.jsx";
import PairProgramming from "./pages/Instructor/PairProgramming.jsx";

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
        <Route path="/courses/:id/topics" element={
          <ProtectedRoute>
            <CourseDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/course/:cId/topic/:tId/sub/:sId" element={
          <ProtectedRoute>
            <SubtopicContentPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <CourseList />
          </ProtectedRoute>
        } />
        <Route path="/assignments" element={
          <ProtectedRoute>
            <AssignmentPage />
          </ProtectedRoute>
        } />
        <Route path="/discussions" element={
          <ProtectedRoute>
            <DiscussionPage />
          </ProtectedRoute>
        } />
        <Route path="/discussions/:discussionId" element={
          <ProtectedRoute>
            <DiscussionPage />
          </ProtectedRoute>
        } />

        {/* Instructor routes */}
        <Route path="/instructor-homepage" element={<Navigate to="/instructor/assignments" replace />} />
        <Route path="/instructor/assignments" element={
          <ProtectedRoute requiredRole="instructor">
            <InstructorAssignments />
          </ProtectedRoute>
        } />
        <Route path="/instructor/assignments/detail" element={
          <ProtectedRoute requiredRole="instructor">
            <InstructorAssignmentDetail />
          </ProtectedRoute>
        } />
        <Route path="/instructor/discussions" element={
          <ProtectedRoute requiredRole="instructor">
            <InstructorDiscussions />
          </ProtectedRoute>
        } />
        <Route path="/instructor/discussions/:discussionId" element={
          <ProtectedRoute requiredRole="instructor">
            <InstructorDiscussionDetail />
          </ProtectedRoute>
        } />
        <Route path="/instructor/pair-programming" element={
          <ProtectedRoute requiredRole="instructor">
            <PairProgramming />
          </ProtectedRoute>
        } />

        {/* Default route: show Login for any unknown path */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </>
  )
}

export default App
