import { Configuration, OpenAIApi } from "openai";
import * as marked from "marked";


import dotenv from "dotenv";
const model = "gpt-3.5-turbo";

dotenv.config();

const configuration = new Configuration({
  organization: process.env.ORGANIZATION,
  apiKey: process.env.OPEN_AI_API_KEY,
});

const convertToHtml = (answer) => {
  answer.content = marked.marked(answer.content);
};

console.log("<<--- Hello Node.js ---->>");

console.log("*- OpenAI API Tutorial...");

const openAI = new OpenAIApi(configuration);

const getResponse = async (prompt) => {
  const response = await openAI.createChatCompletion({
    model,
    messages: prompt,
    temperature: 0.2,
  });

  return response.data.choices[0].message.content;
};

export async function handleInput(conversation_history) {
  // AI 역할 지정
  let requestConversation = [
    { role: "system", content: "You are a nodejs developer assistant. And answer me in English" },
  ];
  requestConversation.push(conversation_history);
  // GPT에게 질문하고 응답 반환
  try {
    const response = await getResponse(conversation_history);
    const answer = { role: "assistant", content: response };
    console.log(`${model}: ${response}`);
    convertToHtml(answer);
    return { answer };
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}
