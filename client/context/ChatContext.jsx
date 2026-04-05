import {createContext,useRef,useState,useContext,useEffect} from "react";
import {AuthContext} from './AuthContext';
export const ChatContext =createContext();
import toast from 'react-hot-toast';
export const ChatProvider=({children})=>{
    const [messages,setMessages]=useState([])
    const [users,setUsers]=useState([])
    const [selectedUser,setSelectedUser]=useState(null)
    const [unseenMessages,setUnseenMessages]=useState({})
    const {socket,axios}=useContext(AuthContext)
    //to get all users for sidebar
    // ChatContext.jsx ke andar
const getUsers = async () => {
    try {
     
        const { data } = await axios.get("/api/messages/users"); 
        
        if (data.success) {
            setUsers(data.users); // Ya jo bhi aapka array name hai
            setUnseenMessages(data.unseenMessages || {});
        }
    } catch (error) {
        // Yahan console.log karein taaki pata chale error kya hai
        console.log("getUsers error:", error.message);
        toast.error(error.message);
    }
};
    //get message for selected users
 // ChatContext.jsx ke getMessages function ke andar
const getMessages = async (userId) => {
    try {
        const { data } = await axios.get(`/api/messages/${userId}`);
        if (data.success) {
            setMessages(data.messages);

            // FIX: Method PUT karein aur URL match karein backend se (/mark/id)
            await axios.put(`/api/messages/mark/${userId}`); 
            
            setUnseenMessages(prev => ({ ...prev, [userId]: 0 }));
        }
    } catch (error) {
        console.log("Error:", error.message);
    }
};
    //send message to selected user
    const sendMessage=async(messageData)=>{
        try{
          const {data}=   await axios.post(`/api/messages/send/${selectedUser._id}`,messageData)

          if(data.success){
           setMessages((preMessages)=>[...preMessages,data.newMessage])
          }
          else{
            toast.error(data.message)
          }
        }catch(error){
            toast.error(error.message)
        }}

        // ChatContext.jsx ke top par
const selectedUserRef = useRef(null);

// Jab bhi selectedUser badle, Ref update karein
useEffect(() => {
    selectedUserRef.current = selectedUser;
}, [selectedUser]);
     const subscribeToMessages = () => {
    if (!socket) return;
    socket.off('newMessage');

    socket.on('newMessage', (newMessage) => {
        // Current selected user ki ID Ref se nikaalein
        const currentSelectedId = selectedUserRef.current?._id;

        if (currentSelectedId === newMessage.senderId) {
            setMessages((prev) => [...prev, newMessage]);
            axios.put(`/api/messages/mark/${newMessage.senderId}`);
        } else {
            // Functional state update is CRITICAL here
            setUnseenMessages((prev) => {
                const senderId = newMessage.senderId;
                const updatedCount = (prev[senderId] || 0) + 1;
                
                return {
                    ...prev,
                    [senderId]: updatedCount
                };
            });
        }
    });
};
        //unsubcribe from messages
        const unsubscribeFromMessages=()=>{
            if(socket) socket.off('newMessage')
        }
    useEffect(()=>{
        subscribeToMessages();
        return ()=>unsubscribeFromMessages();
    },[socket,selectedUser]) 
    const value={
      messages,users,selectedUser, getUsers,getMessages,sendMessage,setSelectedUser,unseenMessages,setUnseenMessages
    }
    return (  
        <ChatContext.Provider value={value}>
        {children}
        </ChatContext.Provider>
      )
}