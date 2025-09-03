import bcrypt from "bcrypt"
import User from "../models/user"
import jwt from "jsonwebtoken"
import { inngest } from "../inngest/client"



export const signup = async (req, res) => {
    const { email, name, password, skills } = req.body;
    try {
        const hashedPass = await bcrypt.hash(password, 10);

        const user = await User.create({ email, name, password: hashedPass, skills })

        // Fire Inngest
        await inngest.send({
            name: "user/signup",
            data: { email }
        })

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET)

        res.json({
            message: "Signup successful 🎉",
            user,
            token
        });


    } catch (error) {
        res.status(500).json({ message: "Something went wrong during signup", details: error.message })
    }
}


export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" })
        }
        const checkPass = await bcrypt.compare(password, user.password);

        if (!checkPass) {
            return res.status(401).json({ error: "Password is incorrect" })
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET)

        res.json({
            message: "login successful 🎉",
            user,
            token
        });


    } catch (error) {
        res.status(500).json({ message: "Something went wrong during login", details: error.message })
    }
}


export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token)
            return res.status(401).json({ error: "Unauthorized" })
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(401).json({ error: "Unauthorized" })

        })

        res.json({
            message: "logout successful 🎉",
        });


    } catch (error) {
        res.status(500).json({ message: "Something went wrong during logout", details: error.message })
    }
}