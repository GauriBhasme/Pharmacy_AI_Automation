import "dotenv/config";
import express from "express";
import cors from "cors";

import authRouter from "./routes/auth.routes.js";
import agentRouter from "./routes/agent.routes.js";
import medicineRouter from "./routes/medicines.routes.js";
import ordersRouter from "./routes/orders.routes.js";
import adminRouter from "./routes/admin.routes.js";
import userRouter from "./routes/user.routes.js";
import prescriptionRoute from "./prescriptionRoute.js";

export const app = express();

// const corsOptions = {
//   origin: (origin, callback) => {
//     const allowed = [
//       process.env.CORS_ORIGIN,
//       "http://localhost:5173",
//       "http://localhost:5175",
//       "http://127.0.0.1:5173",
//       "http://127.0.0.1:5175",
//     ].filter(Boolean);

//     if (!origin) return callback(null, true);
//     if (allowed.includes(origin) || process.env.CORS_ORIGIN === "true") {
//       return callback(null, true);
//     }
//     return callback(new Error("Not allowed by CORS"));
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
    }
))

app.use(express.json());
// app.use(cors(corsOptions));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5175",
  process.env.CORS_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.get("/health", (req, res) => {
  res.json({ status: "ok", pid: process.pid });
});

app.use("/api", prescriptionRoute);
app.use("/api/auth", authRouter);
app.use("/api/chat", agentRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/agent", agentRouter);

export default app;
