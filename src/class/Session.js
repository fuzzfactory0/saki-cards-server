const CARDS = require('../utils/cards')
const CARDS_BETA = require('../utils/cards_beta')
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
    this.deck = betaSession ? shuffle(CARDS_BETA) : shuffle(CARDS);
    this.fullDeck = this.deck;
  }
}