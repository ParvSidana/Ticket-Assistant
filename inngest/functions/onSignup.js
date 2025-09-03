import { NonRetriableError } from "inngest";
import User from "../../models/user.js";
import { inngest } from "../client.js";
import { mailerUtil } from "../../utils/mailer.js";

// Create a function to handle user signups
export const onSignup = inngest.createFunction(
    { id: "On-User-Signup",retries: 2 },
    { event: "user/signup" },
    async ({ event, step }) => {
        try {
            // Log the event data for debugging purposes
            console.log("Signup event received:", event.data);
            const { email } = event.data;
            const findUserStep = await step.run("get-user-email", async () => {
                const user = User.findOne({ email })
                if (!user) {
                    throw new NonRetriableError("User not found");
                }
                return user;
            })
            
            await step.run("send-welcome-email", async () => {
                const subject = "Welcome aboard! 🎉";
                const message = `
                    Hi ${findUserStep.name || "there"},
                    
                    We're really glad to have you with us. 🚀  
                    
                    You can now start exploring and making the most out of your new account.  
                    
                    If you ever need help, just let us know — we’re always here for you.  
                    
                    Cheers,  
                    The Team
                `;
                
                await mailerUtil(findUserStep.email,subject,message)
            })
            return { success: true };
        } catch (error) {
            console.log("Error in onSignup function:", error);
        }
    }
) 