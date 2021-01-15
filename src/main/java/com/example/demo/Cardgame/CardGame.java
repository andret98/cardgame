package com.example.demo.Cardgame;

import com.example.demo.configuration.Codes;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.*;

import static java.lang.Math.abs;

public class CardGame {
    private Timer timer;
    private List<WebSocketSession> sessions;
    private List<Integer> cardSet;
    private List<Integer> rounds;
    private List<List<Integer>> playersCards;
    private int currentRound;
    private int color;
    private int atu;
    private int state;
    private int[][] cardsColors;
    private int[] score;
    private int[] bids;
    private int[] played;
    private int[] won;
    private int winner;
    private int nrPlayers;
    private int currentPlayer;
    private Random random;
    private long delay = 1000000L;

    public CardGame(int nrPlayers, int cardGameType, List<WebSocketSession> sessions) {
        TimerTask timerTask = new TimerTask() {
            @Override
            public void run() {
                botMove();
            }
        };
        this.timer = new Timer();

        this.cardSet = CardSet.getCardSet(nrPlayers);
        this.sessions = sessions;
        this.nrPlayers = nrPlayers;
        this.rounds = CardsPerRound.getCardsPerRound(cardGameType * 10 + nrPlayers);
        this.currentRound = 0;
        this.state = CardGameState.CREATEGAME;
        this.cardsColors = new int[nrPlayers][4];
        this.score = new int[nrPlayers];
        this.bids = new int[nrPlayers];
        this.won = new int[nrPlayers];
        this.played = new int[nrPlayers];
        this.currentPlayer = 0;
        this.winner = 0;
        this.random = new Random();
        playersCards = new ArrayList<>();
        for(int i = 0; i<nrPlayers; i++) {
            List<Integer> aux = new ArrayList<>();
            for(int j = 0; j<this.rounds.get(currentRound); j++) {
                int card = this.cardSet.get(random.nextInt(this.cardSet.size()));
                cardsColors[i][card / 100 - 1]++;
                aux.add(card);
                this.cardSet.remove(Integer.valueOf(card));
            }
            Collections.sort(aux);
            playersCards.add(aux);
        }
        if(this.cardSet.size() != 0)
            this.atu = this.cardSet.get(random.nextInt(this.cardSet.size()));
        else
            this.atu = 0;
        this.state = CardGameState.BID;
        timer.scheduleAtFixedRate(timerTask, delay, delay);
    }

    public List<List<Integer>> getPlayersCards() {
        return playersCards;
    }
    public int[] getScore() {
        return score;
    }

    public List<WebSocketSession> getSessions() {
        return sessions;
    }
    public boolean containsSession(WebSocketSession session){
        return sessions.contains(session);
    }

    private int getTotalBid() {
        int total = 0;
        for(int i : bids)
            total += i;
        return total;
    }

    private int getInvalidBid() {
        int total = getTotalBid();
        return rounds.get(currentRound) - total;
    }

    public int getState() {
        return state;
    }

    public int getAtu() {
        return atu;
    }
    private void calculatScore() {
        for(int i = 0; i<nrPlayers; i++) {
            if(bids[i] != won[i])
                score[i] = score[i] - abs(bids[i] - won[i]);
            else
                score[i] += 5 + won[i];
            bids[i] = 0;
            won[i] = 0;
        }
    }

    public int getCurrentPlayerBid() {
        return (currentRound + currentPlayer) % nrPlayers;
    }

    public int getCurrentPlayerPlay() {
        return (winner + currentPlayer) % nrPlayers;
    }

    public boolean bid(int bid, WebSocketSession player) {
        int playerTurn = (currentRound + currentPlayer) % nrPlayers;
        if(state == CardGameState.BID && sessions.get(playerTurn).equals(player)) {
            if(currentPlayer == nrPlayers - 1) {
                int total = 0;
                for(int i : bids) {
                    total += i;
                }
                if(rounds.get(currentRound) - total == bid) {
                    System.out.println("Cant bid this");
                    return false;
                }
            }
            timer.cancel();
            bids[(currentRound + currentPlayer) % nrPlayers ] = bid;
            currentPlayer++;
            if(currentPlayer == nrPlayers) {
                state = CardGameState.PLAYCARD;
                currentPlayer = 0;
                winner = currentRound % nrPlayers;
            }
            timer = new Timer();
            timer.scheduleAtFixedRate(new TimerTask() {
                @Override
                public void run() {
                    botMove();
                }
            }, delay, delay);
            return true;
        } else {
            System.out.println("Not your turn");
            return false;
        }
    }

