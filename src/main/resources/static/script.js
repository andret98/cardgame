var nrPlayers;
var type;
var moves = 0;
var code;
var playerId;
var player;
var currentRound = 0;
var currentPlayer = 0;
var room;
var totalBids = 0;
var turns = 0;
let cards;
var atu;
let bids = [0,0,0,0,0,0];
let won = [0,0,0,0,0,0];
let played = [0,0,0,0,0,0];
let score = [0,0,0,0,0,0];
let colorArray = [0,0,0,0];
var winner = 0;
var color = 0;
var timer;
var totalSeconds = 0;
var ws;
var username = "guest" + Math.random();
let aux;

function findGame() {
    nrPlayers = parseInt($('#nrPlayers').val());
    type = parseInt($('#gameType').val());
    waitForSocketConnection(ws, function(){
        var myObj = {code: 101, data: (nrPlayers * 10 + type), room: null};
        var myJSON = JSON.stringify(myObj);
        ws.send(myJSON);
    });
    $('#findGame').prop("disabled",true);
    $('#cancel').prop("hidden", false);
    $('#findTimer').prop("hidden",false);
    timer = setInterval(setTime, 1000);
}

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

function signUp() {
    var u = $('#signUser').val();
    var p1 = $('#signPass1').val();
    var p2 = $('#signPass2').val();
    if(p1 === p2 && u.length > 0 && p1.length > 0) {
        var myObj = {code: 300, msg: u + " " + p1};
        var myJSON = JSON.stringify(myObj);
        ws.send(myJSON);
    } else {
        $('#signUpError').html("user/pass error");
    }
}

function login() {
    username = $('#uName').val();
    var p = $('#pass').val();
    if(username.length > 0 && p.length > 0) {
        var myObj = {code: 301, msg: username + " " + p};
        var myJSON = JSON.stringify(myObj);
        ws.send(myJSON);
    } else {
        $('#loginError').html("user/pass error");
    }
}

function cancel() {
    var myObj = {code: 106, data: (nrPlayers * 10 + type)};
    var myJSON = JSON.stringify(myObj);
    ws.send(myJSON);
    $('#cancel').prop("hidden", true);
    $('#findGame').prop("disabled",false);
    clearInterval(timer);
    totalSeconds = 0;
    $('#seconds').html("00");
    $('#minutes').html("00");
    $('#findTimer').prop("hidden",true);
}

function bid(i) {
    var myObj = {code: 102, data: i, room: room};
    var myJSON = JSON.stringify(myObj);
    ws.send(myJSON);
}

function play(i) {
    var myObj = {code: 103, data: cards[i], room: room};
    var myJSON = JSON.stringify(myObj);
    ws.send(myJSON);
}

function chat() {
    var message = document.getElementById('chat').value.trim();
    var myObj = {code: 200, room: room, msg: message};
    var myJSON = JSON.stringify(myObj);
    document.getElementById('chat').value = "";
    ws.send(myJSON);
}

function gameRoom(n) {
    for(var i = 0; i < n; i++) {
        $('#player' + i).prop("hidden", false);
        $('#played' + i).prop("hidden", false);
    }
}

function backgroundOff(currentPlayer) {
    if(currentPlayer - playerId < 0) {
        $('#player' + (nrPlayers - playerId + currentPlayer)).css("background-color","inherit");
    } else {
        $('#player' + (currentPlayer - playerId)).css("background-color","inherit");
    }
}

function backgroundOn(currentPlayer) {
    if(currentPlayer - playerId < 0) {
        $('#player' + (nrPlayers - playerId + currentPlayer)).css("background-color","rgba(240,255,255,0.4)");
    } else {
        $('#player' + (currentPlayer - playerId)).css("background-color","rgba(240,255,255,0.4)");
    }
}

