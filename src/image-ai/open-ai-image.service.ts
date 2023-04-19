import { Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";


config(); // dotenv 설정

export async function createImageAI(requestImage: string) {
  try {
    console.log(requestImage);
    const apiKey = process.env.OPEN_AI_API_KEY;

    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    
    const response = await openai.createImage({
      prompt: requestImage,
      n: 1,
      size: "1024x1024",
    });
    console.log(response.data);
    console.log(response.data.data[0].url);
    const imageUrl = response.data.data[0].url

    return imageUrl;
  } catch (err) {
    console.log(err);
  }
}
