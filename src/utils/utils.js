function shuffle(inputArray) {
  let array = [...inputArray];
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function hideCards(session, playerid) {
  let playerSession = JSON.parse(JSON.stringify(session, (key, value) => {
    if (key == 'ws') return undefined;
    else return value;
  }));
  playerSession.players.forEach(p => {
    if (p.nickname != playerid) {
      p.hand = p.hand.map(() => {return {name: 'cardback'}});
    }
    p.lastSeen = 0;
  });
  playerSession.deck = playerSession.deck.map(() => {return {name: 'cardback'}});
  playerSession.you = playerid;
  return playerSession;
}

function sendSession(session, playerid) {
  try {
    session.players.forEach(p => {
      if (p.nickname != playerid) {
        p.ws.send(JSON.stringify({ ...hideCards(session, p.nickname) }));
      }
    });
  } catch(e) {
    console.log(e);
  }
}

module.exports = {
  shuffle,
  hideCards,
  sendSession
}