function reconnect(obj) {
    console.log(obj);
    nrPlayers = obj.score.length;
    gameRoom(nrPlayers);
    $('#findGameDiv').prop("hidden",true);
    $('#cardGame').prop("hidden",false);
    $('#chat').prop("disabled", false);
    $('#chatButton').prop("disabled", false);
    playerId = obj.playerId;
    for(var i = 0; i< obj.score.length; i++) {
        totalBids += obj.bids[i];
        if(i - playerId < 0) {
            $('#bid' + (nrPlayers - playerId + i)).html(obj.bids[i]);
            bids[(nrPlayers - playerId + i)] = obj.bids[i];
            if(obj.played[i] == 0)
                $('#played' + (nrPlayers - playerId + i)).prop("src", "PNG/card_back.png");
            else
                $('#played' + (nrPlayers - playerId + i)).prop("src", "PNG/" + obj.played[i] +".png");
            played[(nrPlayers - playerId + i)] = obj.played[i];
            $('#score' + (nrPlayers - playerId + i)).html(obj.score[i]);
            score[(nrPlayers - playerId + i)] = obj.score[i];
            $('#won' + (nrPlayers - playerId + i)).html(obj.won[i]);
            score[(nrPlayers - playerId + i)] = obj.won[i];
        } else {
            $('#bid' + (i - playerId)).html(obj.bids[i]);
            bids[(i - playerId)] = obj.bids[i];
            if(obj.played[i] == 0)
                $('#played' + (nrPlayers - playerId + i)).prop("src", "PNG/card_back.png");
            else
                $('#played' + (i - playerId)).prop("src", "PNG/" + obj.played[i] +".png");
            played[(i - playerId)] = obj.played[i];
            $('#score' + (i - playerId)).html(obj.score[i]);
            score[(i - playerId)] = obj.score[i];
            $('#won' + (i - playerId)).html(obj.won[i]);
            score[(i - playerId)] = obj.won[i];
        }
    }

    currentRound = obj.currentRound;
    cards = obj.cards;
    turns = cards.length;
    color = obj.color;
    moves = obj.moves;
    winner = obj.winner;
    for(var i = 0; i< cards.length; i++) {
        colorArray[parseInt(cards[i] / 100) - 1]++;
        $('#card' + i).prop("hidden", false);
        $('#card' + i).prop("src", "PNG/" + cards[i] + ".png");
    }
    room = obj.room;
    atu = obj.atu;
    if(atu != 0) {
        $('#atu').prop("src", "PNG/" + atu + ".png");
    } else {
        $('#atu').prop("src", "PNG/card_back.png");
    }
    currentPlayer = obj.currentPlayer;
    backgroundOn(currentPlayer);
    if(currentPlayer == playerId && obj.state == 102) {
        for(var i = 0; i<=cards.length; i++) {
            if(moves == nrPlayers - 1 && i == cards.length - totalBids) {
                continue;
            }
            $('#bidButton' + i).prop("disabled", false);
        }
    }
    if(currentPlayer == playerId && obj.state == 103) {
        if(moves == 0) {
            for(var i = 0; i<cards.length; i++) {
                $('#card' + i).prop("style", "opacity: 1;");
            }
        } else {
            if(colorArray[color - 1]!= 0) {
                for(var i = 0; i <= cards.length; i++) {
                    if(parseInt(cards[i] /100) == color)
                        $('#card' + i).prop("style", "opacity: 1;");
                }
            }else if(atu!=0 && colorArray[parseInt(atu/100) - 1] != 0) {
                for(var i = 0; i <= cards.length; i++) {
                    if(parseInt(cards[i] /100) == parseInt(atu/100))
                        $('#card' + i).prop("style", "opacity: 1;");
                }
            }else {
                for(var i = 0; i <= cards.length; i++) {
                    $('#card' + i).prop("style", "opacity: 1;");
                }
            }
        }
    }
}

function waitForSocketConnection(socket, callback){
    setTimeout(
        function () {
            if (socket.readyState === 1) {
                console.log("Connection is made")
                if (callback != null){
                    callback();
                }
            } else {
                console.log("wait for connection...")
                waitForSocketConnection(socket, callback);
            }

        }, 5); // wait 5 milisecond for the connection...
}


