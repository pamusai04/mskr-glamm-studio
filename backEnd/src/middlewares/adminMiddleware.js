const jwt = require("jsonwebtoken");
const User = require("../models/User");
const redisClient = require("../config/redis");

const adminMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please log in to continue.",
            });
        }

        const isBlacklisted = await redisClient.get(`token:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: "Session invalid. Please login again.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);

        if (!decoded._id) {
            return res.status(401).json({
                success: false,
                message: "Invalid token format.",
            });
        }

        const sessionKey = `session:${decoded._id}`;
        const sessionData = await redisClient.get(sessionKey);
        
        if (!sessionData) {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again.",
            });
        }

        const session = JSON.parse(sessionData);
        
        if (session.sessionId !== decoded.sessionId) {
            return res.status(401).json({
                success: false,
                message: "Session invalid. Please login again.",
            });
        }

        const user = await User.findById(decoded._id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated.",
            });
        }

        if (user.role !== "MadhuriShivaKumar") {
            return res.status(403).json({
                success: false,
                message: "Admin access only.",
            });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again.",
            });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please log in again.",
            });
        }
        return res.status(401).json({
            success: false,
            message: "Authentication failed.",
        });
    }
};

module.exports = adminMiddleware;