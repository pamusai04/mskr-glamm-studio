const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const redisClient = require("../config/redis");
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const validateUserInput = require('../utils/validateUser');

const handleErrorResponse = (res, statusCode, message = "Something went wrong") => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};


const getAccessTokenExpiryMs = () => {
    const expiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";
    const value = parseInt(expiry);
    if (expiry.includes('s')) return value * 1000;
    if (expiry.includes('m')) return value * 60 * 1000;
    if (expiry.includes('h')) return value * 60 * 60 * 1000;
    if (expiry.includes('d')) return value * 24 * 60 * 60 * 1000;
    return 15 * 60 * 1000;
};

const getRefreshTokenExpiryMs = () => {
    const expiry = process.env.REFRESH_TOKEN_EXPIRY || "5d";
    const value = parseInt(expiry);
    if (expiry.includes('s')) return value * 1000;
    if (expiry.includes('m')) return value * 60 * 1000;
    if (expiry.includes('h')) return value * 60 * 60 * 1000;
    if (expiry.includes('d')) return value * 24 * 60 * 60 * 1000;
    return 7 * 24 * 60 * 60 * 1000;
};

const getRefreshTokenExpiryDate = () => {
    const expiry = process.env.REFRESH_TOKEN_EXPIRY || "5d";
    const value = parseInt(expiry);
    const now = new Date();
    if (expiry.includes('s')) return new Date(now.getTime() + value * 1000);
    if (expiry.includes('m')) return new Date(now.getTime() + value * 60 * 1000);
    if (expiry.includes('h')) return new Date(now.getTime() + value * 60 * 60 * 1000);
    if (expiry.includes('d')) return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
};

const generateSessionId = () => {
    return crypto.randomBytes(32).toString('hex');
};
const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        path: "/"
    };
};


const setTokenCookies = (res, accessToken, refreshToken) => {
    res.cookie('token', accessToken, {
        ...getCookieOptions(),
        maxAge: getAccessTokenExpiryMs()
    });

    res.cookie('refreshToken', refreshToken, {
        ...getCookieOptions(),
        maxAge: getRefreshTokenExpiryMs()
    });
};

const clearTokenCookies = (res) => {
    res.clearCookie('token', getCookieOptions());
    res.clearCookie('refreshToken', getCookieOptions());
};

const register = async (req, res) => {
    try {
        const { fullName, emailId, password, contactNumber } = req.body;

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return handleErrorResponse(res, 400, "Email already registered");
        }

        validateUserInput(req.body);

        const user = await User.create({
            fullName,
            emailId,
            password,
            contactNumber,
            role: 'user',
            isActive: true,
            isEmailVerified: false
        });

        const otpCode = await otpService.storeOTP(emailId);
        await emailService.sendOTPEmail(emailId, fullName, otpCode);

        return res.status(201).json({
            success: true,
            message: "OTP sent to your email",
            requiresVerification: true,
            emailId
        });

    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return handleErrorResponse(res, 409, field === 'emailId' ? "Email already registered" : "Phone number already registered");
        }
        return handleErrorResponse(res, 400, error.message);
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { emailId, otpCode } = req.body;

        if (!emailId || !otpCode) {
            return handleErrorResponse(res, 400, "Email and OTP code are required");
        }

        const verificationResult = await otpService.verifyOTP(emailId, otpCode);

        if (!verificationResult.success) {
            return handleErrorResponse(res, 400, verificationResult.message);
        }

        const user = await User.findOne({ emailId });

        const sessionId = generateSessionId();

        const accessToken = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role, sessionId: sessionId },
            process.env.JWT_KEY,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        );

        const refreshToken = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role, sessionId: sessionId },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '5d' }
        );

        const sessionKey = `session:${user._id}`;
        await redisClient.setEx(
            sessionKey,
            getRefreshTokenExpiryMs() / 1000,
            JSON.stringify({
                sessionId: sessionId,
                device: req.headers['user-agent'] || 'Unknown',
                ip: req.ip || req.connection.remoteAddress,
                loginTime: new Date().toISOString()
            })
        );

        user.refreshToken = refreshToken;
        user.refreshTokenExpiry = getRefreshTokenExpiryDate();
        await user.save();

        setTokenCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully!",
            user: {
                _id: user._id,
                fullName: user.fullName,
                emailId: user.emailId,
                contactNumber: user.contactNumber,
                role: user.role,
                profilePhoto: user.profilePhoto,
                isActive: user.isActive,
                isEmailVerified: true,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        return handleErrorResponse(res, 500, error.message);
    }
};

