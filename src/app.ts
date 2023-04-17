import express from "express";
import path from "path";
import { handleInput } from "./open-ai.js";
import { fineTuneAI } from "./open-ai-file.js";
import { createImageAI } from "./open-ai-image.js";

import { LLama } from "llama-node";
import { LLamaCpp, LoadConfig } from "llama-node/dist/llm/llama-cpp.js";
import { LLamaRS } from "llama-node/dist/llm/llama-rs.js";
import fs from "fs";

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
try {
  //TODO : https://github.com/hlhr202/llama-node#usage-llamacpp-backend 참고해서 구현해보기
  //TODO : https://www.youtube.com/watch?v=vNHjeQxNuS0 이것도 참고
  const model = path.resolve(process.cwd(), "./src/ggml-model-q4_1.bin");

  const llama = new LLama(LLamaCpp);

  const config: LoadConfig = {
    path: model,
    enableLogging: true,
    nCtx: 1024,
    nParts: -1,
    seed: 0,
    f16Kv: false,
    logitsAll: false,
    vocabOnly: false,
    useMlock: false,
    embedding: false,
    useMmap: true,
  };

  llama.load(config);

  const template = `node js implementation of express server`;

  const prompt = `### Human:

${template}

### Assistant:`;

  llama.createCompletion(
    {
      nThreads: 4,
      nTokPredict: 2048,
      topK: 40,
      topP: 0.1,
      temp: 0.7,
      repeatPenalty: 1,
      stopSequence: "### Human",
      prompt,
    },
    (response) => {
      process.stdout.write(response.token);
    }
  );
} catch (err) {
  console.error("로컬 AI 기동 중 에러 발생");
  console.error("err : ", err);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(process.cwd(), "./src/response.html"));
});

app.post("/", async (req, res, next) => {
  const conversation_history = req.body;
  try {
    const html = await handleInput(conversation_history);
    res.send(html);
  } catch (error) {
    next(error);
  }
});

// 미세 조정 모델은 GPT3 모델만 가능해서 일단 보류
// app.get("/file-test", async (req, res) => {
//   await fineTuneAI();

//   res.send("file test");
// });

app.get("/create-image", async (req, res) => {
  res.sendFile(path.resolve(process.cwd(), "./src/image.html"));
});

app.post("/create-image", async (req, res) => {
  const body = req.body;
  const requestImage = body.request_image;
  const imageUrl = await createImageAI(requestImage);

  return res.send(imageUrl);
});

app.listen(15000, () => {
  console.log(`
  ##     ## ##    ##     ######  ##     ##    ###    ########     ######   ########  ######## 
  ###   ###  ##  ##     ##    ## ##     ##   ## ##      ##       ##    ##  ##     ##    ##    
  #### ####   ####      ##       ##     ##  ##   ##     ##       ##        ##     ##    ##    
  ## ### ##    ##       ##       ######### ##     ##    ##       ##   #### ########     ##    
  ##     ##    ##       ##       ##     ## #########    ##       ##    ##  ##           ##    
  ##     ##    ##       ##    ## ##     ## ##     ##    ##       ##    ##  ##           ##    
  ##     ##    ##        ######  ##     ## ##     ##    ##        ######   ##           ##    
  `);
  console.log("Server listening on port 15000");
});
