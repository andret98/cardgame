package com.example.demo.configuration;

import com.example.demo.Cardgame.Card;
import com.example.demo.Cardgame.CardGame;
import com.example.demo.Cardgame.CardGameState;
import com.google.gson.Gson;
import com.mongodb.BasicDBObject;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private AtomicInteger roomId = new AtomicInteger(0);
    private Map<Integer, CardGame> rooms = new HashMap<>();
    private List<Lobby> lobbies = new ArrayList<>();
    private MongoClient mongoClient = MongoClients.create(MongoClientSettings.builder().
            applyConnectionString(new ConnectionString("mongodb://127.0.0.1:27017"))
            .retryWrites(true).build());
    private MongoDatabase database = mongoClient.getDatabase("cardGame");

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new MesajHandler(), "/game");
    }
    class MesajHandler extends TextWebSocketHandler {
        private List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
        private AtomicInteger guest = new AtomicInteger(1);
        @Override
        public void afterConnectionEstablished(WebSocketSession session) throws Exception {
            JSONObject obj = new JSONObject();
            obj.put("code", Codes.BEFOREGAME);
            obj.put("data", guest.getAndAdd(1));
            session.sendMessage(new TextMessage(obj.toString()));
            super.afterConnectionEstablished(session);
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
            BasicDBObject query = new BasicDBObject();
            query.put("session", session.getId());
            BasicDBObject newDocument = new BasicDBObject();
            newDocument.put("status",2);
            BasicDBObject updateObject = new BasicDBObject();
            updateObject.put("$set", newDocument);
            database.getCollection("Users").updateOne(query, updateObject);
            super.afterConnectionClosed(session, status);
        }

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
            //parse message
            //create room
            System.out.println(message.getPayload());
            Gson gson = new Gson();
            Mesaj mesaj;
            try {
                mesaj = gson.fromJson(message.getPayload(), Mesaj.class);
            } catch (Exception e) {
                System.out.println("Mesaj invalid");
                return;
            }
            int data = mesaj.getData();
            int room = mesaj.getRoom();

            if(mesaj.getCode() == Codes.FINDGAME) {
                MatchMaking matchMaking = MatchMaking.getInstance();
                List<WebSocketSession> gameSessions = matchMaking.addSession(session, data);
                if(gameSessions != null) {
                    create(gameSessions, data, mesaj.getCode(), roomId.getAndAdd(1));
                }
            } else if(mesaj.getCode() == Codes.BIDDING && rooms.get(room).getState() == CardGameState.BID && rooms.get(room).containsSession(session)) {
                CardGame cardGame = rooms.get(room);
                if(cardGame != null) {
                    cardGame.cancelTimer();
                    int currentPlayer = cardGame.getCurrentPlayerBid();
                    if(cardGame.bid(data, session))
                        for(WebSocketSession s : cardGame.getSessions()) {
                            JSONObject obj = new JSONObject();
                            obj.put("code", mesaj.getCode());
                            obj.put("player",currentPlayer);
                            obj.put("bid",data);
                            if(s.isOpen())
                                s.sendMessage(new TextMessage(obj.toString()));
                        }
                    cardGame.startTimer();
                } else {
                    System.out.println("invalidBid");
                }
            } else if(mesaj.getCode() == Codes.PLAYING && rooms.get(room).getState() == CardGameState.PLAYCARD && rooms.get(room).containsSession(session)) {
                CardGame cardGame = rooms.get(room);
                if(cardGame != null) {
                    playCard(cardGame, mesaj.getData(), session, mesaj.getRoom());
                } else {
                    System.out.println("invalidPlay");
                }
            }else if(mesaj.getCode() == Codes.CANCELFIND) {
                MatchMaking matchMaking = MatchMaking.getInstance();
                matchMaking.removeSession(session, data);
            }else if(mesaj.getCode() == Codes.CHAT && rooms.get(room).containsSession(session) && mesaj.getMsg().length() > 0) {
                CardGame cardGame = rooms.get(room);
                JSONObject obj = new JSONObject();
                obj.put("code", Codes.CHAT);
                obj.put("player", cardGame.getUsernames()[(cardGame.getSessions().indexOf(session))]);
                obj.put("message", mesaj.getMsg());
                for (WebSocketSession s : cardGame.getSessions()) {
                    if (s.isOpen())
                        s.sendMessage(new TextMessage(obj.toString()));
                }
            }else if(mesaj.getCode() == Codes.USERNAMES && rooms.get(room).containsSession(session) && mesaj.getMsg().length() > 0){
                CardGame cardGame = rooms.get(room);
                if(cardGame.addUsername(session, mesaj.getMsg())) {
                    JSONObject obj = new JSONObject();
                    obj.put("code", Codes.USERNAMES);
                    JSONArray array = new JSONArray();
                    for(String user : cardGame.getUsernames())
                        array.put(user);
                    obj.put("users", array);

                    for(WebSocketSession s : cardGame.getSessions()) {
                        s.sendMessage(new TextMessage(obj.toString()));
                    }
                }
            }else if(mesaj.getCode() == Codes.SIGNUP && mesaj.getMsg().length() > 0) {
                signUp(mesaj, session);
            } else if(mesaj.getCode() == Codes.LOGIN && mesaj.getMsg().length() > 0) {
                login(mesaj, session);
            } else if(mesaj.getCode() == Codes.CREATELOBBY) {
                Lobby lobby = new Lobby(roomId.getAndAdd(1), mesaj.getData(), session, mesaj.getMsg());
                lobbies.add(lobby);
                JSONObject obj = new JSONObject();
                obj.put("code", Codes.CREATELOBBY);
                obj.put("data", lobby.getRoom());
                session.sendMessage(new TextMessage(obj.toString()));
            } else if(mesaj.getCode() == Codes.GETLOBBIES) {
                String result = "";
                JSONObject obj = new JSONObject();
                obj.put("code", Codes.GETLOBBIES);
                for(Lobby lobby : lobbies)
                    result += lobby.toString() + " ";
                obj.put("data", result);
                session.sendMessage(new TextMessage(obj.toString()));
            } else if(mesaj.getCode() == Codes.JOINLOBBY) {
                for(Lobby lobby : lobbies) {
                    if(lobby.getRoom() == mesaj.getData() && !lobby.isFull()) {
                        lobby.addSession(session);
                        lobby.addUsername(mesaj.getMsg());
                        JSONObject obj = new JSONObject();
                        obj.put("code", mesaj.getCode());
                        JSONArray array = new JSONArray(lobby.getUsernames());
                        obj.put("data", array);
                        for(WebSocketSession s : lobby.getPlayers()){
                            s.sendMessage(new TextMessage(obj.toString()));
                        }
                    }
                }
            } else if(mesaj.getCode() == Codes.STARTLOBBY) {
                for(int i = 0; i< lobbies.size(); i++) {
                    if(lobbies.get(i).getLeader().getId().equals(session.getId()) && lobbies.get(i).isFull()) {
                        create(lobbies.get(i).getPlayers(),lobbies.get(i).getData(), Codes.FINDGAME, lobbies.get(i).getRoom());
                        lobbies.remove(i);
                        break;
                    }
                }
            } else if(mesaj.getCode() == Codes.LEAVELOBBY) {
                for(int i = 0; i< lobbies.size(); i++) {
                    if(lobbies.get(i).getRoom() == mesaj.getData()) {
                        JSONObject obj = new JSONObject();
                        obj.put("code", mesaj.getCode());
                        if(lobbies.get(i).getLeader().getId().equals(session.getId())) {
                            for(WebSocketSession s : lobbies.get(i).getPlayers()) {
                                s.sendMessage(new TextMessage(obj.toString()));
                            }
                            lobbies.remove(i);
                            break;
                        }
                        lobbies.get(i).removeSession(session);
                        obj.put("data", new JSONArray(lobbies.get(i).getUsernames()));
                        for(WebSocketSession s : lobbies.get(i).getPlayers()) {
                            s.sendMessage(new TextMessage(obj.toString()));
                        }
                        break;
                    }
                }
            }
        }

        private void reconnect(int room, String oldSession, WebSocketSession newSession) {
            CardGame cardGame = rooms.get(room);
            if(cardGame != null) {
                JSONObject obj = cardGame.reconnect(oldSession, newSession);
                if(obj == null) {
                    return;
                }
                try {
                    obj.put("room",room);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                try {
                    newSession.sendMessage(new TextMessage(obj.toString()));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        private void create(List<WebSocketSession> gameSessions, int data, int code, int room) throws JSONException, IOException {
            CardGame cardGame = new CardGame(data / 10, data % 10 , gameSessions);
            int auxRoom = room;
            for(WebSocketSession s : gameSessions) {
                BasicDBObject query = new BasicDBObject();
                query.put("session", s.getId());
                BasicDBObject newDocument = new BasicDBObject();
                newDocument.put("room", auxRoom);
                newDocument.put("status",1);
                BasicDBObject updateObject = new BasicDBObject();
                updateObject.put("$set", newDocument);
                database.getCollection("Users").updateOne(query, updateObject);
            }
            rooms.put(auxRoom, cardGame);
            List<List<Integer>> cards = cardGame.getPlayersCards();
            for(int i = 0; i < gameSessions.size() ; i++) {
                JSONObject obj = new JSONObject();
                JSONArray array = new JSONArray();
                for(int s : cards.get(i))
                    array.put(s);
                obj.put("code", code);
                obj.put("cards",array);
                obj.put("atu",cardGame.getAtu());
                obj.put("player",i);
                obj.put("room",auxRoom);
                if(gameSessions.get(i).isOpen())
                    gameSessions.get(i).sendMessage(new TextMessage(obj.toString()));
            }
            Document query = new Document();
            query.append("room", auxRoom);
            SimpleDateFormat formatter= new SimpleDateFormat("yyyy-MM-dd 'at' HH:mm:ss z");
            Date date = new Date(System.currentTimeMillis());
            query.append("time", formatter.format(date));
            database.getCollection("Logs").insertOne(query);
            cardGame.startTimer();
        }

        private void playCard(CardGame cardGame, int data, WebSocketSession session, int room) throws JSONException, IOException, InterruptedException {
            cardGame.cancelTimer();
            int currentPlayer = cardGame.getCurrentPlayerPlay();
            if (cardGame.play(data, session)) {
                JSONObject obj = new JSONObject();
                obj.put("code", Codes.PLAYING);
                obj.put("player", currentPlayer);
                obj.put("card", data);
                for (WebSocketSession s : cardGame.getSessions()) {
                    //s.sendMessage(new TextMessage("player: " + currentPlayer + " played: " + data));
                    if(s.isOpen())
                        s.sendMessage(new TextMessage(obj.toString()));
                }
                if( cardGame.getCurrentPlayer() == 0 && cardGame.getState() != CardGameState.BID) {
                    TimeUnit.SECONDS.sleep(2);
                    cardGame.startTimer();
                } else {
                    cardGame.startTimer();
                }
                if (cardGame.getState() == CardGameState.BID) {
                    TimeUnit.SECONDS.sleep(2);
                    cardGame.cancelTimer();
                    List<WebSocketSession> sessions = rooms.get(room).getSessions();
                    List<List<Integer>> cards = rooms.get(room).getPlayersCards();
                    for (int i = 0; i < sessions.size(); i++) {
                        obj = new JSONObject();
                        JSONArray array = new JSONArray();
                        for (int s : cards.get(i))
                            array.put(s);
                        obj.put("code", Codes.ENDROUND);
                        obj.put("cards", array);
                        obj.put("atu", cardGame.getAtu());
                        //sessions.get(i).sendMessage(new TextMessage("Cards :" + cards.get(i) + " Atu: " + cardGame.getAtu()));
                        if(sessions.get(i).isOpen())
                            sessions.get(i).sendMessage(new TextMessage(obj.toString()));
                    }
                    for (int j : cardGame.getScore())
                        System.out.print(j + " ");
                    System.out.println();
                    cardGame.startTimer();
                }
                if (cardGame.getState() == CardGameState.GAMEOVER) {
                    cardGame.cancelTimer();
                    List<WebSocketSession> sessions = rooms.get(room).getSessions();
                    for (int i = 0; i < sessions.size(); i++) {
                        obj = new JSONObject();
                        obj.put("code", Codes.GAMEOVER);
                        //sessions.get(i).sendMessage(new TextMessage("Cards :" + cards.get(i) + " Atu: " + cardGame.getAtu()));
                        if(sessions.get(i).isOpen())
                            sessions.get(i).sendMessage(new TextMessage(obj.toString()));
                    }
                    database.getCollection("Users").updateMany(new Document("room", room), new Document("$set", new Document("status", 0)));
                    rooms.remove(room);
                    System.out.println(rooms.size());
                    for (int j : cardGame.getScore())
                        System.out.print(j + " ");
                    System.out.println();
                }
            }
        }

        private void signUp(Mesaj mesaj, WebSocketSession session) throws JSONException, IOException {
            String[] s = mesaj.getMsg().split("\\s+");
            if(s.length!= 2) {
                System.out.println("Invalid request");
                return;
            }
            MongoCollection<Document> users = database.getCollection("Users");
            Document user = new Document("_id", new ObjectId());
            user.append("username",s[0].toLowerCase()).append("password",s[1]).append("session",null).append("room",null).append("status",0);
            BasicDBObject query = new BasicDBObject();
            query.put("username", s[0]);
            if(users.find(query).into(new ArrayList()).size() == 0) {
                database.getCollection("Users").insertOne(user);
                JSONObject obj = new JSONObject();
                obj.put("code", Codes.SIGNUP);
                obj.put("data", "");
                session.sendMessage(new TextMessage(obj.toString()));
            } else {
                JSONObject obj = new JSONObject();
                obj.put("code", Codes.SIGNUP);
                obj.put("data", "Username is taken");
                session.sendMessage(new TextMessage(obj.toString()));
            }
        }

        private void login(Mesaj mesaj, WebSocketSession session) throws JSONException, IOException {
            String[] s = mesaj.getMsg().split("\\s+");
            if(s.length!= 2) {
                System.out.println("Invalid request");
                return;
            }
            MongoCollection<Document> users = database.getCollection("Users");
            BasicDBObject query = new BasicDBObject();
            query.put("username", s[0].toLowerCase());
            query.put("password", s[1]);
            ArrayList<Document> list = new ArrayList();
            if(users.find(query).into(list).size() == 0) {
                JSONObject obj = new JSONObject();
                obj.put("code", Codes.LOGIN);
                obj.put("data", "Pass/Username invalid");
                session.sendMessage(new TextMessage(obj.toString()));
            } else {
                int status = 0;
                query = new BasicDBObject();
                query.put("username", s[0]);
                if(list.get(0).get("status").equals(2)) {
                    reconnect((int) list.get(0).get("room"), (String) list.get(0).get("session"), session);
                    status = 1;
                } else if(list.get(0).get("status").equals(1)) {
                    return;
                }
                BasicDBObject newDocument = new BasicDBObject();
                newDocument.put("session", session.getId());
                newDocument.put("status", status);
                SimpleDateFormat formatter= new SimpleDateFormat("yyyy-MM-dd 'at' HH:mm:ss z");
                Date date = new Date(System.currentTimeMillis());
                newDocument.put("time", formatter.format(date));
                BasicDBObject updateObject = new BasicDBObject();
                updateObject.put("$set", newDocument);
                database.getCollection("Users").updateOne(query, updateObject);
                JSONObject obj = new JSONObject();
                obj.put("code", Codes.LOGIN);
                obj.put("data", s[0]);
                session.sendMessage(new TextMessage(obj.toString()));
            }
        }
    }

}
