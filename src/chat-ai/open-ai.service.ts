import * as fs from "fs";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import * as marked from "marked";
import { config } from "dotenv";
import { encoding_for_model } from "@dqbd/tiktoken";
import path from "path";
import superagent from "superagent";
import tiktoken from "tiktoken-node";

config(); // dotenv 설정

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const fine_tunes: Object[] = [];
const model = "gpt-3.5-turbo-0613";

const configuration = new Configuration({
  organization: process.env.ORGANIZATION,
  apiKey: process.env.OPEN_AI_API_KEY,
});

// GPT 모델 설정
const enc = tiktoken.encodingForModel(model)

function convertToHtml(answer: ChatCompletionRequestMessage) {
  answer.content = marked.marked(answer.content);
}

const openAI = new OpenAIApi(configuration);

async function getResponse(prompt: ChatCompletionRequestMessage[]) {
  try {
    console.log(prompt)
    const response = await openAI.createChatCompletion(
      {
        model,
        messages: prompt,
        temperature: 0.7,
      },
      {
        maxBodyLength: 8192 * 2,
      }
    );

    const totalTokens = response.data?.usage?.prompt_tokens;
    console.log("use token : ", totalTokens);

    return response.data?.choices[0]?.message?.content;
  } catch (err: Error | any) {
    const errorData = err.response?.data;
    if (errorData.code === "context_length_exceeded") {
      console.log("context_length_exceeded");
    } else {
      console.log(errorData)
    }
    throw err;
  }
}

export async function handleInput(conversation_history: ChatCompletionRequestMessage[]) {
  // AI 역할 지정
  const requestConversation: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content:
        "you are a Java developer and provides shopping mall services, always answer in English, and when you write code, be sure to wrap it in a code block in markdown format before replying.",
    },
  ];
  // 데이터를 파일로 저장합니다.
  if (fine_tunes && fine_tunes.length === 0) {
    const filePath = __dirname + "/fine_tunes.json";

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("기존 파일 삭제 완료");
    }
    // 주어진 데이터를 가공하여 결과 배열에 추가
    for (let i = 0; i < conversation_history.length; i += 2) {
      // assistant가 빠져있을 경우, user content도 제거
      if (
        conversation_history[i + 1] === undefined ||
        conversation_history[i + 1].role !== "assistant"
      ) {
        continue;
      }
      const prompt = conversation_history[i].content;
      const completion = conversation_history[i + 1].content;
      fine_tunes.push({ prompt: prompt, completion: completion });
    }

    const stream = fs.createWriteStream(filePath, { flags: "a" });
    for (let i = 0; i < fine_tunes.length; i++) {
      const jsonStr = JSON.stringify(fine_tunes[i]);
      stream.write(jsonStr + "\n");
    }
    stream.end();
    console.log("fine_tunes 파일 쓰기 완료");
  }

  let currentUseToken = 0;
  for (let i = conversation_history.length - 1; i >= 0; i--) {
    currentUseToken += enc.encode(conversation_history[i].content).length;
    // 질문 Token 수 지정
    if (currentUseToken >= 2672) {
      conversation_history = conversation_history.slice(i + 1);
      break;
    }
  }

  // GPT에게 질문하고 응답 반환
  try {
    const response = await getResponse(
      conversation_history.reduce(
        (acc, cur) => acc.concat(cur),
        requestConversation
      )
    ) || "";
    
    const answer: ChatCompletionRequestMessage = { role: "assistant", content: response };
    console.log(`${model}: ${response}`);
    convertToHtml(answer);
    return { answer };
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

export async function getChatAIModel(req, res, next) {

  const data = {models: []};
  try {
    const response = await superagent.get("https://api.openai.com/v1/models").send().set("Authorization", `Bearer ${process.env.OPEN_AI_API_KEY}`)
    
    response.body.data = response.body.data.sort((a: any, b: any) => {
      return a.created < b.created ? 1 : a.created > b.created ? -1 : 0;
    });
  
    let models = [];
    
    await response.body.data.forEach((model: any) => {
      model.created = new Date(model.created * 1000).toLocaleString();
      models.push({...model});
    });

    console.log(models);
    
    data.models = models

    res.render('model-list', data);
  
  } catch (err) {
    console.error(err);
    next(err);
  }
}