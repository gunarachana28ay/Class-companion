import './App.css';
import Chat from './pages/Chat';
import AddAvailability from './pages/AddAvailability';
import Appointment from './pages/Appointment';
import AppointmentList from './pages/AppointmentList';
import { UserProvider } from './context/UserContext';
import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route
} from 'react-router-dom';
import Search from './pages/Search';
import Tutor from './pages/Tutor';
import Profile from './pages/Profile';
import { SignupForm } from './pages/Signup';
import { LoginForm } from './pages/Login';
import { GetDataPage } from './pages/GetUser';
import { ChatLobby } from './pages/ChatLobby';
import { Home } from './pages/Home';
import ModeratorDashboard from './pages/Moderator';
import MediaRequestDetail from './pages/MediaRequestDetail';
import TutorProfile from './pages/TutorProfile';
import { ToastContainer } from 'react-toastify';
import UserProfile from './pages/UserProfile';

import ProtectedRoute from './ProtectedRoute';
import Layout from './components/Layout';

const router = createBrowserRouter([{
  path: "/",
  element: <Layout />,
  children: [
    {
      path: "/",
      Component: Home,
    },
    {
      path: "/tutors",
      Component: Tutor,
    },
    {
      path: "/tutors/tutor_details/:id",
      Component: TutorProfile,
    }
    ,
    {
      path: "/profile",
      Component: UserProfile,
    },
    {
      path: "/login",
      Component: LoginForm,
    },
    {
      path: "/signup",
      Component: SignupForm,
    },
    {
      path: "/getData",
      Component: GetDataPage,
    },
    {
      path: "/chat",
      element: <ChatLobby />,
    },
    {
      path: "/chat/:roomId",
      element: <ProtectedRoute>
        <Chat />
      </ProtectedRoute>,
    },
    {
      path: "/add-availability",
      element: <ProtectedRoute>
        <AddAvailability />
      </ProtectedRoute>,
    },
    {
      path: "/appointments-list",
      element: <ProtectedRoute>
        <AppointmentList />
      </ProtectedRoute>,
    },
    {
      path: "/appointment/:tutorId",
      element: <ProtectedRoute>
        <Appointment />
      </ProtectedRoute>,
    },
    {
      path: "/moderator",
      Component: ModeratorDashboard,
    },
    {
      path: "/media-request/:media_id",
      Component: MediaRequestDetail,
    },
  ]
}
]);

function App() {
  return (
    <div className="App">
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
      <ToastContainer />
    </div>
  );
}

export default App;
