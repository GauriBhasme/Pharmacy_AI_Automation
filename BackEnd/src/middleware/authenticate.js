import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
    try {
        // Check for token in Authorization header
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        // If not in header, check cookie
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: No token provided",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("AUTH HEADER:", req.headers.authorization)
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized: Invalid or expired token",
        });
    }
}