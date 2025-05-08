import express , {Router} from "express";
import { login } from "../controllers/auth.controller";

const router :Router = express.Router();

router.post("/sign-in", login);
// Add more routes as needed
// router.post("/sign-up", register);
// router.post("/logout", logout);

export default router;