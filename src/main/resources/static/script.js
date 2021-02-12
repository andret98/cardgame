var code;
var player;
var timer;
var totalSeconds = 0;
var ws;
var leader = 0;
var username;
var countDownDate;
var delayBot = 10;
var selected = 0;
let aux;
class CardGame{
    constructor(nrPlayers, type) {
        this.nrPlayers = nrPlayers;
        this.type = type;
        this.moves = 0;
        this.currentRound = 0;
        this.currentPlayer = 0;
        this.turns = 0;
        this.bids = [0,0,0,0,0,0];
        this.won = [0,0,0,0,0,0];
        this.played = [0,0,0,0,0,0];
        this.score = [0,0,0,0,0,0];
        this.colorArray = [0,0,0,0];
        this.users = ["","","","","",""];
        this.winner = 0;
        this.color = 0;
    }
}
let cardGame;

function findGame() {
    nrPlayers = parseInt($('#nrPlayers').val());
    type = parseInt($('#gameType').val());
    cardGame = new CardGame(nrPlayers, type);
    waitForSocketConnection(ws, function(){
        var myObj = {code: 101, data: (cardGame.nrPlayers * 10 + cardGame.type)};
        var myJSON = JSON.stringify(myObj);
        ws.send(myJSON);
    });
    $('#findGame').prop("disabled",true);
    $('#cancel').prop("hidden", false);
    $('#findTimer').prop("hidden",false);
    timer = setInterval(setTime, 1000);
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
    var myObj = {code: 106, data: (cardGame.nrPlayers * 10 + cardGame.type)};
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
    var myObj = {code: 102, data: i, room: cardGame.room};
    var myJSON = JSON.stringify(myObj);
    ws.send(myJSON);
}

function play(i) {
    var myObj = {code: 103, data: cardGame.cards[i], room: cardGame.room};
    var myJSON = JSON.stringify(myObj);
    ws.send(myJSON);
}

function chat() {
    var message = document.getElementById('chat').value.trim();
    var myObj = {code: 200, room: cardGame.room, msg: message};
    var myJSON = JSON.stringify(myObj);
    document.getElementById('chat').value = "";
    ws.send(myJSON);
}

function createLobby(){
    nrPlayers = parseInt($('#nrPlayersLobby').val());
    type = parseInt($('#gameTypeLobby').val());
    $('#lobby-start').prop("disabled", false);
    leader = 1;
    cardGame = new CardGame(nrPlayers, type);
    var myObj = {code: 400, data: (cardGame.nrPlayers * 10 + cardGame.type), msg : username};
    var myJSON = JSON.stringify(myObj);
    ws.send(myJSON);
}

function showLobbies(){
    var myObj = {code: 401};
    var myJSON = JSON.stringify(myObj);
    ws.send(myJSON);
}

function joinLobby(){
    var table = document.getElementById("lobby-table");
    var row = table.rows[selected];
    cardGame = new CardGame(parseInt(row.cells[2].innerHTML), parseInt(row.cells[1].innerHTML));
    cardGame.room = row.cells[0].innerHTML;
    var myObj = {code: 402, data: parseInt(cardGame.room), msg: username};
    var myJSON = JSON.stringify(myObj);
    ws.send(myJSON);
}

function lobbyList(obj){
    var table = document.getElementById("lobby-table");
    while(table.rows.length > 1) {
        table.deleteRow(1);
    }
    console.log(obj);
    for(k = 0; k<parseInt(obj.length / 3); k++) {
        var row = table.insertRow();
        for(var j = 0; j<3; j++){
            var cel = row.insertCell(j);
            cel.innerHTML = obj[j + k * 3];
            cel.className = "lobby";
            cel.onclick = function(){
                rIndex = this.parentElement.rowIndex;
                table.rows[selected].style.backgroundColor = "inherit";
                selected = rIndex;
                table.rows[selected].style.backgroundColor = "rgb(245, 245, 220)";
                cIndex = this.cellIndex;
            };
        }
    }
}

