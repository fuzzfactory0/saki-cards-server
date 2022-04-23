const Player = require('./Player');
const CARDS = require('../utils/cards')
const { shuffle } = require('../utils/utils');

module.exports = class Session {
  constructor(id, owner, sanma, mode, length, forcedRotation, tenpaiRedraw) {
    this.id = id;
    this.owner = owner;
    this.sanma = sanma;                   // TRUE for sanma FALSE for suuma
    this.mode = mode;                     // NORMAL, TWOCARDS, TEAMDRAFT
    this.length = length;                 // EAST, SOUTH
    this.forcedRotation = forcedRotation; // BOOL
    this.tenpaiRedraw = tenpaiRedraw;     // BOOL
    this.playerCount = 1;
    this.players = [];
    this.open = true;
    this.revealed = false;
    this.deck = shuffle(CARDS);
  }
}