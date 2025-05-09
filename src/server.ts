import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

// Connect to MongoDB
connectDB();

// Error handling middleware should be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});