import dotenv from "dotenv";
dotenv.config();
import { app } from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access it at http://localhost:${PORT}`);
});

// all routes are configured in app.js
