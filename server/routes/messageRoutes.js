import express from "express"
import {protectRoute} from "../middleware/auth.js"
import {getMessage,getUsersForSidebar,markMessagesAsSeen,sendMessage} from "../controllers/messageControllers.js"
const messageRouter=express.Router();
messageRouter.get("/users",protectRoute,getUsersForSidebar);
messageRouter.get("/:id",protectRoute,getMessage);
messageRouter.put("/mark/:id",protectRoute,markMessagesAsSeen);
messageRouter.post("/send/:id",protectRoute,sendMessage)
export default messageRouter;