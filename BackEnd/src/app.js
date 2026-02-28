
//import all app routes
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/agent.routes.js'
import medicineRouter from './routes/medicines.routes.js'
// import {historyRouter} from './routes/history.routes.js'
import ordersRouter from './routes/orders.routes.js'
import  adminRouter  from './routes/admin.routes.js';

import express from 'express';
import cors from 'cors';

export const app = express();

//middlewares
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());


//define all routes for app using routers
app.use('/api/auth',authRouter);
app.use('/api/chat',chatRouter);
app.use('/api/medicines',medicineRouter);
// app.use('/api/history',historyRouter);
app.use('/api/orders',ordersRouter);
app.use('/api/admin',adminRouter);