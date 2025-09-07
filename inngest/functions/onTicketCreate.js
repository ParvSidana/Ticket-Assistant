import { NonRetriableError } from "inngest";
import Ticket from "../../models/ticket.js";
import { inngest } from "../client.js";
import analyzeTicket from "../../utils/agent.js";
import User from "../../models/user.js";

// Create a function to handle user signups
export const onTicketCreated = inngest.createFunction(
    { id: "On-Ticket-Created", retries: 2 },
    { event: "ticket/created" },
    async ({ event, step }) => {
        try {
            // Log the event data for debugging purposes
            const { ticketId } = event.data;
            const ticket = await step.run("get-ticket", async () => {
                const ticketObject = Ticket.findById({ ticketId })
                if (!ticket) {
                    throw new NonRetriableError("ticket not found");
                }
                return ticketObject;
            })

            await step.run("update-ticket-status", async () => {
                await Ticket.findByIdAndUpdate(ticket._id, { status: "open" })
            })

            const aiRes = await analyzeTicket(ticket)

            const relatedSkills = await step.run("ai-processing", async () => {
                let skills = []
                if (aiRes) {
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        priority: !["low", "medium", "high"].includes(aiRes.priority) ? "medium" : aiRes.priority,
                        status: "inProgres",
                        comments: aiRes.helpfulNotes,
                        relatedSkills: aiRes.relatedSkills
                    })
                    skills = aiRes.relatedSkills
                }
                return skills;
            })

            const assignModerator = await step.run("assign-moderator", async () => {
                let user = User.findOne({
                    role: "moderator",
                    skills: {
                        $elemMatch: {
                            $regex: relatedSkills.join("|"),
                            $options: "i"
                        }
                    }
                })

                if (!user) {
                    user = await User.findOne({ role: "admin" })
                }

                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user?._id
                })
                return user;
            })

            await step.run("send-ticket-email", async () => {
                const subject = "New Support Ticket Assigned to You";
                const message = `
                        Hello ${assignModerator.name},

                        A new support ticket has been assigned to you.

                        Please review the ticket details in the dashboard and take the necessary action.

                        Thank you,
                        Support Team
                    `;
                if (assignModerator) {
                    await mailerUtil(assignModerator.email, subject, message)
                }
            })


            return { success: true };
        } catch (error) {
            console.log("Error in Ticket Creation steps function:", error.message);
            return { success: false };

        }
    }
) 