$(function(){
    $("#chat").keypress(function (e) {
        if(e.which == 13) {
            chat();
        }
    });
    $( ".noSpace" ).on({
      keydown: function(e) {
        if (e.which === 32)
          return false;
      },
    });
    window.onclick = function(event) {
        if (event.target == document.getElementById('login')) {
            document.getElementById('login').style.display = "none";
        }
        if (event.target == document.getElementById('signIn')) {
            document.getElementById('signUp').style.display = "none";
        }
    }
    ws = new WebSocket('ws://localhost:8080/game');
    ws.onmessage = function(data) {
        var obj = JSON.parse(data.data);
        code = obj.code;
        if(code == 101) {
            var now = new Date();
            var time = now.getTime();
            time += 360 * 1000;
            now.setTime(time);
            //document.cookie = 'username' + obj.player + '=' + username +
            //                  '; expires=' + now.toUTCString() +
            //                  '; path=/';
            gameRoom(nrPlayers);
            $('#findGameDiv').prop("hidden",true);
            $('#cardGame').prop("hidden",false);
            $('#chat').prop("disabled", false);
            $('#chatButton').prop("disabled", false);
            playerId = obj.player;
            room = obj.room;
            cards = obj.cards;
            turns = cards.length;
            atu = obj.atu;
            for(var i = 0 ; i < cards.length ; i++) {
                colorArray[parseInt(cards[i] / 100) - 1]++;
                $('#card' + i).prop("hidden", false);
                $('#card' + i).prop("src", "PNG/" + cards[i] + ".png");
            }
            backgroundOn(currentPlayer);
            if(atu != 0)
                $('#atu').prop("src", "PNG/" + atu + ".png");
            if(playerId == currentPlayer) {
                for(var i = 0; i <= cards.length; i++) {
                    $('#bidButton' + i).prop("disabled", false);
                }
            }
        } else if(code == 102){
            moves++;
            totalBids += obj.bid;
            player = obj.player;
            if(playerId == player) {
                for(var i = 0; i <= 8; i++) {
                    $('#bidButton' + i).prop("disabled", true);
                }
            }
            backgroundOff(player);
            currentPlayer = (player + 1) % nrPlayers;
            backgroundOn(currentPlayer);
            //bids[player] = obj.bid;
            //$('#bid' + player).html(obj.bid);
            if(player - playerId < 0) {
                $('#bid' + (nrPlayers - playerId + player)).html(obj.bid);
                bids[(nrPlayers - playerId + player)] = obj.bid;
            } else {
                $('#bid' + (player - playerId)).html(obj.bid);
                bids[(player - playerId)] = obj.bid;
            }
            if(playerId == currentPlayer && moves != nrPlayers)
                for(var i = 0; i <= cards.length; i++) {
                    if(moves == nrPlayers - 1 && cards.length - totalBids == i)
                        continue;
                    $('#bidButton' + i).prop("disabled", false);
                }
            if(moves == nrPlayers) {
                moves = 0;
                if(playerId == currentPlayer) {
                    for(var i = 0; i <= cards.length; i++) {
                        $('#card' + i).prop("style", "opacity: 1;");
                    }
                }
            }
        } else if(code == 103) {

            player = obj.player;
            if(playerId == player)
                for(var i = 0; i <= cards.length; i++) {
                    if(cards[i] == obj.card) {
                        colorArray[parseInt(cards[i]/100) - 1]--;
                        $('#card' + i).prop("hidden", true);
                    }
                    $('#card' + i).prop("style", "opacity: 0.5;");
                }
            backgroundOff(player);
            currentPlayer = (player + 1) % nrPlayers;
            if(player - playerId < 0) {
                $('#played' + (nrPlayers - playerId + player)).prop("src", "PNG/" + obj.card +".png");
                played[(nrPlayers - playerId + player)] = obj.card;
            } else {
                $('#played' + (player - playerId)).prop("src", "PNG/" + obj.card +".png");
                played[(player - playerId)] = obj.card;
            }
            if(winner == 0) {
                winner = obj.card;
                color = parseInt(obj.card / 100);
            } else {
                if(atu!= 0 && parseInt(winner/100) == parseInt(atu/100) && parseInt(obj.card/100) == parseInt(atu/100) && obj.card > winner) {
                    winner = obj.card;
                } else if(atu!= 0 && parseInt(winner/100) != parseInt(atu/100) && parseInt(obj.card/100) == parseInt(atu/100)) {
                    winner = obj.card;
                } else if(parseInt(winner/100) == color && parseInt(obj.card/100) == color && obj.card > winner) {
                    winner = obj.card;
                } else if(parseInt(winner/100) != parseInt(atu/100)  && parseInt(winner/100) != color && parseInt(obj.card/100) == color ) {
                    winner = obj.card;
                }
            }
            moves++;
            if(moves != nrPlayers)
                backgroundOn(currentPlayer);
            if(playerId == currentPlayer && moves != nrPlayers)
                if(colorArray[color - 1]!= 0) {
                    for(var i = 0; i <= cards.length; i++) {
                        if(parseInt(cards[i] /100) == color)
                            $('#card' + i).prop("style", "opacity: 1;");
                    }
                }else if(atu!=0 && colorArray[parseInt(atu/100) - 1] != 0) {
                    for(var i = 0; i <= cards.length; i++) {
                        if(parseInt(cards[i] /100) == parseInt(atu/100))
                            $('#card' + i).prop("style", "opacity: 1;");
                    }
                }else {
                    for(var i = 0; i <= cards.length; i++) {
                        $('#card' + i).prop("style", "opacity: 1;");
                    }
                }
            if(moves === nrPlayers) {
                setTimeout(() => {turns--;
                for(var i = 0; i<nrPlayers; i++)
                    if(played[i] == winner) {
                        won[i]++;
                        currentPlayer = i;
                        if(turns!=0)
                            backgroundOn(currentPlayer);
                        if(currentPlayer == 0 && turns != 0)
                            for(var j = 0; j < cards.length; j++) {
                                $('#card' + j).prop("style", "opacity: 1;");
                                console.log(cards[j]);
                            }
                        $('#won' + i).html(won[i]);
                        break;
                    }
                winner = 0;
                color = 0;
                moves = 0;
                for(var i = 0; i<nrPlayers; i++) {
                    $('#played' + i).prop("src", "PNG/card_back.png");
                }}, 0);
            }
        } else if(code == 104) {
            setTimeout(() => {
            cards = obj.cards;
            turns = cards.length;
            atu = obj.atu;
            totalBids = 0;
            for(var i = 0 ; i < cards.length ; i++) {
                colorArray[parseInt(cards[i] / 100) - 1]++;
                $('#card' + i).prop("hidden", false);
                $('#card' + i).prop("src", "PNG/" + cards[i] + ".png");
            }
            if(atu != null && atu != 0) {
                $('#atu').prop("src", "PNG/" + atu + ".png");
            } else {
                $('#atu').prop("src", "PNG/card_back.png");
                atu = 0;
            }
            for(var i = 0; i<nrPlayers; i++) {
                if(bids[i] == won[i])
                    score[i] += 5 + bids[i];
                else
                    score[i] = score[i] - Math.abs(bids[i] - won[i]);
                bids[i] = 0;
                won[i] = 0;
                $('#played' + i).prop("src", "PNG/card_back.png");
                $('#bid' + i).html("");
                $('#won' + i).html(0);
                $('#score' + i).html(score[i]);
            }
            console.log(score);
            currentRound++;
            backgroundOn(currentRound % nrPlayers);
            if(playerId == currentRound % nrPlayers)
                for(var i = 0; i <= cards.length; i++) {
                    $('#bidButton' + i).prop("disabled", false);
                }},0)
        } else if(code == 105) {
            setTimeout(() => {
            for(var i = 0; i<nrPlayers; i++) {
                if(bids[i] == won[i])
                    score[i] += 5 + bids[i];
                else
                    score[i] = score[i] - Math.abs(bids[i] - won[i]);
                bids[i] = 0;
                won[i] = 0;
                $('#played' + i).prop("src", "PNG/card_back.png");
                $('#bid' + i).html("");
                $('#won' + i).html(0);
                $('#score' + i).html(score[i]);
            }
            alert("Game over");
            console.log(score);},0)
        } else if(code == 107) {
            reconnect(obj);
        } else if(code == 200) {
            var textarea = document.getElementById('chatBoard');
            if(textarea.scrollHeight - textarea.scrollTop < 130)
                textarea.scrollTop = textarea.scrollHeight;
            textarea.value = textarea.value + "Player"+ obj.player +": " +obj.message + "\n";
        } else if(code == 300) {
            if(obj.data.length == 0) {
                $('#signUser').val("");
                $('#signPass1').val("");
                $('#signPass2').val("");
                document.getElementById('signUp').style.display='none';
                document.getElementById('login').style.display='block';
                $('#signUpError').html("");
            } else {
                $('#signUpError').html(obj.data);
            }
        } else if(code == 301) {
            if(obj.data == username) {
                document.getElementById('login').style.display='none';
                $('#uName').val("");
                $('#pass').val("");
                $('#loginError').html("");
                $('#loginButton').prop("hidden",true);
                $('#logoutButton').prop("hidden",false);
                $('#username').html(username);
            } else {
                $('#loginError').html(obj.data);
            }
        }

    };

});