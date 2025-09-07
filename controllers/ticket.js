import { inngest } from "../inngest/client"
import Ticket from "../models/ticket"


export const createTicket = async (req, res) => {
    try {
    const {title, description} = req.body
        if (!title || !description) {
            return res.status(400).json({error:"Ticket details required"})
        }
        
        
        const newTicket = await Ticket.create({
            title,
            description,
            createdBy: req.user._id.toString()
        })
        
        await inngest.send({
            name: 'ticket/created',
            data: {
                ticketId: newTicket?._id.toString(),
                title,
                description,
                createdBy:req.user._id.toString()
            }
            
        })
        
        return res.status(201).json({ error: "Ticket created and processing started ",ticket:newTicket })
        
    } catch (error) {
        console.error("error creating ticket",error.message)
        return res.status(501).json({ error: "Error creating ticket, server error" })
    }
}


export const getTickets = async (req, res) => {
    try {
        const user = req.user;
        
        let tickets = []
        
        if (user.role === "user") {
            tickets = await Ticket.find({createdBy:user._id}).sort({ createdAt: -1 }).select("title description status createdAt");
        }
        else
            tickets = await Ticket.find({}).populate("assignedTo",["email","_id", "name"]).sort({createdAt:-1});
        
        return res.status(201).json(tickets)
        
    } catch (error) {
        console.error("error getting tickets",error.message)
        return res.status(501).json({ error: "Error getting tickets, server error" })
    }
}

export const getTicket = async (req, res) => {
    try {
        const user = req.user;

        let ticket

        if (user.role === "user") {
            ticket = await Ticket.findOne({ createdBy: user._id,_id: req.params.id }).select("title description status createdAt");
        }
        else
            ticket = await Ticket.findById(req.params.id).populate("assignedTo", ["email", "_id", "name"])

        return res.status(201).json(ticket) 

    } catch (error) {
        console.error("error getting ticket", error.message)
        return res.status(501).json({ error: "Error getting ticket, server error" })
    }
}