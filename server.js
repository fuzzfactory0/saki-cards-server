require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ws = require('ws');
const { sendSession, shuffle } = require('./src/utils/utils');

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
  try {
    const params = new URL(req.url, `http://${req.headers.host}`).searchParams;
    let session = SESSIONS.find(s => s.id == params.get('sessionid'));
    if (session) {
      let player = session.players.find(p => p.nickname == params.get('playerid'));
    
      ws.on("message", (str) => {
        try {
          const data = JSON.parse(str);
          let session = SESSIONS.find(s => s.id == data.sessionid);
          if (session) {
            let player = session.players.find(p => p.nickname == data.playerid);
            player.lastSeen = Date.now();
          }
        } catch(e) {
          console.log(e);
        }
      });

      ws.on("close", () => {
        try {
          let session = SESSIONS.find(s => s.id == params.get('sessionid'));
          if (session) {
            let player = session.players.find(p => p.nickname == params.get('playerid'));

            if (player.nickname == session.owner) {
              session.players.forEach(p => {
                p.ws.close();
              });
              SESSIONS = SESSIONS.filter(s => s.id != session.id);
            } else {
              player.hand.forEach(card => {
                session.deck.push(card);
              });
              session.deck = shuffle(session.deck);
              session.players = session.players.filter(p => p.nickname != player.nickname);
              session.players.forEach(p => {
                sendSession(session, p.nickname);
              });
            }
          }
        } catch(e) {
          console.log(e);
        }
      });

      player.ws = ws;
    } else {
      ws.close();
      return;
    }
  } catch(e) {
    console.log(e);
  }
});

console.log(`WSS listening on port ${WSS_PORT}`);

// remove inactive players, empty rooms and rooms where the owner left
/*
setInterval(() => {
  SESSIONS.forEach((session) => {
    session.players.forEach((player) => {
      if (Date.now() - player.lastSeen > 600000) {
        session.players = session.players.filter(p => p.nickname != player.nickname);
        player.ws.close(408);
      } 
    });
    if (session.players.length == 0 || !session.players.some(p => p.nickname == session.owner)) {
      SESSIONS = SESSIONS.filter(s => s.id != session.id);
    }
  })
}, 60000);
*/