    public boolean play(int card, WebSocketSession player) {
        int playerTurn = (winner + currentPlayer) % nrPlayers;
        if(state == CardGameState.PLAYCARD && sessions.get(playerTurn).equals(player)) {
            if(currentPlayer == 0) {
                if(playersCards.get(playerTurn).contains(card)) {
                    timer.cancel();
                    color = card / 100;
                    cardsColors[playerTurn][color - 1]--;
                    played[playerTurn] = card;
                    playersCards.get(playerTurn).remove(Integer.valueOf(card));
                    timer = new Timer();
                    timer.scheduleAtFixedRate(new TimerTask() {
                        @Override
                        public void run() {
                            botMove();
                        }
                    }, delay, delay);
                } else {
                    System.out.println("Doesn't have that card");
                    return false;
                }
            } else {
                if(playersCards.get(playerTurn).contains(card)) {
                    timer.cancel();
                    if(card / 100 != color && cardsColors[playerTurn][color - 1] != 0) {
                        System.out.println("Didn't play at color ");
                        return false;
                    } else if(card / 100 != color && card / 100 != atu / 100 && atu != 0 && cardsColors[playerTurn][atu / 100 - 1] != 0){
                        System.out.println("Didn't play at atu");
                        return false;
                    }
                    played[playerTurn] = card;
                    cardsColors[playerTurn][card / 100 - 1]--;
                    playersCards.get(playerTurn).remove(Integer.valueOf(card));
                    timer = new Timer();
                    timer.scheduleAtFixedRate(new TimerTask() {
                        @Override
                        public void run() {
                            System.out.println("Bot move");
                            botMove();
                        }
                    }, delay, delay);
                } else {
                    System.out.println("Doesn't have that card");
                    return false;
                }
            }
            currentPlayer++;
            checkWinner();
            return true;
        } else {
            System.out.println("Not his turn");
            return false;
        }
    }

    private void checkWinner() {
        if(currentPlayer == nrPlayers) {
            int winningCard = played[0];
            winner = 0;
            for(int i = 1; i < played.length; i++) {
                if(atu != 0 && winningCard / 100 == atu /100 && played[i] / 100 == atu /100 && played[i] > winningCard) {
                    winningCard = played[i];
                    winner = i;
                } else if(atu != 0 && winningCard / 100 != atu / 100 && played[i] / 100 == atu / 100) {
                    winningCard = played[i];
                    winner = i;
                } else if(winningCard / 100 == color && played[i] / 100 == color && played[i] > winningCard) {
                    winningCard = played[i];
                    winner = i;
                } else if(winningCard / 100 != atu / 100 && winningCard / 100 != color && played[i] / 100 == color) {
                    winningCard = played[i];
                    winner = i;
                }
            }
            won[winner]++;
            for(int i = 0; i<nrPlayers; i++) {
                played[i] = 0;
            }
            currentPlayer = 0;
            rounds.set(currentRound, rounds.get(currentRound) - 1);
            if(rounds.get(currentRound) == 0) {
                currentRound++;
                calculatScore();
                if(currentRound != rounds.size()) {
                    state = CardGameState.BID;
                    color = 0;
                    currentPlayer = 0;
                    generateRound();
                } else {
                    state = CardGameState.GAMEOVER;
                }
            }
        }
    }
    private void generateRound() {
        cardSet = CardSet.getCardSet(nrPlayers);
        playersCards = new ArrayList<>();
        for(int i = 0; i<nrPlayers; i++) {
            List<Integer> aux = new ArrayList<>();
            for(int j = 0; j<rounds.get(currentRound); j++) {
                int card = cardSet.get(random.nextInt(cardSet.size()));
                cardsColors[i][card / 100 - 1]++;
                aux.add(card);
                cardSet.remove(Integer.valueOf(card));
            }
            Collections.sort(aux);
            playersCards.add(aux);
        }
        if(cardSet.size() != 0)
            atu = cardSet.get(random.nextInt(cardSet.size()));
        else
            atu = 0;
        state = CardGameState.BID;
    }

