require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ws = require('ws');

const API_PORT = process.env.API_PORT;
const WSS_PORT = process.env.WSS_PORT;


const app = express();
app.use(express.json());
app.use(cors());

let SESSIONS = [];

require('./src/endpoints')(app, SESSIONS);

app.listen(API_PORT, () => {
  console.log(`API listening on port ${API_PORT}`);
});


const wss = new ws.Server({ port: 3001 });

wss.on("connection", (ws, req) => {
  const params = new URL(req.url, `http://${req.headers.host}`).searchParams;

  let session = SESSIONS.find(s => s.id == params.get('sessionid'));
  let player = session.players.find(p => p.nickname == params.get('playerid'));
  player.ws = ws;
});

console.log(`WSS listening on port ${WSS_PORT}`);


// remove inactive players, empty rooms and rooms where the owner left
setInterval(() => {
  SESSIONS.forEach((session, sindex) => {
    session.players.forEach((player, pindex) => {
      if (Date.now() - player.lastSeen > 240000) {
        session.players.splice(pindex, 1);
      } 
    });
    if (session.players.length == 0 || !session.players.some(p => p.nickname == session.owner)) {
      SESSIONS.splice(sindex, 1);
    }
  })
}, 300000);