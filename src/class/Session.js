const CARDS = require('../utils/cards')
const { shuffle } = require('../utils/utils');

module.exports = class Session {
  constructor(id, owner, sanma, mode, length, forcedRotation, tenpaiRedraw, betaSession) {
    this.id = id;
    this.owner = owner;
    this.sanma = sanma;                   // TRUE for sanma FALSE for suuma
    this.mode = mode;                     // NORMAL, TWOCARDS, TEAMDRAFT
    this.length = length;                 // EAST, SOUTH
    this.forcedRotation = forcedRotation; // BOOL
    this.tenpaiRedraw = tenpaiRedraw;     // BOOL
    this.betaSession = betaSession;       // TRUE if should include beta cards
    this.playerCount = 1;
    this.players = [];
    this.spectators = [];
    this.open = true;
    this.revealed = false;
    // if is beta, get all beta cards and exclude old ones with same names, else get all non beta cards
    this.deck = betaSession ? shuffle(CARDS).filter(c => !CARDS.some(c2 => c.name == c2.name && !c.isBeta && c2.isBeta)) : shuffle(CARDS.filter(c => !c.isBeta));
    this.fullDeck = this.deck;
  }
}