    public JSONObject reconnect(String old, WebSocketSession session) {
        int player = -1;
        for(int i = 0; i<sessions.size(); i++) {
            if(sessions.get(i).getId().equals(old)) {
                player = i;
                sessions.set(i, session);
                break;
            }
        }
        if(player == -1){
            System.out.println("Problema reconnect");
            return null;
        }
        JSONObject obj = new JSONObject();
        JSONArray array = new JSONArray();
        try {
            obj.put("code", Codes.RECONNECT);
            obj.put("playerId", player);
            for(int s : bids)
                array.put(s);
            obj.put("bids", array);
            array = new JSONArray();
            for(int s : won)
                array.put(s);
            obj.put("won", array);
            array = new JSONArray();
            for(int s : score)
                array.put(s);
            obj.put("score", array);
            array = new JSONArray();
            for(int s : played)
                array.put(s);
            obj.put("played", array);
            array = new JSONArray();
            for(int s : playersCards.get(player))
                array.put(s);
            obj.put("cards", array);
            obj.put("atu", atu);
            obj.put("moves", currentPlayer);
            obj.put("winner", winner);
            obj.put("currentRound",currentRound);
            obj.put("state", state);
            obj.put("color",color);
            if(state == CardGameState.BID) {
                obj.put("currentPlayer", getCurrentPlayerBid());
            }
            if(state == CardGameState.PLAYCARD) {
                obj.put("currentPlayer", getCurrentPlayerPlay());
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return obj;
    }

    private void botMove() {
        if(state == CardGameState.BID) {
            int playerTurn = (currentRound + currentPlayer) % nrPlayers;
            int invalid = -1;
            if(currentPlayer == nrPlayers - 1)
                invalid = getInvalidBid();
            int bid = random.nextInt(rounds.get(currentRound) + 1);
            if(bid == invalid) {
                if(bid == 0) {
                    bid = 1;
                } else {
                    bid--;
                }
            }
            bids[playerTurn ] = bid;
            for(WebSocketSession s : getSessions()) {
                //s.sendMessage(new TextMessage("player: " + currentPlayer + " bid: " + data));
                JSONObject obj = new JSONObject();
                try {
                    obj.put("code", Codes.BIDDING);
                    obj.put("player",playerTurn);
                    obj.put("bid",bid);
                } catch (JSONException e) {
                    e.printStackTrace();
                }

                try {
                    if(s.isOpen())
                        s.sendMessage(new TextMessage(obj.toString()));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            currentPlayer++;
            if(currentPlayer == nrPlayers) {
                state = CardGameState.PLAYCARD;
                currentPlayer = 0;
                winner = currentRound % nrPlayers;
            }
        } else if(state == CardGameState.PLAYCARD) {
            int playerTurn = (winner + currentPlayer) % nrPlayers;
            List<Integer> cards = playersCards.get(playerTurn);
            int card;
            if(currentPlayer == 0) {
                int aux = random.nextInt(cards.size());
                color = cards.get(aux) / 100;
                card = cards.get(aux);
                cardsColors[playerTurn][color - 1]--;
                played[playerTurn] = cards.get(aux);
                playersCards.get(playerTurn).remove(aux);
            } else {
                ArrayList<Integer> choose = new ArrayList<>();
                if (cardsColors[playerTurn][color - 1] != 0) {
                    for (int i : cards) {
                        if (i / 100 == color) {
                            choose.add(i);
                        }
                    }
                    card = choose.get(random.nextInt(choose.size()));
                } else if (cardsColors[playerTurn][color - 1] == 0 && atu != 0 && cardsColors[playerTurn][atu / 100 - 1] != 0) {
                    for (int i : cards) {
                        if (i / 100 == atu / 100) {
                            choose.add(i);
                        }
                    }
                    card = choose.get(random.nextInt(choose.size()));
                } else {
                    card = cards.get(random.nextInt(cards.size()));
                }
                played[playerTurn] = card;
                cardsColors[playerTurn][card / 100 - 1]--;
                playersCards.get(playerTurn).remove(Integer.valueOf(card));
            }
            JSONObject obj = new JSONObject();
            try {
                obj.put("code", Codes.PLAYING);
                obj.put("player", playerTurn);
                obj.put("card",card);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            for (WebSocketSession s : getSessions()) {
                //s.sendMessage(new TextMessage("player: " + currentPlayer + " played: " + data));
                try {
                    if(s.isOpen())
                        s.sendMessage(new TextMessage(obj.toString()));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            currentPlayer++;
            checkWinner();
            if(getState() == CardGameState.BID) {
                for(int i = 0; i < sessions.size() ; i++) {
                    obj = new JSONObject();
                    JSONArray array = new JSONArray();
                    for(int s : playersCards.get(i))
                        array.put(s);
                    try {
                        obj.put("code", Codes.ENDROUND);
                        obj.put("cards",array);
                        obj.put("atu",atu);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    //sessions.get(i).sendMessage(new TextMessage("Cards :" + cards.get(i) + " Atu: " + cardGame.getAtu()));
                    try {
                        if(sessions.get(i).isOpen())
                            sessions.get(i).sendMessage(new TextMessage(obj.toString()));
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }

                for(int j : getScore())
                    System.out.print(j + " ");
                System.out.println();
            } else if(state == CardGameState.GAMEOVER) {
                for(WebSocketSession s : sessions) {
                    obj = new JSONObject();
                    try {
                        obj.put("code", Codes.GAMEOVER);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    try {
                        s.sendMessage(new TextMessage(obj.toString()));
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                for(int j : getScore())
                    System.out.print(j + " ");
                System.out.println();
                timer.cancel();
            }
        }
    }
}

