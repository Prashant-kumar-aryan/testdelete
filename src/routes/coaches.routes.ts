import express from "express";
import { getCoaches } from "../controllers/coaches.controller";
import { getCoachById } from "../controllers/coachDetail.controller";

const router = express.Router();

router.get("/", getCoaches);
router.get("/:coachId", getCoachById);
// router.get("/", (req, res) => {
//     console.log("GET /api/coaches hit");
//     res.send("Route is working");
//   });

export default router;
