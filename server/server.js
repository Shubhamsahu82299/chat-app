import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from "socket.io";

const app = express();

// 1. Database Connection (Immediate call)
connectDB().catch(err => console.error("MongoDB Connection Error:", err));

// 2. Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json({ limit: "4mb" }));

// 3. Routes
app.get("/", (req, res) => res.send("Chat App API is Live!"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// 4. Socket.io Logic (Only for Local/VPS)
export const userSocketMap = {};
export let io;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => console.log(`🚀 Local Server on port ${PORT}`));
    
    io = new Server(server, { cors: { origin: "*" } });
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) userSocketMap[userId] = socket.id;
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        socket.on("disconnect", () => {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });
}

// 5. CRITICAL: Vercel needs this!
export default app;