import express from "express";
import path from "path";
import { getChatAIModel, handleInput } from "./open-ai.service.js";

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

router.get("/model-list", (req, res, next) => {
  try {
    getChatAIModel();
  } catch (err) {
    next();
  }
});


export default router;
