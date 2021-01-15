package com.example.demo.configuration;

import org.springframework.web.socket.WebSocketSession;

import java.util.ArrayList;
import java.util.List;

public class MatchMaking {
    private static MatchMaking matchMaking;
    private List<List<WebSocketSession>> list;

    private MatchMaking() {
        this.list = new ArrayList<>();
        for(int i = 0; i < 8; i++) {
            list.add(new ArrayList<>());
        }
    }

    public static MatchMaking getInstance() {
        if(matchMaking == null) {
            matchMaking = new MatchMaking();
        }
        return matchMaking;
    }

    public List<WebSocketSession> addSession(WebSocketSession session, int type) {
        int aux;

        if(type % 10 == 8) {
            aux = type / 10 + 1;
        } else {
            aux = type / 10 - 3;
        }
        if(list.get(aux).size() == type / 10) {
            list.set(aux, new ArrayList<>());
        }
        list.get(aux).add(session);
        if(list.get(aux).size() == type / 10) {
            for(int i = 0; i < list.get(aux).size(); i++) {
                if(!list.get(aux).get(i).isOpen()) {
                    list.get(aux).remove(i);
                    i--;
                }
            }
            if(list.get(aux).size() == type / 10)
                return new ArrayList<>(list.get(aux));
            else
                return null;
        } else {
            return null;
        }
    }

    public void removeSession(WebSocketSession session, int type) {
        int aux;
        if(type % 10 == 8) {
            aux = type / 10 + 1;
        } else {
            aux = type / 10 - 3;
        }
        list.get(aux).remove(session);
    }
}
