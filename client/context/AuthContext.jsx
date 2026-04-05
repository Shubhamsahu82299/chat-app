import {createContext} from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import { useState,useEffect } from "react";
import {io} from 'socket.io-client'
const backendurl=import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL=backendurl;
export const AuthContext=createContext();
export const AuthProvider=({children})=>{
    const [token,setToken]=useState(localStorage.getItem('token'))
    const [authUser,setAuthUser]=useState(null)
    const [onlineUsers,setOnlineUsers]=useState([])
    const [socket,setSocket]=useState(null)
  const checkAuth=async ()=>{
    try{
    
       const{data}= await axios.get("/api/auth/check-auth")
       if(data.success){
        setAuthUser(data.user);
        connectSocket(data.user)
       }

    }catch(error){
        toast.error(error.message);


    }
  }
  //login
  // AuthContext.jsx ke login function mein ye change karein
const login = async (state, credentials) => {
    try {
        const { data } = await axios.post(`/api/auth/${state}`, credentials);
        
        if (data.success) {
            // BACKEND CHECK: Signup par 'newUser' mil raha hai, Login par 'userData'
            // Dono ko handle karne ke liye logic:
            const user = data.userData || data.newUser; 
            
            setAuthUser(user);
            connectSocket(user);
            
            axios.defaults.headers.common['token'] = data.token;
            setToken(data.token);
            localStorage.setItem("token", data.token);
            
            toast.success(data.message);
            
            // Redirect automatic hoga kyunki 'authUser' state update ho gayi hai!
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
    }
};
  //logout 
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common['token'] = null;
    
    // SAFE DISCONNECT: Check karein socket exist karta hai ya nahi
    if (socket) socket.disconnect(); 
    setSocket(null); // Socket state ko bhi clear karein
    
    toast.success("Logged out successfully");
};
  //update user profile
  const updateProfile=async(body)=>{
    try {
        const {data}=await axios.put("/api/auth/update-profile",body)
        if(data.success){
            setAuthUser(data.user);
            toast.success("Profile updated successfully");
        }
        else{
            toast.error(data.message);
        }
    }catch(error){
        toast.error(error.message);
    }
}
//
  //connect socket 
  const connectSocket=(userData)=>{
    if(!userData||socket?.connected) return;
    const newSocket=io(backendurl,{query:{userId:userData._id}});
      newSocket.connect();
      setSocket(newSocket);
      newSocket.on("getOnlineUsers",(userIds)=>{
        setOnlineUsers(userIds);
      })
  }


  // AuthContext.jsx
// Jab app load ho, check karein ki kya pehle se token hai
useEffect(() => {
    const initAuth = async () => {
        const token = localStorage.getItem("token"); // LocalStorage se token uthayein
        if (token) {
            axios.defaults.headers.common['token'] = token;
            await checkAuth(); // Backend se user data fetch karein
        }
    };
    initAuth();
}, []); // Token change hone par re-run karein
    const value={
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }
return (
    <AuthContext.Provider value={value}>
        {children}
        </AuthContext.Provider>
)
}