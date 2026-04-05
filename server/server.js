import 'dotenv/config'; // Pehli line
import express from 'express';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import {Server} from "socket.io"
const app = express();
export const userSocketMap={};
export let io;
// ... baaki configuration ...
app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use("/api/status", (req,res)=>res.send("Server is live"));
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)
const startServer = async () => {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    io = new Server(server,{cors:{origin:"*"}});
    io.on("connection",(socket)=>{
        const userId=socket.handshake.query.userId;
        console.log("user connected",userId);
        if(userId) userSocketMap[userId]=socket.id;  
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
        socket.on("disconnect",()=>{ console.log("user disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    }) });
};
// server.js mein
app.use(cors({
    origin: "http://localhost:5173", // Aapke Vite frontend ka URL
    credentials: true
}));
startServer();