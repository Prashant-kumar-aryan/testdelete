import express , {Router} from "express";
import { login , addUser} from "../controllers/auth.controller";

const router :Router = express.Router();

router.post("/sign-in", login);
router.post("/sign-up", addUser);

export default router;