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
  try {
    const conversation_history = req.body;
    const html = await handleInput(conversation_history);
    res.send(html);
  } catch (error) {
    res.status(500).send(error.message);
  }
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
  console.log('Server listening on port 15000');
});
