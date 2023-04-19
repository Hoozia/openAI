import { LLama } from "llama-node";
import { LLamaCpp, LoadConfig } from "llama-node/dist/llm/llama-cpp.js";
import path from "path";


export function localAIStart() {
    try {
        //TODO : https://github.com/hlhr202/llama-node#usage-llamacpp-backend 참고해서 구현해보기
        //TODO : https://www.youtube.com/watch?v=vNHjeQxNuS0 이것도 참고
        const model = path.resolve(process.cwd(), "./src/ggml-model-q4_0.bin");
      
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
}