const resendOTP = async (req, res) => {
    try {
        const { emailId } = req.body;

        if (!emailId) {
            return handleErrorResponse(res, 400, "Email is required");
        }

        const user = await User.findOne({ emailId });

        if (!user) {
            return handleErrorResponse(res, 404, "User not found");
        }

        if (user.isEmailVerified) {
            return handleErrorResponse(res, 400, "Email already verified");
        }

        const otpCode = await otpService.storeOTP(emailId);
        await emailService.sendOTPEmail(emailId, user.fullName, otpCode);

        return res.status(200).json({
            success: true,
            message: "New OTP sent to your email"
        });

    } catch (error) {
        return handleErrorResponse(res, 500, error.message);
    }
};

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress || 'Unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown Device';

        if (!emailId || !password) {
            return handleErrorResponse(res, 400, "Email and password are required");
        }

        const user = await User.findOne({ emailId })
            .select('+password +refreshToken +refreshTokenExpiry');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return handleErrorResponse(res, 401, "Invalid credentials");
        }

        if (!user.isActive) {
            return handleErrorResponse(res, 403, "Account is deactivated");
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in",
                requiresVerification: true,
                emailId: user.emailId
            });
        }

        const newSessionId = generateSessionId();

        const sessionKey = `session:${user._id}`;
        await redisClient.setEx(
            sessionKey,
            getRefreshTokenExpiryMs() / 1000,
            JSON.stringify({
                sessionId: newSessionId,
                device: userAgent,
                ip: clientIP,
                loginTime: new Date().toISOString()
            })
        );

        const accessToken = jwt.sign(
            { 
                _id: user._id, 
                emailId: user.emailId, 
                role: user.role, 
                sessionId: newSessionId 
            },
            process.env.JWT_KEY,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        );

        const refreshToken = jwt.sign(
            { 
                _id: user._id, 
                emailId: user.emailId, 
                role: user.role, 
                sessionId: newSessionId 
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '5d' }
        );

        user.refreshToken = refreshToken;
        user.refreshTokenExpiry = getRefreshTokenExpiryDate();
        await user.save();

        setTokenCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                fullName: user.fullName,
                emailId: user.emailId,
                contactNumber: user.contactNumber,
                role: user.role,
                gender: user.gender,
                profilePhoto: user.profilePhoto,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        return handleErrorResponse(res, 500, "Login failed: " + error.message);
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return handleErrorResponse(res, 401, "No refresh token found");
        }

        let payload;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
        } catch (error) {
            return handleErrorResponse(res, 401, "Invalid refresh token");
        }

        const { _id, sessionId: tokenSessionId } = payload;

        const sessionKey = `session:${_id}`;
        const sessionData = await redisClient.get(sessionKey);
        
        if (!sessionData) {
            return handleErrorResponse(res, 401, "Session expired. Please login again.");
        }

        const session = JSON.parse(sessionData);
        
        if (session.sessionId !== tokenSessionId) {
            return handleErrorResponse(res, 401, "Session invalid. You have been logged out from another device.");
        }

        const newSessionId = generateSessionId();
        
        await redisClient.setEx(
            sessionKey,
            getRefreshTokenExpiryMs() / 1000,
            JSON.stringify({
                ...session,
                sessionId: newSessionId,
                refreshTime: new Date().toISOString()
            })
        );

        const newAccessToken = jwt.sign(
            { _id: _id, emailId: payload.emailId, role: payload.role, sessionId: newSessionId },
            process.env.JWT_KEY,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        );

        const newRefreshToken = jwt.sign(
            { _id: _id, emailId: payload.emailId, role: payload.role, sessionId: newSessionId },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '5d' }
        );

        await User.findByIdAndUpdate(_id, {
            $set: {
                refreshToken: newRefreshToken,
                refreshTokenExpiry: getRefreshTokenExpiryDate()
            }
        });

        setTokenCookies(res, newAccessToken, newRefreshToken);

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully"
        });

    } catch (error) {
        return handleErrorResponse(res, 500, "Failed to refresh token");
    }
};

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return handleErrorResponse(res, 400, "No token found");
        }

        const payload = jwt.decode(token);
        if (payload && payload._id) {
            const sessionKey = `session:${payload._id}`;
            await redisClient.del(sessionKey);

            await User.findByIdAndUpdate(payload._id, {
                $set: {
                    refreshToken: null,
                    refreshTokenExpiry: null
                }
            });
        }

        clearTokenCookies(res);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        return handleErrorResponse(res, 500, "Logout failed: " + error.message);
    }
};

