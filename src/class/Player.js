module.exports = class Player {
  constructor(nickname, seat) {
    this.nickname = nickname;
    this.seat = seat;
    this.hand = [];
    this.playedCard = null;
    this.flippedOver = false;
    this.lastSeen = Date.now();
    this.ws = null;
  }
}