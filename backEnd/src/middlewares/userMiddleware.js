const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redisClient = require("../config/redis");

const getAccessTokenExpiryMs = () => {
    const expiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";
    const value = parseInt(expiry);
    if (expiry.includes('s')) return value * 1000;
    if (expiry.includes('m')) return value * 60 * 1000;
    if (expiry.includes('h')) return value * 60 * 60 * 1000;
    if (expiry.includes('d')) return value * 24 * 60 * 60 * 1000;
    return 15 * 60 * 1000;
};

const userMiddleware = async (req, res, next) => {
    try {
        const { token, refreshToken } = req.cookies;

        if (!token && !refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Please login to continue."
            });
        }

        let payload;
        let currentToken = token;

        try {
            if (token) {
                payload = jwt.verify(token, process.env.JWT_KEY);
            }
        } catch (tokenError) {
            if (tokenError.name === 'TokenExpiredError' && refreshToken) {
                try {
                    const refreshPayload = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

                    const user = await User.findById(refreshPayload._id)
                        .select('+refreshToken +refreshTokenExpiry');

                    if (user && user.isActive && 
                        user.refreshToken === refreshToken && 
                        user.refreshTokenExpiry > new Date()) {
                        
                        const sessionKey = `session:${user._id}`;
                        const sessionData = await redisClient.get(sessionKey);
                        
                        if (!sessionData) {
                            return res.status(401).json({
                                success: false,
                                message: "Session expired. Please login again.",
                            });
                        }

                        const session = JSON.parse(sessionData);
                        
                        if (session.sessionId !== refreshPayload.sessionId) {
                            return res.status(401).json({
                                success: false,
                                message: "Session invalid. You have been logged out from another device.",
                            });
                        }
                        
                        const newAccessToken = jwt.sign(
                            { 
                                _id: user._id, 
                                emailId: user.emailId, 
                                role: user.role, 
                                sessionId: session.sessionId 
                            },
                            process.env.JWT_KEY,
                            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
                        );

                        res.cookie('token', newAccessToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                            maxAge: getAccessTokenExpiryMs()
                        });

                        payload = jwt.verify(newAccessToken, process.env.JWT_KEY);
                        currentToken = newAccessToken;
                    } else {
                        return res.status(401).json({
                            success: false,
                            message: "Session expired. Please login again.",
                        });
                    }
                } catch (refreshError) {
                    return res.status(401).json({
                        success: false,
                        message: "Session expired. Please login again.",
                    });
                }
            } else {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token. Please login again.",
                });
            }
        }

        if (!payload) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed. Please login again.",
            });
        }

        const { _id, sessionId: tokenSessionId } = payload;
        if (!_id) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed. Please login again.",
            });
        }

        const sessionKey = `session:${_id}`;
        const sessionData = await redisClient.get(sessionKey);
        
        if (!sessionData) {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again.",
            });
        }

        const session = JSON.parse(sessionData);
        
        if (session.sessionId !== tokenSessionId) {
            return res.status(401).json({
                success: false,
                message: "Session invalid. You have been logged out from another device.",
            });
        }

        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account not found. Please login again.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account deactivated. Contact support.",
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first.",
                requiresVerification: true
            });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again.",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Authentication failed. Please try again.",
        });
    }
};

module.exports = userMiddleware;