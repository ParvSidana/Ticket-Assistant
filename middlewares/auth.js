import jwt from "jsonwebtoken"; 

export const authMiddleware = (req,res,next) => {
    
    
    try {
        const token = req.headers.authorization.split(" ")[1];
        
        if (!token) {
            res.status(401).json({ error: "Token not found" });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
        next();
    } catch (error) {
        res.status(401).json({ error: "auth middleware error" });
    }
}