import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';
import * as marked from 'marked';
import readline from 'readline';

import dotenv from 'dotenv';

const USERNAME = 'USER';
const model = 'gpt-3.5-turbo';

let conversation_history = [
  { role: 'system', content: 'You are a nodejs developer assistant.' },
];

dotenv.config();

const configuration = new Configuration({
  organization: process.env.ORGANIZATION,
  apiKey: process.env.OPEN_AI_API_KEY,
});

const generateHTML = (content) => {
  const answerList = content
    .filter((element) => element.role === 'assistant')
    .map((element) => element.content);

  const questionList = content
    .filter((element) => element.role === 'user')
    .map((element) => element.content);

  let htmlFront = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>OpenAI Response</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism-okaidia.min.css" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.min.js"></script>
    <style>
    @import url("https://fonts.googleapis.com/css?family=Raleway:400,400i,700");
    body {
      font-family: sans-serif;
      background-color: #343541;
      line-height: 1.25rem;
    }

    .question {
      font-size: .875rem;
      font-weight: bold;
      margin-bottom: 1em;
      background-color: #343541;
      color: #ECECF1;
    }

    .answer {
      font-size: .875rem;
      margin-bottom: 1em;
      background-color: #444654;
      color: #D1D5DB;
      border: 0 solid #d9d9e3;
      border-radius: 1px;
      box-sizing: border-box;
    }

    .chat-box-footer {
      width: 100%;
      padding: 20px 15px;
      border-top: solid 1px #cfcfcf;
      box-sizing: border-box;
      display: flex;
    }

      #chat_input {
        color: #2f2f2f;
        font-family: Raleway, sans-serif;
        font-size:  16px;
        background-color: #d2d2d2;
        width: 100%;
        height: 40px;
        max-height: 1500px;
        border: none;
        padding: 10px 15px;
        resize: none;
        box-sizing: border-box;
        border-radius: 13px;
        transition: 0.3s background-color;
      }

      #send {
        background: none;
        border: none;
        margin-left: 10px;
        padding: 5px;
        cursor: pointer;
        border-radius: 50%;
      }
    
  </style>
  </head>
  <body> `;

  for (let i = 0; i < questionList.length; i++) {
    htmlFront += `
    <div class="question">${marked.marked(questionList[i])}</div>`;

    if (answerList[i] === undefined) {
      break;
    }
    htmlFront += `
    <div class="answer">${marked.marked(answerList[i])}</div>`;
  }
  const html =
    htmlFront +
    `
    <div class="chat-box-footer">
    <textarea id="chat_input" placeholder="Enter your message here..."></textarea>
    <button id="send">
      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="#006ae3" d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
      </svg>
    </button>
  </div>
</body>
<script>
  const chatInput = document.querySelector('#chat_input');
  const typing = document.querySelector('#typing');
  const send = document.querySelector('#send');
  const chatMessages = document.querySelector('#chat_messages');
  const chatBoxBody = document.querySelector('#chat_box_body');
  const chatThread = {};

  // ----- EVENTS ----- //

  chatInput.addEventListener('input', function () {
    this.style.height = '0';
    this.style.height = this.scrollHeight + 1 + 'px';
  });

  chatInput.addEventListener('keydown', async function (evt) {
    if (evt.keyCode == 13 && !evt.shiftKey) {
      evt.preventDefault();
      await sendMessage('my', this);
      chatInput.disabled = false;
    }
  });

  send.addEventListener('click', async function(evt) {
    evt.preventDefault();
    await sendMessage('my', chatInput);
  });

  async function sendMessage(sender, input) {
    send.disabled = true;
    chatInput.disabled = true;
    const userInput = input.value.toString();
    input.value = '현재 AI가 답변을 준비중입니다... 잠시만 기다려주세요.';
    const response = await fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: userInput })
    }).then(response => {
      if (response.ok) {
        send.disabled = false;
        chatInput.disabled = false;
        return response.text();
      }
      throw new Error('Network response was not ok.');
    })
      .then(html => {
        document.documentElement.innerHTML = html;
        location.reload();
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });

      input.value = '';
  }

</script>
</html>`;

  return html;
};

console.log('<<--- Hello Node.js ---->>');

console.log('*- OpenAI API Tutorial...');

const openai = new OpenAIApi(configuration);

const getResponse = async (prompt) => {
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: prompt,
    temperature: 0.2,
  });

  return response.data.choices[0].message.content;
};

export async function handleInput(inputStr) {
  // Update the conversation history
  conversation_history.push({ role: 'user', content: inputStr });

  // Generate a response using GPT-3
  return getResponse(conversation_history)
    .then(async (message) => {
      // Update the conversation history
      conversation_history.push({ role: 'assistant', content: message });

      const html = await generateHTML(conversation_history);
      fs.writeFileSync('response.html', html);
      // Print the response
      console.log(`${model}: ${message}`);

      return html;
    })
    .catch((err) => {
      console.error(err);
    });
}
