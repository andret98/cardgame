var totalBids = 0;

//timer search
function setTime() {
  totalSeconds++;
  $('#seconds').html(pad(totalSeconds % 60));
  $('#minutes').html(pad(parseInt(totalSeconds / 60)));
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

//board
function gameRoom(n) {
    for(var i = 0; i < n; i++) {
        $('#player' + i).prop("hidden", false);
        $('#played' + i).prop("hidden", false);
    }
}

//timer bot
function setTimerBot(delay) {
    var now = new Date();
    countDownDate = now.getTime();
    countDownDate += delay * 1000;
}

//background
function backgroundOff(currentPlayer, cardGame) {
    if(currentPlayer - cardGame.playerId < 0) {
        $('#player' + (cardGame.nrPlayers - cardGame.playerId + currentPlayer)).css("background-color","inherit");
    } else {
        $('#player' + (currentPlayer - cardGame.playerId)).css("background-color","inherit");
    }
}

function backgroundOn(currentPlayer, cardGame) {
    if(currentPlayer - cardGame.playerId < 0) {
        $('#player' + (cardGame.nrPlayers - cardGame.playerId + currentPlayer)).css("background-color","rgba(240,255,255,0.4)");
    } else {
        $('#player' + (currentPlayer - cardGame.playerId)).css("background-color","rgba(240,255,255,0.4)");
    }
}

//table
function generateRounds(nrPlayers, type){
    let aux = [];
    if(type == 1) {
        for(var i = 0; i < nrPlayers; i++)
            aux.push(1);
        for(var i = 2; i < 8; i++)
            aux.push(i);
        for(var i = 0; i < nrPlayers; i++)
            aux.push(8);
        for(var i = 7; i > 1; i--)
            aux.push(i);
        for(var i = 0; i < nrPlayers; i++)
            aux.push(1);
    } else if(type == 8) {
        for(var i = 0; i < nrPlayers; i++)
            aux.push(8);
        for(var i = 7; i > 1; i--)
            aux.push(i);
        for(var i = 0; i < nrPlayers; i++)
            aux.push(1);
        for(var i = 2; i < 8; i++)
            aux.push(i);
        for(var i = 0; i < nrPlayers; i++)
            aux.push(8);
    }
    return aux;
}

function generateTable(nrPlayers, type, users){
    var table = document.getElementById("score-table");
    var row = table.insertRow();
    row.insertCell(0);
    for(var i = 1; i<nrPlayers* 3 + 1;i = i + 3) {
        var cel = row.insertCell(i);
        cel.innerHTML = "";
        cel.innerHTML = users[parseInt(i / 3)];
        console.log(users[parseInt(i / 3)]);
        cel.className = "left";
        cel = row.insertCell(i + 1);
        cel.innerHTML = "";
        cel = row.insertCell(i + 2);
    }
    row = table.insertRow();
    cel = row.insertCell(0);
    cel.innerHTML = "Game";
    for(var i = 1; i<nrPlayers* 3 + 1;i = i + 3) {
        var cel = row.insertCell(i);
        cel.innerHTML = "Score";
        cel.className = "table left bottom";
        cel = row.insertCell(i + 1);
        cel.innerHTML = "B";
        cel.className = "table bottom";
        cel = row.insertCell(i + 2);
        cel.innerHTML = "W";
        cel.className = "table bottom";
    }
    var aux = generateRounds(nrPlayers, type);
    for(var k = 0; k< nrPlayers * 3 + 12; k++) {
        var bot = ""
        if(k % nrPlayers == nrPlayers - 1)
            bot = "bottom"
        row = table.insertRow();
        cel = row.insertCell(0);
        cel.className = "table " + bot;
        cel.innerHTML = "" + aux[k];
        for(var i = 1; i<nrPlayers* 3 + 1;i = i + 3) {
            var cel = row.insertCell(i);
            cel.innerHTML = "";
            cel.className = "table left " + bot;
            cel = row.insertCell(i + 1);
            cel.innerHTML = "";
            cel.className = "table " + bot;
            cel = row.insertCell(i + 2);
            cel.innerHTML = "";
            cel.className = "table " + bot;
        }
    }
}


//game function
function gameFound(obj, cardGame, delayBot){
    setTimerBot(delayBot);
    var x = setInterval(function() {
      var now = new Date();
      var distance = countDownDate - now;
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      document.getElementById("timerBot").innerHTML =  seconds;
    }, 1000);
    gameRoom(cardGame.nrPlayers);
    $('#findGameDiv').prop("hidden",true);
    $('#cardGame').prop("hidden",false);
    $('#chat').prop("disabled", false);
    $('#chatButton').prop("dis abled", false);
    cardGame.playerId = obj.player;
    cardGame.room = obj.room;
    cardGame.cards = obj.cards;
    cardGame.turns = cardGame.cards.length;
    cardGame.atu = obj.atu;
    for(var i = 0 ; i < cardGame.cards.length ; i++) {
        cardGame.colorArray[parseInt(cardGame.cards[i] / 100) - 1]++;
        $('#card' + i).prop("hidden", false);
        $('#card' + i).prop("src", "PNG/" + cardGame.cards[i] + ".png");
    }
    backgroundOn(cardGame.currentPlayer, cardGame);
    if(cardGame.atu != 0)
        $('#atu').prop("src", "PNG/" + cardGame.atu + ".png");
    if(cardGame.playerId == cardGame.currentPlayer) {
        for(var i = 0; i <= cardGame.cards.length; i++) {
            $('#bidButton' + i).prop("disabled", false);
        }
    }
}
function bidding(obj, cardGame, delayBot){
    setTimerBot(delayBot);
    cardGame.moves++;
    totalBids += obj.bid;
    player = obj.player;
    if(cardGame.playerId == player) {
        for(var i = 0; i <= 8; i++) {
            $('#bidButton' + i).prop("disabled", true);
        }
    }
    var cel = document.getElementById("score-table").rows[2 + cardGame.currentRound].cells[2 + 3 * obj.player];
    cel.innerHTML = obj.bid;
    backgroundOff(player, cardGame);
    cardGame.currentPlayer = (player + 1) % cardGame.nrPlayers;
    backgroundOn(cardGame.currentPlayer, cardGame);
    if(player - cardGame.playerId < 0) {
        $('#bid' + (cardGame.nrPlayers - cardGame.playerId + player)).html(obj.bid);
        cardGame.bids[(cardGame.nrPlayers - cardGame.playerId + player)] = obj.bid;
    } else {
        $('#bid' + (player - cardGame.playerId)).html(obj.bid);
        cardGame.bids[(player - cardGame.playerId)] = obj.bid;
    }
    if(cardGame.playerId == cardGame.currentPlayer && cardGame.moves != cardGame.nrPlayers)
        for(var i = 0; i <= cardGame.cards.length; i++) {
            if(cardGame.moves == cardGame.nrPlayers - 1 && cardGame.cards.length - totalBids == i)
                continue;
            $('#bidButton' + i).prop("disabled", false);
        }
    if(cardGame.moves == cardGame.nrPlayers) {
        cardGame.moves = 0;
        if(cardGame.playerId == cardGame.currentPlayer) {
            for(var i = 0; i <= cardGame.cards.length; i++) {
                $('#card' + i).prop("style", "opacity: 1;");
            }
        }
    }
}
function playing(obj, cardGame, delayBot){
   var player = obj.player;
   if(cardGame.playerId == player)
       for(var i = 0; i <= cardGame.cards.length; i++) {
           if(cardGame.cards[i] == obj.card) {
               cardGame.colorArray[parseInt(cardGame.cards[i]/100) - 1]--;
               $('#card' + i).prop("hidden", true);
           }
           $('#card' + i).prop("style", "opacity: 0.5;");
       }
   backgroundOff(player, cardGame);
   cardGame.currentPlayer = (player + 1) % cardGame.nrPlayers;
   if(player - cardGame.playerId < 0) {
       $('#played' + (cardGame.nrPlayers - cardGame.playerId + player)).prop("src", "PNG/" + obj.card +".png");
       cardGame.played[(cardGame.nrPlayers - cardGame.playerId + player)] = obj.card;
   } else {
       $('#played' + (player - cardGame.playerId)).prop("src", "PNG/" + obj.card +".png");
       cardGame.played[(player - cardGame.playerId)] = obj.card;
   }
   if(cardGame.winner == 0) {
       cardGame.winner = obj.card;
       cardGame.color = parseInt(obj.card / 100);
   } else {
       if(cardGame.atu!= 0 && parseInt(cardGame.winner/100) == parseInt(cardGame.atu/100) && parseInt(obj.card/100) == parseInt(cardGame.atu/100) && obj.card > cardGame.winner) {
           cardGame.winner = obj.card;
       } else if(cardGame.atu!= 0 && parseInt(cardGame.winner/100) != parseInt(cardGame.atu/100) && parseInt(obj.card/100) == parseInt(cardGame.atu/100)) {
           cardGame.winner = obj.card;
       } else if(parseInt(cardGame.winner/100) == cardGame.color && parseInt(obj.card/100) == cardGame.color && obj.card > cardGame.winner) {
           cardGame.winner = obj.card;
       } else if(parseInt(cardGame.winner/100) != parseInt(cardGame.atu/100)  && parseInt(cardGame.winner/100) != cardGame.color && parseInt(obj.card/100) == cardGame.color ) {
           cardGame.winner = obj.card;
       }
   }
   cardGame.moves++;
   if(cardGame.moves != cardGame.nrPlayers)
       backgroundOn(cardGame.currentPlayer, cardGame);
   if(cardGame.playerId == cardGame.currentPlayer && cardGame.moves != cardGame.nrPlayers)
       if(cardGame.colorArray[cardGame.color - 1]!= 0) {
           for(var i = 0; i <= cardGame.cards.length; i++) {
               if(parseInt(cardGame.cards[i] /100) == cardGame.color)
                   $('#card' + i).prop("style", "opacity: 1;");
           }
       }else if(cardGame.atu!=0 && cardGame.colorArray[parseInt(cardGame.atu/100) - 1] != 0) {
           for(var i = 0; i <= cardGame.cards.length; i++) {
               if(parseInt(cardGame.cards[i] /100) == parseInt(cardGame.atu/100))
                   $('#card' + i).prop("style", "opacity: 1;");
           }
       }else {
           for(var i = 0; i <= cardGame.cards.length; i++) {
               $('#card' + i).prop("style", "opacity: 1;");
           }
       }
   if(cardGame.moves === cardGame.nrPlayers) {
       setTimerBot(delayBot + 2);
       cardGame.turns--;
       for(var i = 0; i<cardGame.nrPlayers; i++)
           if(cardGame.played[i] == cardGame.winner) {
               cardGame.won[i]++;
               cardGame.currentPlayer = i;
               if(cardGame.turns!=0){
                   backgroundOn(cardGame.currentPlayer + cardGame.playerId, cardGame);
                   console.log(cardGame.currentPlayer);
               }
               if(cardGame.currentPlayer == 0 && cardGame.turns != 0)
                   for(var j = 0; j < cardGame.cards.length; j++) {
                       $('#card' + j).prop("style", "opacity: 1;");
                   }
               $('#won' + i).html(cardGame.won[i]);
               break;
           }
       cardGame.winner = 0;
       cardGame.color = 0;
       cardGame.moves = 0;
       setTimeout(() => {
           for(var i = 0; i<cardGame.nrPlayers; i++) {
               $('#played' + i).prop("src", "PNG/card_back.png");
           }
       }, 2000);
   } else {
       setTimerBot(delayBot);
   }
}
function endRound(obj, cardGame){
    cardGame.cards = obj.cards;
    cardGame.turns = cardGame.cards.length;
    cardGame.atu = obj.atu;
    totalBids = 0;
    for(var i = 0 ; i < cardGame.cards.length ; i++) {
        cardGame.colorArray[parseInt(cardGame.cards[i] / 100) - 1]++;
        $('#card' + i).prop("hidden", false);
        $('#card' + i).prop("src", "PNG/" + cardGame.cards[i] + ".png");
    }
    if(cardGame.atu != null && cardGame.atu != 0) {
        $('#atu').prop("src", "PNG/" + cardGame.atu + ".png");
    } else {
        $('#atu').prop("src", "PNG/card_back.png");
        cardGame.atu = 0;
    }
    for(var i = 0; i<cardGame.nrPlayers; i++){
        if(i - cardGame.playerId < 0) {
            var cel = document.getElementById("score-table").rows[2 + cardGame.currentRound].cells[3 + 3 * i];
            cel.innerHTML = cardGame.won[cardGame.nrPlayers - cardGame.playerId + i];
        } else {
            var cel = document.getElementById("score-table").rows[2 + cardGame.currentRound].cells[3 + 3 * i];
            cel.innerHTML = cardGame.won[i - cardGame.playerId];
        }

    }
    for(var i = 0; i<cardGame.nrPlayers; i++) {
        if(cardGame.bids[i] == cardGame.won[i])
            cardGame.score[i] += 5 + cardGame.bids[i];
        else
            cardGame.score[i] = cardGame.score[i] - Math.abs(cardGame.bids[i] - cardGame.won[i]);
        cardGame.bids[i] = 0;
        cardGame.won[i] = 0;
        $('#played' + i).prop("src", "PNG/card_back.png");
        $('#bid' + i).html("");
        $('#won' + i).html(0);
        $('#score' + i).html(cardGame.score[i]);
    }
    for(var i = 0; i<cardGame.nrPlayers; i++){
        if(i - cardGame.playerId < 0) {
            var cel = document.getElementById("score-table").rows[2 + cardGame.currentRound].cells[1 + 3 * i];
            cel.innerHTML = cardGame.score[cardGame.nrPlayers - cardGame.playerId + i];
        } else {
            var cel = document.getElementById("score-table").rows[2 + cardGame.currentRound].cells[1 + 3 * i];
            cel.innerHTML = cardGame.score[i - cardGame.playerId];
        }
    }
    cardGame.currentRound++;
    backgroundOn(cardGame.currentRound % cardGame.nrPlayers, cardGame);
    if(cardGame.playerId == cardGame.currentRound % cardGame.nrPlayers)
        for(var i = 0; i <= cardGame.cards.length; i++) {
            $('#bidButton' + i).prop("disabled", false);
        }
}
function endGame(obj, cardGame){
    for(var i = 0; i<cardGame.nrPlayers; i++){
        if(i - playerId < 0) {
            var cel = document.getElementById("score-table").rows[2 + cardGame.currentRound].cells[3 + 3 * i];
            cel.innerHTML = cardGame.won[cardGame.nrPlayers - cardGame.playerId + i];
        } else {
            var cel = document.getElementById("score-table").rows[2 + cardGame.currentRound].cells[3 + 3 * i];
            cel.innerHTML = cardGame.won[i - cardGame.playerId];
        }

    }
    for(var i = 0; i<cardGame.nrPlayers; i++) {
        if(cardGame.bids[i] == cardGame.won[i])
            cardGame.score[i] += 5 + cardGame.bids[i];
        else
            cardGame.score[i] = cardGame.score[i] - Math.abs(cardGame.bids[i] - cardGame.won[i]);
        cardGame.bids[i] = 0;
        cardGame.won[i] = 0;
        $('#played' + i).prop("src", "PNG/card_back.png");
        $('#bid' + i).html("");
        $('#won' + i).html(0);
        $('#score' + i).html(cardGame.score[i]);
    }
    for(var i = 0; i<cardGame.nrPlayers; i++){
        if(i - cardGame.playerId < 0) {
            var cel = document.getElementById("score-table").rows[2 + cardGame.currentRound].cells[1 + 3 * i];
            cel.innerHTML = cardGame.score[cardGame.nrPlayers - cardGame.playerId + i];
        } else {
            var cel = document.getElementById("score-table").rows[2 + cardGame.currentRound].cells[1 + 3 * i];
            cel.innerHTML = cardGame.score[i - cardGame.playerId];
        }
    }
    //alert("Game over");
    console.log(cardGame.score);
}
function reconnect(obj) {
    var x = setInterval(function() {
      var now = new Date();
      var distance = countDownDate - now;
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      document.getElementById("timerBot").innerHTML =  seconds;
    }, 1000);
    console.log(obj);
    cardGame = new CardGame(obj.score.length, obj.type);
    gameRoom(cardGame.nrPlayers);
    $('#findGameDiv').prop("hidden",true);
    $('#cardGame').prop("hidden",false);
    $('#chat').prop("disabled", false);
    $('#chatButton').prop("disabled", false);
    cardGame.playerId = obj.playerId;
    for(var i = 0; i< obj.score.length; i++) {
        totalBids += obj.bids[i];
        if(i - cardGame.playerId < 0) {
            $('#bid' + (cardGame.nrPlayers - cardGame.playerId + i)).html(obj.bids[i]);
            cardGame.bids[(cardGame.nrPlayers - cardGame.playerId + i)] = obj.bids[i];
            if(obj.played[i] == 0)
                $('#played' + (cardGame.nrPlayers - cardGame.playerId + i)).prop("src", "PNG/card_back.png");
            else
                $('#played' + (cardGame.nrPlayers - cardGame.playerId + i)).prop("src", "PNG/" + obj.played[i] +".png");
            cardGame.played[(cardGame.nrPlayers - cardGame.playerId + i)] = obj.played[i];
            $('#score' + (cardGame.nrPlayers - cardGame.playerId + i)).html(obj.score[i]);
            cardGame.score[(cardGame.nrPlayers - cardGame.playerId + i)] = obj.score[i];
            $('#won' + (cardGame.nrPlayers - cardGame.playerId + i)).html(obj.won[i]);
            cardGame.won[(cardGame.nrPlayers - cardGame.playerId + i)] = obj.won[i];
            $('#user' + (cardGame.nrPlayers - cardGame.playerId + i)).html(obj.users[i]);
            cardGame.users[(cardGame.nrPlayers - cardGame.playerId + i)] = obj.users[i];
        } else {
            $('#bid' + (i - cardGame.playerId)).html(obj.bids[i]);
            cardGame.bids[(i - cardGame.playerId)] = obj.bids[i];
            if(obj.played[i] == 0)
                $('#played' + (cardGame.nrPlayers - cardGame.playerId + i)).prop("src", "PNG/card_back.png");
            else
                $('#played' + (i - cardGame.playerId)).prop("src", "PNG/" + obj.played[i] +".png");
            cardGame.played[(i - cardGame.playerId)] = obj.played[i];
            $('#score' + (i - cardGame.playerId)).html(obj.score[i]);
            cardGame.score[(i - cardGame.playerId)] = obj.score[i];
            $('#won' + (i - cardGame.playerId)).html(obj.won[i]);
            cardGame.won[(i - cardGame.playerId)] = obj.won[i];
            $('#user' + (i - cardGame.playerId)).html(obj.users[i]);
            cardGame.users[(i - cardGame.playerId)] = obj.users[i];
        }
    }
    generateTable(cardGame.nrPlayers,cardGame.type, obj.users);
    let table = obj.table;
    let s = table.split(";");
    var aux = 0, k=0, round = 0;
    for(var i = 0; i < s.length - 1; i = i + 2) {
        if(aux == 0) {
            var cel = document.getElementById("score-table").rows[2 + round].cells[2 + 3 * parseInt(s[i])];
            cel.innerHTML = parseInt(s[i+1])
            k++;
        }
        if(aux == 1) {
            if(k % 2 == 0) {
                var cel = document.getElementById("score-table").rows[2 + round].cells[3 + 3 * parseInt(s[i])];
                cel.innerHTML = s[i+1];
            } else {
                var cel = document.getElementById("score-table").rows[2 + round].cells[1 + 3 * parseInt(s[i])];
                cel.innerHTML = s[i+1];
            }
            k++;
        }
        if(k == cardGame.nrPlayers && aux == 0) {
            aux = 1;
            k = 0;
        }
        if(k == cardGame.nrPlayers * 2 && aux == 1) {
            aux = 0;
            k = 0;
            round++;
        }
    }

    cardGame.currentRound = obj.currentRound;
    cardGame.cards = obj.cards;
    cardGame.turns = cardGame.cards.length;
    cardGame.color = obj.color;
    cardGame.moves = obj.moves;
    cardGame.winner = obj.winner;
    for(var i = 0; i< cardGame.cards.length; i++) {
        cardGame.colorArray[parseInt(cardGame.cards[i] / 100) - 1]++;
        $('#card' + i).prop("hidden", false);
        $('#card' + i).prop("src", "PNG/" + cardGame.cards[i] + ".png");
    }
    cardGame.room = obj.room;
    cardGame.atu = obj.atu;
    if(atu != 0) {
        $('#atu').prop("src", "PNG/" + cardGame.atu + ".png");
    } else {
        $('#atu').prop("src", "PNG/card_back.png");
    }
    cardGame.currentPlayer = obj.currentPlayer;
    backgroundOn(cardGame.currentPlayer, cardGame);
    if(cardGame.currentPlayer == cardGame.playerId && obj.state == 102) {
        for(var i = 0; i<=cardGame.cards.length; i++) {
            if(cardGame.moves == cardGame.nrPlayers - 1 && i == cardGame.cards.length - totalBids) {
                continue;
            }
            $('#bidButton' + i).prop("disabled", false);
        }
    }
    if(cardGame.currentPlayer == cardGame.playerId && obj.state == 103) {
        if(cardGame.moves == 0) {
            for(var i = 0; i<cardGame.cards.length; i++) {
                $('#card' + i).prop("style", "opacity: 1;");
            }
        } else {
            if(cardGame.colorArray[cardGame.color - 1]!= 0) {
                for(var i = 0; i <= cardGame.cards.length; i++) {
                    if(parseInt(cardGame.cards[i] /100) == cardGame.color)
                        $('#card' + i).prop("style", "opacity: 1;");
                }
            }else if(cardGame.atu!=0 && cardGame.colorArray[parseInt(cardGame.atu/100) - 1] != 0) {
                for(var i = 0; i <= cardGame.cards.length; i++) {
                    if(parseInt(cardGame.cards[i] /100) == parseInt(cardGame.atu/100))
                        $('#card' + i).prop("style", "opacity: 1;");
                }
            }else {
                for(var i = 0; i <= cardGame.cards.length; i++) {
                    $('#card' + i).prop("style", "opacity: 1;");
                }
            }
        }
    }
}