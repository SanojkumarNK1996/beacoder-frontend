import { Routes, Route, Navigate } from "react-router-dom";
import Signup from './pages/SignUp/SignUp.jsx'
import CourseDetailPage from './pages/CourseDetail/CourseDetailPage.jsx'
import SubtopicContentPage from './pages/CourseDetail/SubtopicContentPage.jsx'
import CourseList from './pages/CourseList/CourseList.jsx'
import Login from './pages/Login/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute';
import CourseAvailabilityRoute from "./components/CourseAvailabilityRoute";
import HomePage from "./pages/Homepage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import AssignmentPage from "./pages/Assignment/AssignmentPage.jsx";
import DiscussionPage from "./pages/DiscussionPage.jsx";
import InstructorAssignments from "./pages/Instructor/InstructorAssignments.jsx";
import InstructorAssignmentDetail from "./pages/Instructor/InstructorAssignmentDetail.jsx";
import AssignAssignments from "./pages/Instructor/AssignAssignments.jsx";
import InstructorDiscussions from "./pages/Instructor/InstructorDiscussions.jsx";
import InstructorDiscussionDetail from "./pages/Instructor/InstructorDiscussionDetail.jsx";
import PairProgramming from "./pages/Instructor/PairProgramming.jsx";
import Curriculum from "./pages/Curriculum/Curriculum.jsx";
import ContentEditor from "./pages/ContentEditor/ContentEditor.jsx";
import UserManagement from "./pages/Admin/UserManagement.jsx";
import Mentors from "./pages/Mentors/Mentors.jsx";
import Recruiters from "./pages/Recruiters/Recruiters.jsx";
import QuizPage from "./pages/Quiz/QuizPage.jsx";
import StudentProgressManagement from "./pages/Progress/StudentProgressManagement.jsx";
import QuestionnairePage from "./pages/Instructor/QuestionnairePage.jsx";
import MyTestsPage from "./pages/Tests/MyTestsPage.jsx";
import MyProgressPage from "./pages/Progress/MyProgressPage.jsx";

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
        <Route path="/curriculum" element={
          <ProtectedRoute>
            <Curriculum />
          </ProtectedRoute>
        } />
        <Route path="/mentors" element={
          <ProtectedRoute>
            <Mentors />
          </ProtectedRoute>
        } />
        <Route path="/content-editor" element={
          <ProtectedRoute requiredRole={["admin", "instructor"]}>
            <ContentEditor />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/progress/manage" element={
          <ProtectedRoute requiredRole={["admin", "instructor"]}>
            <StudentProgressManagement />
          </ProtectedRoute>
        } />
        <Route path="/my-progress" element={
          <ProtectedRoute requiredRole="student">
            <MyProgressPage />
          </ProtectedRoute>
        } />
        <Route path="/recruiters" element={
          <ProtectedRoute requiredRole={["student", "admin"]}>
            <Recruiters />
          </ProtectedRoute>
        } />
        <Route path="/courses/:id" element={
          <ProtectedRoute>
            <CourseAvailabilityRoute><CourseDetailPage /></CourseAvailabilityRoute>
          </ProtectedRoute>
        } />
        <Route path="/courses/:id/topics" element={
          <ProtectedRoute>
            <CourseAvailabilityRoute><CourseDetailPage /></CourseAvailabilityRoute>
          </ProtectedRoute>
        } />
        <Route path="/course/:cId/topic/:tId/sub/:sId" element={
          <ProtectedRoute>
            <CourseAvailabilityRoute><SubtopicContentPage /></CourseAvailabilityRoute>
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
        <Route path="/quizzes" element={
          <ProtectedRoute requiredRole={["student", "admin"]}>
            <QuizPage />
          </ProtectedRoute>
        } />
        <Route path="/questionnaires" element={
          <ProtectedRoute requiredRole={["instructor", "admin"]}>
            <QuestionnairePage />
          </ProtectedRoute>
        } />
        <Route path="/my-tests" element={
          <ProtectedRoute requiredRole={["student", "admin"]}>
            <MyTestsPage />
          </ProtectedRoute>
        } />
        <Route path="/assignments/manage" element={
          <ProtectedRoute requiredRole={["admin", "instructor"]}>
            <AssignAssignments />
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
          <ProtectedRoute requiredRole={["instructor", "admin"]}>
            <InstructorAssignments />
          </ProtectedRoute>
        } />
        <Route path="/instructor/assignments/detail" element={
          <ProtectedRoute requiredRole={["instructor", "admin"]}>
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
