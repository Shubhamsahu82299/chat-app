import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from "socket.io";

const app = express();
export const userSocketMap = {};
export let io;

// CORS setup (Frontend URL change kijiye deploy hone ke baad)
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: "4mb" }));

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Database connection (Top-level await ya direct call)
connectDB();

// --- ZAROORI CHANGE ---
// Vercel ke liye default export chahiye
export default app; 

// Local development ke liye listen
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    
    // Socket.io initialization (Sirf local/VPS par kaam karega)
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