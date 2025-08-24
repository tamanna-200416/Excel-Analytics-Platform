import express from "express";
import { getAISummary , chatWithAI } from "../controllers/aiController.js";

const router = express.Router();

router.post("/summary", getAISummary);
router.post("/chat", chatWithAI);


export default router;
