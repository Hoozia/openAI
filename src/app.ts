import express from "express";
import path from "path";
import chatRouter from './chat-ai/chat-ai.controller.js';
import imageRouter from './image-ai/image-ai.controller.js';
import ejs from 'ejs';
import nunjucks from 'nunjucks';

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.set("view options", {layout: false});
app.engine('html', ejs.renderFile);  
app.set('view engine', 'html'); 
app.set('views', __dirname + '/../../views');

nunjucks.configure('views', {
  autoescape: false,
  express: app,
  watch: true,
})
app.use(express.json({
  limit : "50mb"
}));
app.use(express.urlencoded({
  limit:"50mb",
  extended: false
}));
app.use(express.static(path.join(__dirname, "public")));

// 미세 조정 모델은 GPT3 모델만 가능해서 일단 보류
// app.get("/file-test", async (req, res) => {
//   await fineTuneAI();

//   res.send("file test");
// });



app.use('/', chatRouter);
app.use('/create-image', imageRouter);

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
  console.log("Server listening on port 15000");
});
