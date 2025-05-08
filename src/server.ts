import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db';
import { errorHandler } from './middlewares/error.middleware';
import app from './app';

dotenv.config();

connectDB();

app.use(errorHandler);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});