import React, { useState, useContext } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  
  const { login } = useContext(AuthContext)

  const onSubmitHandler = (e) => {
    e.preventDefault();

    if (currState === "Sign up") {
      // Step 1: Agar user pehle step par hai, toh sirf state change karo
      if (!isDataSubmitted) {
        setIsDataSubmitted(true);
        return; // API call mat karo abhi
      }
      // Step 2: Jab user Bio screen par ho, tab final signup call karo
      login("signup", { email, password, fullName, bio });
    } else {
      // Login ke liye direct call
      login("login", { email, password });
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* ------- left ------- */}
      <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]' />

      {/* ------- right ------- */}
      <form onSubmit={onSubmitHandler} className='border-2 bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg w-full max-w-md'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && (
            <img 
              onClick={() => setIsDataSubmitted(false)} 
              src={assets.arrow_icon} 
              alt="back" 
              className='w-5 cursor-pointer rotate-180' // Back arrow logic
            />
          )}
        </h2>

        {/* Step 1 Fields: Name, Email, Password */}
        {!isDataSubmitted && (
          <div className='flex flex-col gap-4'>
            {currState === "Sign up" && (
              <input 
                onChange={(e) => setFullName(e.target.value)} 
                value={fullName}
                type="text" 
                className='p-2 border border-gray-400 rounded-md focus:outline-none bg-transparent text-white' 
                placeholder="Full Name" 
                required
              />
            )}
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email}
              type="email" 
              placeholder="Email address"
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white' 
              required
            />
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              type="password"
              placeholder="Password"
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white' 
              required
            />
          </div>
        )}

        {/* Step 2 Field: Bio (Only for Signup) */}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea 
            onChange={(e) => setBio(e.target.value)} 
            value={bio} 
            rows={4} 
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white placeholder-gray-400' 
            placeholder='Provide a short bio...' 
            required
          ></textarea>
        )}

        <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer hover:opacity-90 transition-all'>
          {currState === "Sign up" 
            ? (isDataSubmitted ? "Create Account" : "Next") 
            : "Login Now"}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-300'>
        <input type="checkbox" className='cursor-pointer' required />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currState === "Sign up" ? (
            <p className='text-sm text-gray-400'>
              Already have an account? 
              <span 
                onClick={() => { setCurrState("Login"); setIsDataSubmitted(false); }} 
                className='font-medium text-violet-500 cursor-pointer ml-1'
              >
                Login here
              </span>
            </p>
          ) : (
            <p className='text-sm text-gray-400'>
              Don't have an account? 
              <span 
                onClick={() => { setCurrState("Sign up"); setIsDataSubmitted(false); }} 
                className='font-medium text-violet-500 cursor-pointer ml-1'
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoginPage