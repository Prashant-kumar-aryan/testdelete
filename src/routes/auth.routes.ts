import express from "express";
import { addUser } from "../controllers/auth.controller";
const router = express.Router();
router.post("/sign-up", addUser);
export default router;