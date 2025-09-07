import express from "express";
import { authMiddleware } from "../middlewares/auth";
import { createTicket, getTicket, getTickets } from "../controllers/ticket";


const router = express.Router();

router.get("/", authMiddleware, getTickets)
router.get("/:id", authMiddleware, getTicket)
router.post("/create-ticket", authMiddleware, createTicket)

export default router