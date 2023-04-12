import { Configuration, OpenAIApi } from "openai";
import * as marked from "marked";


import dotenv from "dotenv";
const model = "gpt-3.5-turbo";

dotenv.config();

const configuration = new Configuration({
  organization: process.env.ORGANIZATION,
  apiKey: process.env.OPEN_AI_API_KEY,
});

const parseData = (answer) => {
  answer.content = marked.marked(answer.content);

  return { answer };
 }

console.log("<<--- Hello Node.js ---->>");

console.log("*- OpenAI API Tutorial...");

const openai = new OpenAIApi(configuration);

const getResponse = async (prompt) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: prompt,
    temperature: 0.2,
  });

  response.data.choices[0].message.
  return response.data.choices[0].message.content;
};

export async function handleInput(conversation_history) {
  // Update the conversation history
  let requestConversation = [
    { role: "system", content: "You are a nodejs developer assistant. And answer me in English" },
  ];
  requestConversation.push(conversation_history);
  // Generate a response using GPT-3
  return getResponse(conversation_history)
    .then(async (message) => {
      // Update the conversation history
      const answer = { role: "assistant", content: message };
      
      // Print the response
      console.log(`${model}: ${message}`);
      const data = await parseData(answer);
      return data;
    })
    .catch((err) => {
      console.error(err);
    });
}
