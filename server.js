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
      ws.on("message", (str) => {
        try {
          const data = JSON.parse(str);
          let session = SESSIONS.find(s => s.id == data.sessionid);
          if (session) {
            let player = session.players.find(p => p.nickname == data.playerid);
            if (player) player.lastSeen = Date.now();
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
            console.log(player.nickname, 'left room', session.id);

            if (player.nickname == session.owner) {
              session.players.forEach(p => {
                p.ws.close();
              });
              SESSIONS.splice(SESSIONS.indexOf(session), 1);
              console.log('Room', session.id, 'deleted');
            } else {
              player.hand.forEach(card => {
                session.deck.push(card);
              });
              session.deck = shuffle(session.deck);
              session.players.splice(session.players.indexOf(player), 1);
              session.players.forEach(p => {
                sendSession(session, p.nickname);
              });
            }
          }
        } catch(e) {
          console.log(e);
        }
      });

      let player = session.players.find(p => p.nickname == params.get('playerid'));
      if (player) {
        player.ws = ws;
      } else {
        let spectator = session.spectators.find(p => p.nickname == params.get('playerid'));
        if (spectator) spectator.ws = ws;
      }
    } else {
      ws.close();
      return;
    }
  } catch(e) {
    console.log(e);
  }
});

console.log(`WSS listening on port ${WSS_PORT}`);