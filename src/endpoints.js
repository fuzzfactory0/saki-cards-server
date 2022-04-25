const Session = require('./class/Session');
const Player = require('./class/Player');
const { hideCards } = require('./utils/utils');
const { shuffle } = require('./utils/utils');

const EXT_VERSION = '2';

module.exports = (app, SESSIONS) => {
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.post('/draw', (req, res) => {
    try {
      let session = SESSIONS.find(s => s.id == req.query.sessionid);
      if (session) {
        let player = session.players.find(p => p.nickname == req.query.playerid);
        if (player.hand.length < 8 || player.hand.length == 8 && player.playedCard == null) {
          let card = session.deck.shift();
          player.hand.push(card);
        }
        res.send({ ...hideCards(session, req.query.playerid) });
      } else {
        res.sendStatus(404);
      }
    } catch(e) {
      console.log(e);
      res.sendStatus(500);
    }
  });

  app.post('/session', (req, res) => {
    if (req.query.version != EXT_VERSION) {
      res.send({alert: 'VERSION_MISMATCH'});
    } else {
      try {
        const b = req.body;
        let id; 
        do { 
          id = Math.floor(Math.random() * 10000);
        } while (SESSIONS.some(s => s.id == id) || id < 1000);
        const session = new Session(id, b.owner, b.sanma, b.mode, b.length, b.forcedRotation, b.tenpaiRedraw);
        session.players.push(new Player(b.owner, 1));
        SESSIONS.push(session);
        res.send(session);
      } catch(e) {
        console.log(e);
      }
    }
  });

  // get /session?sessionid=452452452
  app.get('/session', (req, res) => {
    try {
      let session = SESSIONS.find(s => s.id == req.query.sessionid);
      if (session) {
        let player = session.players.find(p => p.nickname == req.query.playerid);
        player.lastSeen = Date.now();
        res.send({ ...hideCards(session, req.query.playerid) });
      } else {
        res.sendStatus(404);
      }
    } catch(e) {
      console.log(e);
      res.sendStatus(500);
    }
  });

  app.post('/join', (req, res) => {
    if (req.query.version != EXT_VERSION) {
      res.send({alert: 'VERSION_MISMATCH'});
    } else {
      try {
        console.log('join request ', req.url)
        // parse session and player from url
        const sessionid = req.query.sessionid;
        const playerid = req.query.playerid;
        
        // find session
        let sess = SESSIONS.find(s => s.id == sessionid);
      
        // create player if there's space in the room
        let maxPlayers = sess.sanma == 'true' ? 3 : 4;
        if (sess.players.length < maxPlayers && !sess.players.some(p => p.nickname == playerid)) {
          sess.players.push(new Player(playerid, sess.players.length + 1));
          res.send(sess);
        }
      } catch(e) {
        console.log(e);
      }
    }
  });

  app.post('/play', (req, res) => {
    try {
      let session = SESSIONS.find(s => s.id == req.query.sessionid);
      if (session && session.open) {
        let player = session.players.find(p => p.nickname == req.query.playerid);
        if (player.playedCard != null) {
          player.hand.push(player.playedCard);
        }
        let card = player.hand.find(c => c.name == req.body.card);
        player.hand.splice(player.hand.indexOf(card), 1);
        player.playedCard = card;
        res.send({ ...hideCards(session, req.query.playerid) });
      } else if (!session){
        res.sendStatus(404);
      }
    } catch(e) {
      console.log(e);
    }
  });

  app.post('/flip', (req, res) => {
    try {
      let session = SESSIONS.find(s => s.id == req.query.sessionid);
      if (session) {
        if (session.revealed) {
          let player = session.players.find(p => p.nickname == req.query.playerid);
          if (player.playedCard != null) {
            player.flippedOver = !player.flippedOver;
          }
        }
        res.send({ ...hideCards(session, req.query.playerid) });
      } else {
        res.sendStatus(404);
      }
    } catch(e) {
      console.log(e);
    }
  });

  app.post('/return', (req, res) => {
    try {
      let session = SESSIONS.find(s => s.id == req.query.sessionid);
      if (session) {
        let player = session.players.find(p => p.nickname == req.query.playerid);
        let card = player.hand.find(c => c.name == req.body.card);
        player.hand.splice(player.hand.indexOf(card), 1);
        session.deck.push(card);
        session.deck = shuffle(session.deck);
        res.send({ ...hideCards(session, req.query.playerid) });
      } else {
        res.sendStatus(404);
      }
    } catch(e) {
      console.log(e);
    }
  });

  app.post('/reveal', (req, res) => {
    try {
      let session = SESSIONS.find(s => s.id == req.query.sessionid);
      if (session) {
        let player = session.players.find(p => p.nickname == req.query.playerid);
        let cardsPlayed = 0;
        let maxCards = session.sanma == 'true' ? 3 : 4;
        session.players.forEach(p => {
          if (p.playedCard != null) cardsPlayed++;
        });
        if (player.nickname == session.owner && session.open && cardsPlayed == maxCards) {
          session.revealed = true;
          session.open = false;
        }
        res.send({ ...hideCards(session, req.query.playerid) });
      } else {
        res.sendStatus(404);
      }
    } catch(e) {
      console.log(e);
    }
  });

  app.post('/reset', (req, res) => {
    try {
      let session = SESSIONS.find(s => s.id == req.query.sessionid);
      if (session) {
        let player = session.players.find(p => p.nickname == req.query.playerid);
        if (player.nickname == session.owner) {
          session.open = true;
          session.revealed = false;
          session.players.forEach(p => {
            if (p.playedCard != null) {
              p.hand.push(p.playedCard);
              p.playedCard = null;
              p.flippedOver = false;
            }
          });
        }
        res.send({ ...hideCards(session, req.query.playerid) });
      } else {
        res.sendStatus(404);
      }
    } catch(e) {
      console.log(e);
    }
  });

  app.post('/arrange', (req, res) => {
    try {
      let session = SESSIONS.find(s => s.id == req.query.sessionid);
      if (session) {
        let player = session.players.find(p => p.nickname == req.query.playerid);
        if (player.nickname == session.owner) {
          let seat = parseInt(req.query.seat);
          let target = session.players.find(p => p.nickname == req.query.target);
          let displaced = session.players.find(p => p.seat == seat);
          
          if (displaced) displaced.seat = target.seat;
          target.seat = seat;
        }
        res.send({ ...hideCards(session, req.query.playerid) });
      } else {
        res.sendStatus(404);
      }
    } catch(e) {
      console.log(e);
    }
  });
}
