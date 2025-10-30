import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import RegistrationPage from "./pages/RegistrationPage";
import VerifiedPage from './pages/VerifiedPage';
import Dashboard from "./pages/Dashboard";
import ForgetPassword from './components/ForgetPassword';
import UpdatePassword from './components/UpdatePassword';
import Services from "./components/Services";
import PostTuitonPage from "./pages/PostTuitionPage";
import TutorFormPage from "./pages/TutorFormPage";
import AllPostsPage from "./pages/AllPostsPage";
import MyPostsPage from "./pages/MyPostsPage";
import EditPostPage from "./pages/EditPostPage";
import EditProfilePage from "./pages/EditProfilePage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import AllTutorsPage from "./pages/AllTutorsPage";
import MyAppliedPostsPage from "./pages/MyAppliedPostsPage";
import TutorDetailsPage from "./pages/TutorDetailsPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import EditTutorProfilePage from "./pages/EditTutorProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import TutorVerificationPage from "./pages/TutorVerificationPage";
import UserManagementPage from "./pages/UserManagementPage";
import PostManagementPage from "./pages/PostManagementPage";
import TutorRequestsPage from "./pages/TutorRequestsPage";
import MySentRequestsPage from "./pages/MySentRequestsPage";


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/verified" element={<VerifiedPage />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/dashboard" element={<Dashboard/>} /> 
          <Route path="/service" element={<Services />} />                
          <Route path="/post-tuition" element={<PostTuitonPage/>} />
          <Route path="/all-posts" element={<AllPostsPage/>} />
          <Route path="/my-post" element={<MyPostsPage />} />
          <Route path="/edit-post/:postId" element={<EditPostPage />} />  
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/tutor-form" element={<TutorFormPage />} />
          <Route path="/all-tutors" element={<AllTutorsPage />} />
          <Route path="/my-applied-posts" element={<MyAppliedPostsPage />} />
          <Route path="/tutor-details/:tutorId" element={<TutorDetailsPage />} />
          <Route path="/tutor-profile" element={<TutorProfilePage />} />
          <Route path="/edit-tutor-profile" element={<EditTutorProfilePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/tutors-verification" element={<TutorVerificationPage />} />
          <Route path="/users-management" element={<UserManagementPage />} />
          <Route path="/posts-management" element={<PostManagementPage />} />
          <Route path="/tutor-requests" element={<TutorRequestsPage />} />
          <Route path="/my-sent-requests" element={<MySentRequestsPage />} />

        </Routes>
      </Router>
  );
}

export default App;

