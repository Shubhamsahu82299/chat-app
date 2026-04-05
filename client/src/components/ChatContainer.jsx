import React, { useEffect, useRef, useContext, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {
 const { messages, selectedUser, sendMessage, getMessages, setSelectedUser } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)
  const [input, setInput] = useState('')
  const scrollEnd = useRef();

  const prevMessagesLength = useRef(messages.length);
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
  }

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result })
      e.target.value = ""
    }
    reader.readAsDataURL(file);
  }

  // Effect to fetch old messages
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]) // Added getMessages dependency

  // Effect to scroll to bottom
 useEffect(() => {
    // Check karein ki kya naya message aaya hai ya pehli baar chat khuli hai
    const isNewMessage = messages.length === prevMessagesLength.current + 1;
    const isFirstLoad = prevMessagesLength.current === 0 && messages.length > 0;

    if (scrollEnd.current && (isNewMessage || isFirstLoad)) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Agli baar ke liye current length save karein
    prevMessagesLength.current = messages.length;
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 flex-1 max-md:hidden'>
        <img src={assets.logo_icon} className='max-w-16' alt="" />
        <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
      </div>
    )
  }

  return (
    <div className='h-full flex flex-col overflow-hidden relative backdrop-blur-lg'>
      {/* Header */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <button 
          onClick={() => setSelectedUser(null)} 
          className='md:hidden p-2 hover:bg-white/10 rounded-full transition-colors'
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full object-cover" />
        <div className='flex-1'>
          <p className='text-lg text-white flex items-center gap-2'>
            {selectedUser.fullName}
            {onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </p>
          <p className='text-xs text-gray-400'>
            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar'>
        {messages && messages.map((msg, index) => {
          const isSentByMe = msg.senderId === authUser._id;
          return (
            <div key={msg._id || index} className={`flex items-end gap-2 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
              {!isSentByMe && (
                <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-6 h-6 rounded-full' />
              )}
              <div className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}>
                {msg.image ? (
                  <img src={msg.image} alt="" className='max-w-[230px] rounded-lg border border-gray-700' />
                ) : (
                  <div className={`p-2.5 max-w-[250px] rounded-2xl text-sm ${isSentByMe ? 'bg-violet-600 text-white rounded-br-none' : 'bg-zinc-800 text-gray-100 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                )}
                <span className='text-[10px] text-gray-500 mt-1'>{formatMessageTime(msg.createdAt)}</span>
              </div>
              {isSentByMe && (
                <img src={authUser.profilePic || assets.avatar_icon} alt="" className='w-6 h-6 rounded-full' />
              )}
            </div>
          )
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input Area */}
      <div className='p-4 bg-transparent'>
        <form onSubmit={handleSendMessage} className='flex items-center gap-2 bg-zinc-900/50 p-2 rounded-full border border-gray-700'>
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Type a message..."
            className='flex-1 bg-transparent border-none outline-none text-white px-3 text-sm'
          />
          <input onChange={handleSendImage} type="file" id='image-upload' accept='image/*' hidden />
          <label htmlFor="image-upload" className='cursor-pointer p-1 hover:bg-gray-700 rounded-full'>
            <img src={assets.gallery_icon} alt="" className='w-5' />
          </label>
          <button type="submit" className='p-2 bg-violet-600 rounded-full hover:bg-violet-700 transition-all'>
            <img src={assets.send_button} alt="" className='w-4' />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatContainer