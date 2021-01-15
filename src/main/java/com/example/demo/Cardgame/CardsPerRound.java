package com.example.demo.Cardgame;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CardsPerRound {

    //ROUND + {nr players} + PLAYERS + 1/8
    public static final int ROUNDS6PLAYERS1ID = 16;
    public static final List<Integer> ROUNDS6PLAYERS1 = new ArrayList<>(Arrays.asList(
            1,1,1,1,1,1,2,3,4,5,6,7,8,8,8,8,8,8,7,6,5,4,3,2,1,1,1,1,1,1
    ));
    public static final int ROUNDS5PLAYERS1ID = 15;
    public static final List<Integer> ROUNDS5PLAYERS1 = new ArrayList<>(Arrays.asList(
            1,1,1,1,1,2,3,4,5,6,7,8,8,8,8,8,7,6,5,4,3,2,1,1,1,1,1
    ));
    public static final int ROUNDS4PLAYERS1ID = 14;
    public static final List<Integer> ROUNDS4PLAYERS1 = new ArrayList<>(Arrays.asList(
            1,1,1,1,2,3,4,5,6,7,8,8,8,8,7,6,5,4,3,2,1,1,1,1
    ));
    public static final int ROUNDS3PLAYERS1ID = 13;
    public static final List<Integer> ROUNDS3PLAYERS1 = new ArrayList<>(Arrays.asList(
            1,1,1,2,3,4,5,6,7,8,8,8,7,6,5,4,3,2,1,1,1
    ));
    public static final int ROUNDS6PLAYERS8ID = 86;
    public static final List<Integer> ROUNDS6PLAYERS8 = new ArrayList<>(Arrays.asList(
            8,8,8,8,8,8,7,6,5,4,3,2,1,1,1,1,1,1,2,3,4,5,6,7,8,8,8,8,8,8
    ));
    public static final int ROUNDS5PLAYERS8ID = 85;
    public static final List<Integer> ROUNDS5PLAYERS8 = new ArrayList<>(Arrays.asList(
            8,8,8,8,8,7,6,5,4,3,2,1,1,1,1,1,2,3,4,5,6,7,8,8,8,8,8
    ));
    public static final int ROUNDS4PLAYERS8ID = 84;
    public static final List<Integer> ROUNDS4PLAYERS8 = new ArrayList<>(Arrays.asList(
            8,8,8,8,7,6,5,4,3,2,1,1,1,1,2,3,4,5,6,7,8,8,8,8
    ));
    public static final int ROUNDS3PLAYERS8ID = 83;
    public static final List<Integer> ROUNDS3PLAYERS8 = new ArrayList<>(Arrays.asList(
            8,8,8,7,6,5,4,3,2,1,1,1,2,3,4,5,6,7,8,8,8
    ));

    public CardsPerRound() {
    }

    public static List<Integer> getCardsPerRound(int cardSetId){
        List<Integer> rounds = new ArrayList<>();
        if(cardSetId == ROUNDS6PLAYERS1ID){
            rounds.addAll(ROUNDS6PLAYERS1);
        } else if(cardSetId == ROUNDS5PLAYERS1ID){
            rounds.addAll(ROUNDS5PLAYERS1);
        } else if(cardSetId == ROUNDS4PLAYERS1ID){
            rounds.addAll(ROUNDS4PLAYERS1);
        } else if(cardSetId == ROUNDS3PLAYERS1ID){
            rounds.addAll(ROUNDS3PLAYERS1);
        } else if(cardSetId == ROUNDS6PLAYERS8ID) {
            rounds.addAll(ROUNDS6PLAYERS8);
        } else if(cardSetId == ROUNDS5PLAYERS8ID) {
            rounds.addAll(ROUNDS5PLAYERS8);
        } else if(cardSetId == ROUNDS4PLAYERS8ID) {
            rounds.addAll(ROUNDS4PLAYERS8);
        } else if(cardSetId == ROUNDS3PLAYERS8ID) {
            rounds.addAll(ROUNDS3PLAYERS8);
        }
        return rounds;
    }
}

