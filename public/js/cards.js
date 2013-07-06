Game.Card = function(card) {
  this.name = card.name;
  this.args = card.args;
  this.func = card.func;
  this.perDeck = card.perDeck;
  this.format = function() {
    return this.func.toString().replace("function", card.name).replace(/\n/g, "<br />").replace(/  /g, "&nbsp;");
  };
};
Game.Card.format = function(card) {
  return card.func.toString().replace("function", card.name).replace(/\n/g, "<br />").replace(/  /g, "&nbsp;");
};

Game.cards = [
  {
    name: "winner",
    args: 1,
    perDeck: 1,
    func: function(a) {
      if (game.isPlayer(a)) {
        return a + " Wins";
      }
      else {
        return "No Winner";
      }
    }
  },
  {
    name: "player",
    args: 0,
    perDeck: 14,
    func: function() {
      return game.currentPlayer(this);
    }
  },
  {
    name: "if",
    args: 3,
    perDeck: 10,
    func: function(a, b, c) {
      if (a) { return b; }
      else {return c; }
    }
  },
  {
    name: "true",
    args: 0,
    perDeck: 10,
    func: function() { return true; }
  },
  {
    name: "false",
    args: 0,
    perDeck: 10,
    func: function() { return false; }
  },
  {
    name: "and",
    args: 2,
    perDeck: 6,
    func: function(a, b) {
      return a && b;
    }
  },
  {
    name: "or",
    args: 2,
    perDeck: 6,
    func: function(a, b) {
      return a || b;
    }
  },
  {
    name: "not",
    args: 1,
    perDeck: 5,
    func: function(a) {
      if (game.isPlayer(a)) {
        c = Math.floor( game.players.length / 2);
        f = function(x) {
          return x + c;
        };
        return game.cyclePlayer(a, f);
      } else {
        return !a;
      }
    }
  },
  {
    name: "lshift",
    args: 1,
    perDeck: 4,
    func: function(a) {
      if (game.isPlayer(a)) {
        f = function(x) {
          return x - 1;
        };
        return game.cyclePlayer(a, f);
      } else {
        return !a;
      }
    }
  },
  {
    name: "rshift",
    args: 1,
    perDeck: 4,
    func: function(a) {
      if (game.isPlayer(a)) {
        f = function(x) {
          return x + 1;
        };
        return game.cyclePlayer(a, f);
      } else {
        return !a;
      }
    }
  }
];