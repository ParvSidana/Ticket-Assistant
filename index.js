import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { serve } from 'inngest/express';
import userRoutes from "./routes/user.js"
import ticketRoutes from "./routes/ticket.js"
import { inngest } from './inngest/client.js';
import { onSignup, } from './inngest/functions/onSignup.js';
import { onTicketCreated } from './inngest/functions/onTicketCreate.js';


const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes)
app.use("/api/tickets", ticketRoutes)

app.use("/api/inngest", serve({
    client: inngest,
    functions: [onSignup, onTicketCreated]
}))

mongoose.connect(process.env.MONGO_URI, {
})
    .then(() => {
        console.log("MONGODB Connected")
        app.listen(PORT, () => console.log("Server at http://localhost:3000"))
    })
.catch((err)=>console.log("MONGODB error",err))

