import express from "express";
import path from "path";
import { createImageAI } from "./open-ai-image.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    res.sendFile(path.resolve(process.cwd(), "./src/image.html"));
  } catch (err) {
    next();
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    const requestImage = body.request_image;
    const imageUrl = await createImageAI(requestImage);

    return res.send(imageUrl);
  } catch (err) {
    next();
  }
});

export default router;
