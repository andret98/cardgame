package com.example.demo.configuration;

public class Mesaj {
    private int code;
    private int data;
    private int room;
    private String msg;

    public Mesaj(int code, int data, int room, String msg) {
        this.code = code;
        this.data = data;
        this.room = room;
        this.msg = msg;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public int getData() {
        return data;
    }

    public int getRoom() {
        return room;
    }

    public void setRoom(int room) {
        this.room = room;
    }

    public void setData(int data) {
        this.data = data;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }
}
