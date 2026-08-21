import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar.jsx';
import Home from './Pages/Public_Pages/Home/Home.jsx'
import About from './Pages/Public_Pages/About/About.jsx';
import Services from './Pages/Public_Pages/Services/Services.jsx';
import ContactUs from './Pages/Public_Pages/Contact_Us/ContactUs.jsx';
import SignUp from './Pages/Public_Pages/SignUp/SignUp.jsx';
import SignIn from './Pages/Public_Pages/SignIn/SignIn.jsx';
import Dashboard from './Pages/User_Pages/Dashboard/Dashboard.jsx';
import Projects from './Pages/User_Pages/Projects/Projects.jsx';
import PublicRoute from './Routes/PublicRoute.jsx';
import ProtectedRoute from './Routes/ProtectedRoute.jsx';
import CreateProject from './Pages/User_Pages/CreateProject/CreateProject.jsx';
import SingleProject from './Pages/User_Pages/SingleProjectPage/SingleProjectPage.jsx';
import Messages from './Pages/User_Pages/Messages/Messages.jsx';
import Notifications from './Pages/User_Pages/Notifications/Notifications.jsx';
import Profile from './Pages/User_Pages/Profile/Profile.jsx';
import Settings from './Pages/User_Pages/Settings/Settings.jsx';
import MyProjects from './Pages/User_Pages/MyProjects/MyProjects.jsx';
import Wishlist from './Pages/User_Pages/Wishlist/Wishlist.jsx';
import EditProject from './Pages/User_Pages/EditProject/EditProject.jsx';

const App = () => {
  const location = useLocation();

  return (
    <>
      {location.pathname == "/" ? <Navbar /> :
        location.pathname == "/about" ? <Navbar /> :
          location.pathname == "/services" ? <Navbar /> :
            location.pathname == "/contactUs" ? <Navbar /> : ""}

      <Routes>
          //! Public Routes //
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/services' element={<Services />} />
        <Route path='/contactUs' element={<ContactUs />} />

          //! based on login and logout
        <Route element={<PublicRoute />}>
          <Route path='/signUp' element={<SignUp />} />
          <Route path='/signIn' element={<SignIn />} />
        </Route>

          //! Protected Routes //
        <Route element={<ProtectedRoute />} >
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/projects' element={<Projects />} />
          <Route path='/projects/createProject' element= {<CreateProject />} />
          <Route path='/projects/:projectId' element={<SingleProject />} />
          <Route path='/projects/myProjects' element={<MyProjects />} />
          <Route path='/projects/:projectId/edit' element={<EditProject />} />
          <Route path='/messages' element={<Messages />} />
          <Route path='/messages/:projectId' element={<Messages />} />
          <Route path='/messages/user/:dmUserId' element={<Messages />} />
          <Route path='/notifications' element={<Notifications />} />
          <Route path='/profile/:username' element={<Profile />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/projects/wishlist' element={<Wishlist />} />
        </Route>
      </Routes>
    </>
  )
}

export default App