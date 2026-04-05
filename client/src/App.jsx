import './index.css'
import { useContext } from 'react' // 1. useContext import kiya
import { Routes, Route, Navigate } from 'react-router-dom'; // 2. Navigate add kiya
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
function App() {
  // 4. useContext ko yahan initialize kiya
  const { authUser } = useContext(AuthContext);

  return (
    <>
      {/* 5. Tailwind class fix: agar bgImage.svg assets mein hai toh path check karein */}
      <div className="bg-[url('/bgImage.svg')] bg-contain min-h-screen">
        <Toaster />
        <Routes>
          {/* Protected Routes Logic */}
          <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
          <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
          <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
        </Routes>
      </div>
    </>
  )
}

export default App