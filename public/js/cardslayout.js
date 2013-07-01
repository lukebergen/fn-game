Game = {};
$(function() {
  var el = $("#cards");
  for (var i = 0 ; i < Game.cards.length ; i++) {
    card = new Game.Card(Game.cards[i]);
    for (var j = 0 ; j < card.perDeck ; j++) {
      var str = "<div class=\"card\">" +
      "<div class=\"edgeText\">" + card.name + "</div>" +
        "<div class=\"cardBody\">" +
          // "<div class=\"cardHeader\">" + card.name + "</div>" +
          "<div class=\"\">" + Game.Card.format(card) + "</div>" +
        "</div>" +
      // "<div class=\"filler\"></div>" +
      "<div class=\"edgeText upsideDown\">" + card.name + "</div>" +
      "</div>";
      el.append(str);
    }
  }
});