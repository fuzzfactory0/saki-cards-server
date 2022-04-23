require('dotenv').config();
const express = require('express');
const cors = require('cors');

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