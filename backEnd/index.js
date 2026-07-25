require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./src/config/database');
const redisClient = require("./src/config/redis");
const app = express();

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const allowedOrigins = ["http://localhost:5173"];
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-auth-token', 'Accept', 'Origin'],
    exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const landingPageRoutes = require('./src/routes/landingPageRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRouter = require('./src/routes/adminRoutes');
const userRouter = require('./src/routes/userRoutes');
const offerRouter = require('./src/routes/offerRoutes');
const qrRouter = require('./src/routes/qrRoutes');

app.use('/auth', authRoutes);
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/offer', offerRouter);
app.use('/public', landingPageRoutes);
app.use('/qr', qrRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const startServer = async () => {
    try {
        let redisConnected = false;
        try {
            await redisClient.connect();
            redisConnected = true;
            console.log('✅ Redis connected');
        } catch (redisError) {
            console.warn('⚠️ Redis connection failed:', redisError.message);
        }
        
        await connectDB();
        console.log('✅ MongoDB connected');
        
        const { initBrevo } = require('./src/config/brevo');
        initBrevo();
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log('📍 CORS enabled for origins:');
            console.log('   - http://localhost:5173');
            if (!redisConnected) {
                console.log('⚠️ Running without Redis');
            }
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();




