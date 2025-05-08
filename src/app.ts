import express from "express";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import coachesRoutes from "./routes/coaches.routes";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// app.use("/api/users", userRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coaches", coachesRoutes);
export default app;
