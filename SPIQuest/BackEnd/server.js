import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import branchRoutes from './routes/branchRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 
import authRoutes from './routes/authRoutes.js';

dotenv.config();
const app = express();
connectDB(); // ⬅️ Add this to connect DB

app.use(cors());
app.use(express.json());

app.use('/api', branchRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
