import { createAgent,gemini } from '@inngest/agent-kit';


const analyzeTicket = async (ticket) => {
    
    const agent = createAgent({
        name: 'AI Ticket Assistant',
        description: '',
        system: `
            You are an expert AI Ticket Assistant. Your job is to process and analyze support tickets and output results in raw JSON only. 

            Output Conditions (very important):
            - The output must be strictly valid JSON.
            - Do not wrap in markdown, code blocks, or extra text.
            - Do not include explanations or commentary outside of JSON.
            - Ensure all keys are present exactly as specified, even if values are empty.
            - If information is missing, use an empty string "" or empty array [].

            Output Format:
            {
            "summary": "Brief summary of the issue in 1–2 sentences.",
            "priority": "low | medium | high | urgent",
            "helpfulNotes": "Helpful notes for the human moderators to better understand or troubleshoot the issue. Can also include relevant resource links (e.g., official docs, tutorials, knowledge base).",
            "relatedSkills": [] //e.g. ["React","MongoDB",...]
            }
            `,
        model: gemini({
            model: 'gemini-2.5-flash',
            apiKey: process.env.GEMINI_API_KEY
        }),
    });
    
    const res = await agent.run(`You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.
        
        Analyze the following support ticket and provide a JSON object with:

        - summary: A short 1-2 sentence summary of the issue.
        - priority: One of "low", "medium", or "high".
        - helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
        - relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).

        Respond ONLY in this JSON format and do not include any other text or markdown in the answer:

        {
        "summary": "Short summary of the ticket",
        "priority": "high",
        "helpfulNotes": "Here are useful tips...",
        "relatedSkills": ["React", "Node.js"]
        }

        ---

        Ticket information:

        - Title: ${ticket.title}
        - Description: ${ticket.description}`
    );
    
    console.log("res",res)
    
    const raw = res.output[0].context;
    try {
        const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
        const jsonString = match ? match[1] : raw.trim();
        return JSON.parse(jsonString);
    } catch (e) {
        console.log("Failed to parse JSON from AI response" + e.message);
        return null; // watch out for this
    }

}

export default analyzeTicket
