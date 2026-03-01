import "dotenv/config";
// import all app routes
import express from "express";
import cors from 'cors';

import authRouter from './routes/auth.routes.js';
import agentRouter from './routes/agent.routes.js';
import medicineRouter from './routes/medicines.routes.js';
// import {historyRouter} from './routes/history.routes.js'
import ordersRouter from './routes/orders.routes.js';
import adminRouter from './routes/admin.routes.js';
import userRouter from './routes/user.routes.js';
import prescriptionRoute from "./prescriptionRoute.js";

export const app = express();

// middleware stack – order matters
app.use(express.json());                            // parse JSON bodies first
app.use(
    cors({
        // allow specific dev origins or any if CORS_ORIGIN env is set to 'true'
        origin: function (origin, callback) {
            const allowed = [
                process.env.CORS_ORIGIN,
                'http://localhost:5173',
                'http://localhost:5175',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:5175'
            ].filter(Boolean);
            // allow non-browser requests (curl, Postman) with no origin
            if (!origin) return callback(null, true);
            if (allowed.includes(origin) || process.env.CORS_ORIGIN === 'true') {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// mount misc routes
// lightweight healthcheck used to verify server and CORS from browser
app.get('/health', (req, res) => {
    res.json({ status: 'ok', pid: process.pid });
});
app.use("/api", prescriptionRoute);

// application routes
app.use('/api/auth', authRouter);
app.use('/api/chat', agentRouter);
app.use('/api/medicines', medicineRouter);
// app.use('/api/history',historyRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// expose the same agent router on a different path if desired
app.use("/api/agent", agentRouter);

export default app;
