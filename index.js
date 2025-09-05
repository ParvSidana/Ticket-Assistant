import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import userRoutes from "./routes/user.js"

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes)
app.use("/api/auth", userRoutes)

mongoose.connect(process.env.MONGO_URI, {
})
    .then(() => {
        console.log("MONGODB Connected")
        app.listen(PORT, () => console.log("Server at http://localhost:3000"))
    })
.catch((err)=>console.log("MONGODB error",err))

