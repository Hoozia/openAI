import * as fs from "fs";
import FormData from "form-data";
import axios from "axios";
import { Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";
import path from "path";

config(); // dotenv 설정

export async function fineTuneAI() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const filePath = __dirname + "/fine_tunes.json";

  const file = fs.createReadStream(filePath) as any;

  try {
    const organization = process.env.ORGANIZATION;
    const apiKey = process.env.OPEN_AI_API_KEY;
    const model = "gpt-3.5-turbo";

    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);

    await openai
      .createFile(file, "fine-tune")
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err.response.data);
      });

    //TODO : 파일이름을 가져와서 tranining_file에 넣어야함
    await openai
      .createFineTune({
        training_file: "file-uOtsaJfNLtuyhfwDEQVbCQwO",
        model: model,
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err.response.data);
      });

  } catch (err) {
    console.log(err);
  } finally {
    console.log("finally");
    file.close();
  }
}
