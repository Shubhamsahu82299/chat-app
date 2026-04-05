import React, { useState,useContext } from 'react'
import assets from '../assets/assets' // Ensure assets path is correct
import { useNavigate } from 'react-router-dom';
import {AuthContext} from "../../context/AuthContext"
const ProfilePage = () => {
  const {authUser,updateProfile}=useContext(AuthContext); 
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.fullName || ""); // Initial name from authUser
  const [bio, setBio] = useState(authUser?.bio || ""); // Initial bio from authUser
  const navigate = useNavigate();
 const handleSubmit = async (e) => { 
  e.preventDefault();
  if(!selectedImg){
    await updateProfile({fullName:name,bio});
      navigate('/'); 
      return;
  }
  const reader=new FileReader();
  reader.readAsDataURL(selectedImg);
  reader.onload=async()=>{
    const base64Image=reader.result;
    await updateProfile({fullName:name,bio,profilePic:base64Image});
navigate('/');
  }
  }
  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center bg-[#001030]'>
      <div className='w-5/6 max-w-4xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg bg-white/5'>
        
        {/* ------- Left: Form ------- */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
          <h3 className="text-2xl font-semibold text-white">Profile details</h3>
          
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input 
              onChange={(e) => setSelectedImg(e.target.files[0])} 
              type="file" 
              id='avatar' 
              accept='.png, .jpg, .jpeg' 
              hidden 
            />
            <img 
              src={selectedImg ? URL.createObjectURL(selectedImg) :authUser?.profilePic || assets.avatar_icon} 
              alt="Profile" 
              className='w-16 aspect-square rounded-full object-cover border-2 border-violet-500' 
            />
            <p className='text-sm text-gray-400'>upload profile image</p>
          </label>

          <input 
            onChange={(e) => setName(e.target.value)} 
            value={name} 
            type="text" 
            placeholder='Your name' 
            className='p-3 bg-transparent border border-gray-500 rounded-md outline-none focus:border-violet-500'
            required 
          />

          <textarea 
            onChange={(e) => setBio(e.target.value)} 
            value={bio} 
            placeholder='Write profile bio' 
            className='p-3 bg-transparent border border-gray-500 rounded-md outline-none focus:border-violet-500'
            rows="4"
            required
          ></textarea>

          <button className='bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 rounded-md hover:opacity-90 transition-all font-medium'>
            Save Profile
          </button>
        </form>

        {/* ------- Right: Preview Image ------- */}
        <div className='flex-1 flex justify-center max-sm:p-5'>
          <img 
            className='max-w-40 aspect-square rounded-full object-cover border-4
             border-gray-700 shadow-2xl' 
           src={selectedImg ? URL.createObjectURL(selectedImg) :authUser?.profilePic || assets.avatar_icon}
            alt="Preview" 
          />
        </div>

      </div>
    </div>
  )
}

export default ProfilePage