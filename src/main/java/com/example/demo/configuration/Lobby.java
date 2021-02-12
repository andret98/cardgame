package com.example.demo.configuration;

import org.springframework.web.socket.WebSocketSession;

import java.util.ArrayList;
import java.util.List;

public class Lobby {
    private int room;
    private int data;
    private List<WebSocketSession> players;
    private WebSocketSession leader;
    private List<String> usernames;

    public Lobby(int room, int data, WebSocketSession leader, String usename) {
        this.room = room;
        this.data = data;
        this.leader = leader;
        players = new ArrayList<>();
        usernames = new ArrayList<>();
        players.add(leader);
        usernames.add(usename);
    }

    @Override
    public String toString() {
        return "" + room + " " + data % 10 + " " + data / 10;
    }

    public void addSession(WebSocketSession session) {
        players.add(session);
    }

    public void removeSession(WebSocketSession session) {
        int index = -1;
        for(int i = 0; i<players.size(); i++) {
            if(players.get(i).getId() == session.getId()) {
                index = i;
                break;
            }
        }
        players.remove(index);
        usernames.remove(index);
    }

    public int getRoom() {
        return room;
    }

    public int getData() {
        return data;
    }

    public boolean isFull(){
        return players.size() == data / 10;
    }
    public void addUsername(String username){
        usernames.add(username);
    }

    public void removeUsername(String username){
        usernames.add(username);
    }

    public List<String> getUsernames() {
        return usernames;
    }

    public List<WebSocketSession> getPlayers() {
        return players;
    }

    public WebSocketSession getLeader() {
        return leader;
    }
}
