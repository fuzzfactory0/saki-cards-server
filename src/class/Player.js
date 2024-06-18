module.exports = class Player {
  constructor(nickname, seat, spectator=false) {
    this.nickname = nickname;
    this.seat = seat;
    this.spectator = spectator;
    this.hand = [];
    this.playedCard = null;
    this.flippedOver = false;
    this.lastSeen = Date.now();
    this.ws = null;
  }
}