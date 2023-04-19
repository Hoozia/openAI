import express from "express";
import path from "path";
import { handleInput } from "./open-ai.service.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  try {
    res.sendFile(path.resolve(process.cwd(), "./src/response.html"));
  } catch (err) {
    next();
  }
});

router.post("/", async (req, res, next) => {
  const conversation_history = req.body;
  try {
    const html = await handleInput(conversation_history);
    res.send(html);
  } catch (error) {
    next(error);
  }
});

export default router;