const checkAuth = async (req, res) => {
    try {
        if (!req.user) {
            return handleErrorResponse(res, 401, "Not authenticated");
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return handleErrorResponse(res, 401, "User not found");
        }

        if (!user.isActive) {
            return handleErrorResponse(res, 403, "Account is deactivated");
        }

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                emailId: user.emailId,
                contactNumber: user.contactNumber,
                role: user.role,
                gender: user.gender,
                profilePhoto: user.profilePhoto,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        return handleErrorResponse(res, 500, "Please log in to continue");
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return handleErrorResponse(res, 400, "Current password and new password are required");
        }

        if (newPassword.length < 8) {
            return handleErrorResponse(res, 400, "New password must be at least 8 characters");
        }

        const user = await User.findById(userId).select('+password');

        if (!user) {
            return handleErrorResponse(res, 404, 'User not found');
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return handleErrorResponse(res, 401, 'Current password is incorrect');
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const sessionKey = `session:${userId}`;
        await redisClient.del(sessionKey);

        const newSessionId = generateSessionId();
        const newAccessToken = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role, sessionId: newSessionId },
            process.env.JWT_KEY,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        );

        const newRefreshToken = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role, sessionId: newSessionId },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '5d' }
        );

        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    password: hashedPassword,
                    refreshToken: newRefreshToken,
                    refreshTokenExpiry: getRefreshTokenExpiryDate()
                }
            }
        );

        setTokenCookies(res, newAccessToken, newRefreshToken);

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        return handleErrorResponse(res, 500, 'Error changing password: ' + error.message);
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { emailId } = req.body;

        if (!emailId) {
            return handleErrorResponse(res, 400, "Email is required");
        }

        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset OTP."
            });
        }

        const otpCode = await otpService.storeResetOTP(emailId);
        await emailService.sendPasswordResetOTPEmail(emailId, user.fullName, otpCode);

        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset OTP.",
            requiresOTP: true,
            emailId
        });

    } catch (error) {
        return handleErrorResponse(res, 500, error.message);
    }
};

const resetPassword = async (req, res) => {
    try {
        const { emailId, otpCode, newPassword } = req.body;

        if (!emailId || !otpCode || !newPassword) {
            return handleErrorResponse(res, 400, "Email, OTP code and new password are required");
        }

        if (newPassword.length < 8) {
            return handleErrorResponse(res, 400, "Password must be at least 8 characters long");
        }

        const verificationResult = await otpService.verifyResetOTP(emailId, otpCode);

        if (!verificationResult.success) {
            return handleErrorResponse(res, 400, verificationResult.message);
        }

        const user = verificationResult.user;

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const sessionKey = `session:${user._id}`;
        await redisClient.del(sessionKey);

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpiry: null,
                    refreshToken: null,
                    refreshTokenExpiry: null
                }
            }
        );

        await otpService.clearResetOTP(emailId);
        clearTokenCookies(res);

        return res.status(200).json({
            success: true,
            message: "Password reset successful. Please login with your new password."
        });

    } catch (error) {
        return handleErrorResponse(res, 500, error.message);
    }
};

module.exports = {
    register,
    verifyOTP,
    resendOTP,
    login,
    refreshAccessToken,
    logout,
    checkAuth,
    changePassword,
    forgotPassword,
    resetPassword
};
