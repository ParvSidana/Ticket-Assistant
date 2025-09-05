import express from "express";
import { authMiddleware } from "../middlewares/auth";
import { getUsers, login, logout, signup, updateUser } from "../controllers/user";


const router = express.Router();

router.post("/signup",signup )
router.post("/login",login )
router.post("/logout",logout )

router.get("/users", authMiddleware,getUsers)
router.post("/update-user", authMiddleware,updateUser)


export default router