import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import {io,userSocketMap} from "../server.js"
export const getUsersForSidebar=async (req,res)=>{
  try{
    const userID=req.user._id;
    const filteredUsers=await User.find({_id:{$ne:userID}}).select("-password");
    const unseenMessages={}
    const promises=filteredUsers.map(async(user)=>{
        const message=await Message.find({senderId:user._id,receiverId:userID,seen:false});
      if(message.length>0){
        unseenMessages[user._id]=message.length;
      }
    })
     await Promise.all(promises);
    res.json({success:true,users:filteredUsers,unseenMessages})
  }catch(error){
    console.log(error.message);
    res.json({success:false,message:error.message});
   
  }
}
export const getMessage=async(req,res)=>{
    try{
        const selectedUserId=req.params.id;
    const myID=req.user._id;
    const messages=await Message.find({
        $or:[
            {senderId:myID,receiverId:selectedUserId},
            {senderId:selectedUserId,receiverId:myID}
        ]
    })
    await Message.updateMany({senderId:selectedUserId,receiverId:myID},{seen:true});
    res.json({success:true,messages}); 
    }catch(error){
    console.log(error.message);
    res.json({success:false,message:error.message});
   
  }
}
//mark messages as seen by id
export const markMessagesAsSeen=async(req,res)=>{
    try{
        const selectedUserId=req.params.id;
        const myID = req.user._id;
        await Message.updateMany({senderId:selectedUserId,receiverId:myID},{seen:true})
        res.json({success:true,message:"messages marked as seen"});
    }
    catch(error){
    console.log(error.message);
    
    res.json({success:false,message:error.message});
   
  } 
}
export const sendMessage =async(req,res)=>{
    try{
       const {text,image}=req.body
       const receiverId=req.params.id;
       const senderId=req.user._id;
       let imageUrl;
       if(image){
           const uploadResponse=await cloudinary.uploader.upload(image, { folder: "messages" });
           imageUrl=uploadResponse.secure_url;
       }
       const newMessage=await Message.create({senderId,receiverId,text,image:imageUrl});
         const receiverSocketId=userSocketMap[receiverId];
         if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
         }
       res.json({success:true,newMessage});

    }
    catch(error){
    console.log(error.message);
    res.json({success:false,message:error.message});
   
  }
}