import dotenv from 'dotenv';
import connectDB from './config/db';
import app from './app';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

connectDB();

// Error handler (add this after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});