

makeHandler = function(card) {
  return function() {
    var newCard = new Game.Card(card);
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