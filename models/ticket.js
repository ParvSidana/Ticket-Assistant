import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    status: { type: String, enum: ['open', 'inProgres', 'closed'], default: 'open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: String,
    deadline: Date,
    comments: String,
    relatedSkills: [String],
},
    { timestamps: true }
);

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;