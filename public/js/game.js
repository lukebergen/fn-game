window.Game = function(numPlayers) {

  this.players = [];
  this.deck = new Deck(numPlayers, Game.cards.slice(1, Game.cards.length));
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
      this.deck.cardPlayed(card.playedAt % game.players.length, card);
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

  this.fillGame = function() {
    var trueCard;
    for (var i = 0 ; i < Game.cards.length ; i++) {
      if (Game.cards[i].name == "true") {
        trueCard = Game.cards[i];
      }
    }
    while (!game.isGameComplete(game.playedCards)) {
      game.playCard(new Game.Card(trueCard));
    }
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

    if (game.players) {
      $("#playerHand").html(game.currentPlayer() + "'s hand");

      html = this.deck.handToHtml(game.playCount % game.players.length);
      $("#handCards").html(html);

      for (var i = 1 ; i < Game.cards.length ; i++) {
        $("#" + Game.cards[i].name + "Button").hide();
      }
      var currentPlayerIndex = game.playCount % game.players.length;
      for (i = 0 ; i < this.deck.hands[currentPlayerIndex].length ; i++) {
        $("#" + this.deck.hands[currentPlayerIndex][i].name + "Button").show();
      }

      $("#leftInDeck").html("Deck: " + game.deck.cards.length);
    }

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

window.Deck = function(numPlayers, gameCards) {

  this.cardPlayed = function(handIndex, cardPlayed) {
    // TODO: remove cardPlayed from hand[handIndex]
    var hand = this.hands[handIndex];
    for (var i = 0 ; i < hand.length ; i++) {
      if (hand[i].name == cardPlayed.name) {
        hand.splice(i, 1);
        if (this.cards.length > 0) {
          hand.push(this.cards.pop());
        }
      }
    }
    return hand;
  };

  this.buildDeck = function(gameCards) {
    // TODO based on gameCards, create a deck and return it
    var result = [];
    for (var i = 0 ; i < gameCards.length ; i++) {
      card = gameCards[i];
      for (var j = 0 ; j < card.perDeck ; j++) {
        newCard = new Game.Card(card);
        result.push(newCard);
      }
    }
    return result;
  };

  this.shuffle = function(cards) {
    for (var i = 0 ; i < 100 ; i++) {
      swapIndex = Math.floor(Math.random() * cards.length);
      temp = cards[swapIndex];
      cards[swapIndex] = cards[0];
      cards[0] = temp;
    }
    return cards;
  };

  this.handToHtml = function(index) {
    var hand = this.hands[index];
    var result = "";
    var cardNames = this.cardNames(hand);
    for (var i = 0 ; i < cardNames.length ; i++) {
      result += cardNames[i] + "<br/ >";
    }
    return result;
  };

  this.cardNames = function(cards) {
    names = [];
    for (var i = 0 ; i < cards.length ; i++) {
      names.push(cards[i].name);
    }
    return names;
  };

  this.cards = this.shuffle(this.buildDeck(gameCards));
  this.hands = new Array(numPlayers);
  for (var i = 0 ; i < numPlayers ; i++) {
    this.hands[i] = [];
    for (var j = 0 ; j < 5 ; j++) {
      this.hands[i].push(this.cards.pop());
    }
  }
};