function leaveLobby(){
    $('#lobby-joined').prop("hidden", true);
    $('#lobby').prop("hidden", false);
    if(leader == 0)
        showLobbies();
    var myObj = {code: 404, data:cardGame.room};
    var myJSON = JSON.stringify(myObj);
    ws.send(myJSON);
}

function startLobby(){
    var myObj = {code: 403};
    var myJSON = JSON.stringify(myObj);
    ws.send(myJSON);
}

function joined(obj) {
    $('#lobby-joined').prop("hidden", false);
    var result = "";
    if(leader == 0) {
        $('#lobby-settings').prop("hidden", true);
        result += "Players: " + cardGame.nrPlayers + "<br>Type: " + cardGame.type + "<br>";
    }
    $('#lobby').prop("hidden", true);
    result += "Lobby leader: " + obj.data[0] + "<br>"
    for(var i=1; i<obj.data.length; i++)
        result += obj.data[i] + "<br>"
    $('#lobby-players').html(result);
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
        if (event.target == document.getElementById('score')) {
            document.getElementById('score').style.display = "none";
        }
    }
    ws = new WebSocket('ws://localhost:8080/game');
    ws.onmessage = function(data) {
        var obj = JSON.parse(data.data);
        code = obj.code;
        if(code == 100) {
            username = "Guest" + obj.data;
            $("#username").html(username);
        } else if(code == 101) {
            //var now = new Date();
            //var time = now.getTime();
            //time += 360 * 1000;
            //now.setTime(time);
            //document.cookie = 'username' + obj.player + '=' + username +
            //                  '; expires=' + now.toUTCString() +
            //                  '; path=/';
            $('#lobby-joined').prop("hidden", true);
            gameFound(obj, cardGame, delayBot);
            var myObj = {code: 201, msg: username, room : cardGame.room};
            var myJSON = JSON.stringify(myObj);
            ws.send(myJSON);
        } else if(code == 102){
            bidding(obj, cardGame, delayBot);
        } else if(code == 103) {
            playing(obj, cardGame, delayBot);
        } else if(code == 104) {
            endRound(obj, cardGame);
        } else if(code == 105) {
            endGame(obj, cardGame);
        } else if(code == 107) {
            setTimerBot(delayBot);
            reconnect(obj);
        } else if(code == 200) {
            var textarea = document.getElementById('chatBoard');
            if(textarea.scrollHeight - textarea.scrollTop < 130)
                textarea.scrollTop = textarea.scrollHeight;
            textarea.value = textarea.value + obj.player +": " +obj.message + "\n";
        } else if(code == 201) {
            generateTable(cardGame.nrPlayers,cardGame.type, obj.users);
            for(var i = 0; i< cardGame.nrPlayers; i++) {
                if(i - cardGame.playerId < 0) {
                    $('#user' + (cardGame.nrPlayers - cardGame.playerId + i)).html(obj.users[i]);
                    cardGame.users[(cardGame.nrPlayers - cardGame.playerId + i)] = obj.users[i];
                } else {
                    $('#user' + (i - cardGame.playerId)).html(obj.users[i]);
                    cardGame.users[(i - cardGame.playerId)] = obj.users[i];
                }
            }
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
        } else if(code == 400) {
            $('#lobby-create').prop("disabled",true);
            $('#lobby-players').html("Lobby leader: " + username + "<br>");
            cardGame.room = obj.data;
        } else if(code == 401) {
            var s = obj.data.split(" ");
            lobbyList(s);
        } else if(code == 402) {
            joined(obj);
        } else if(code == 404) {
            if(typeof obj.data != "undefined") {
                joined(obj);
            } else {
                $('#lobby-joined').prop("hidden",true);
                $('#lobby').prop("hidden",false);
                showLobbies();
            }
        }
    };

});