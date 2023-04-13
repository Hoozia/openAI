import { Configuration, OpenAIApi } from "openai";
import * as marked from "marked";
import { config } from "dotenv";
import { get_encoding, encoding_for_model } from "@dqbd/tiktoken";

const model = "gpt-3.5-turbo";


config(); // dotenv 설정

const configuration = new Configuration({
  organization: process.env.ORGANIZATION,
  apiKey: process.env.OPEN_AI_API_KEY,
});

const enc = encoding_for_model(model);

function convertToHtml(answer) {
  answer.content = marked.marked(answer.content);
}

const openAI = new OpenAIApi(configuration);

async function getResponse(prompt) {
  const response = await openAI
    .createChatCompletion(
      {
        model,
        messages: prompt,
        temperature: 0.7,
      },
      {
        timeout: 120000 * 2,
        maxBodyLength: 8192 * 2,
      }
    )
    .catch((err) => {
      const errorData = err.response?.data;
      if (errorData.code === "context_length_exceeded") {
        console.log("context_length_exceeded");
      }
      return Promise.reject(err);
    });

  const totalTokens = response.data.usage.prompt_tokens;
  console.log("use token : ", totalTokens);

  return response.data.choices[0].message.content;
}

export async function handleInput(conversation_history) {
  // AI 역할 지정
  const requestConversation = [
    {
      role: "system",
      content:
        "You are a nodejs, html developer assistant and code reviewer. And answer me in English",
    },
  ];
  
  let currentUseToken = 0;
  for (let i = conversation_history.length - 1; i >= 0; i--) {
    currentUseToken += enc.encode(conversation_history[i].content).length;
    if (currentUseToken >= 2672) {
      conversation_history = conversation_history.slice(i + 1);
      break;
    }
  }

  // GPT에게 질문하고 응답 반환
  try {
    const response = await getResponse(
      [requestConversation, conversation_history].flat()
    );
    const answer = { role: "assistant", content: response };
    console.log(`${model}: ${response}`);
    convertToHtml(answer);
    return { answer };
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}
