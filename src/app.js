import express from 'express';
import path from 'path';
import { handleInput } from './open-ai.js';
import bodyParser from 'body-parser';


const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/response.html');
});

app.post('/', async (req, res) => {
  // post 요청을 받았을 때, 새로운 HTML 페이지를 생성합니다.
  const conversation_history = req.body;
  const html = await handleInput(conversation_history);

  // 생성된 HTML 페이지를 응답으로 보냅니다.
  res.send(html);
});

app.listen(15000, () => {
  console.log('Server listening on port 15000');
});
