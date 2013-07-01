window.Game = function(numPlayers) {

  this.players = [];
  this.playedCards = [Game.cards[0], undefined];
  this.playCount = 0;
  for (i = 0 ; i < numPlayers ; i++) {
    this.players.push("Player " + (i + 1));
  }

  this.currentPlayer = function(card) {
    var turn;
    if (card) {
      turn = card.playedAt;
    } else {
      turn = game.playCount;
    }
    return game.players[turn % game.players.length];
  };

  this.isPlayer = function(x) {
    return (/Player.*/).test(x);
  };

  this.playerOpposite = function(player) {
    var cycles = Math.floor(game.players.length / 2);
    return this.cyclePlayer(player, function(x) {return x + cycles;});
  };

  this.cyclePlayer = function(player, cycleFunc) {
    var index = game.players.indexOf(player);
    index = cycleFunc(index).mod(game.players.length);
    return game.players[index];
  };

  this.playCard = function(card) {
    if (game.playCount === 0 && card.name === "player") {
      alert("first card played cannot be player");
    } else {
      card.playedAt = game.playCount++;
      this.pushCard(this.playedCards, card);
      this.displayGame(this.playedCards);
      if (this.isGameComplete(this.playedCards)) {
        result = this.evalGame(this.playedCards);
        $("#status").html(result);
      }
    }
  };

  this.pushCard = function(cards, card) {
    for (var i = 1 ; i < cards.length ; i++) {
      // base case, we've found an empty slot. Fill it and return up the chain
      if (cards[i] === undefined) {
        newCard = new Array(card.args + 1);
        newCard[0] = card;
        cards[i] = newCard;
        return true;
      }
      // if the currently examined argument is itself a function
      // dig into that for empty argument slots
      if (cards[i].length > 1) {
        if (this.pushCard(cards[i], card)) {
          return true;
        }
      }
    }
  };

  this.isGameComplete = function(cards) {
    // weird case, happens on new game sometimes?
    if (!cards) { return false; }
    // base case: we're at a function card. This path is fully played out
    if (cards.length == 1) { return true; }

    var result = true;
    for (var i = 1 ; i < cards.length ; i++) {
      if (cards[i] === undefined) {
        return false;
      } else {
        result = result && this.isGameComplete(cards[i]);
      }
    }
    return result;
  };

  this.evalGame = function(cards) {
    // base case: cards is a single value function
    if (cards.length === 1) {
      var result = cards[0].func();
      return result;
    }
    var args = [];
    for (var i = 1 ; i < cards.length ; i++) {
      args.push(this.evalGame(cards[i]));
    }
    return cards[0].func.apply(this, args);
  };

  this.totalArgCount = function(cards) {
    // TODO return total length of cards args
    var total = 0;
    for (i = 0 ; i < cards.length ; i++) {
      total += cards[i].args;
    }
    return total;
  };

  this.displayGame = function(cards) {
    if (!this.isGameComplete()) {
      $("#status").html(this.currentPlayer() + "'s turn");
    }
    var html = "<ul>" + this.cardsToHtml(cards) + "</ul>";
    $("#game").html(html);
    return null;
  };

  this.cardsToHtml = function(cards, doComma) {
    var result;
    if (cards.length == 1) {
      result = "<li>" + cards[0].name + "() => ";
      result += cards[0].func();
      if (doComma) {
        result += ",";
      }
      return result + "</li>";
    } else {
      result = "<li>" + cards[0].name + "(<ul>";
      for (var i = 1 ; i < cards.length ; i++) {
        if (cards[i] === undefined) {
          result += "<li>___</li>";
        } else {
          c = (i !== cards.length - 1);
          result += this.cardsToHtml(cards[i], c);
        }
      }
      result += "</ul>)";
      if (doComma) {result += ",";}
      return result + "</li>";
    }
  };
};


makeHandler = function(card) {
  return function() {
    var newCard = new Game.Card(card.name, card.args, card.func);
    window.game.playCard(newCard);
  };
};

Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
};

scan = function(args) {
  $("#barcodeOutput").html(args.text);
  if (!args.cancelled) {
    window.plugins.barcodeScanner.scan(window.scan);
  }
};

init = function () {
  $("#startGame").click(function(e) {
    var n = parseInt($("#numPlayers").val(), 10);
    newGame(n);
  });

  $("#scanButton").click(function(e) {
    window.plugins.barcodeScanner.scan(window.scan);
  });

  for (var i = 0 ; i < Game.cards.length ; i++) {
    c = Game.cards[i];
    if (c.name == "winner") {continue;}
    $("#playCards").append(
      "<button id='" + c.name + "Button'>" + c.name + "</button>"
    );
    $("#" + c.name + "Button").click(makeHandler(c));
  }

  newGame = function(numPlayers) {
    game = new Game(numPlayers);
    $("#game").html("<ul></ul>");
    game.displayGame(game.playedCards);
  };
  newGame(2);

  loadReference = function() {
    var ul = $("#referenceCards");
    for (var i = 0 ; i < Game.cards.length ; i++) {
      var card = Game.cards[i];
      var html = "<li>" + Game.Card.format(card) + "</li><br/>";
      ul.append(html);
    }
  };
  loadReference();
};

document.addEventListener("deviceready", init, false);
$(init);