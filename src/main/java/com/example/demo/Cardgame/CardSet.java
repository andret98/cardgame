package com.example.demo.Cardgame;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class CardSet {
    private int id;
    private List<Integer> cards;

    public static final int STANDARD52PACKALLCARDSID = 0;
    public static final List<Integer> STANDARD52PACKALLCARDS = new ArrayList<>(Arrays.asList(
            Card.CLUBS_ACE,
            Card.CLUBS_KING,
            Card.CLUBS_QUEEN,
            Card.CLUBS_JACK,
            Card.CLUBS_10,
            Card.CLUBS_9,
            Card.CLUBS_8,
            Card.CLUBS_7,
            Card.CLUBS_6,
            Card.CLUBS_5,
            Card.CLUBS_4,
            Card.CLUBS_3,
            Card.CLUBS_2,
            Card.SPADES_ACE,
            Card.SPADES_KING,
            Card.SPADES_QUEEN,
            Card.SPADES_JACK,
            Card.SPADES_10,
            Card.SPADES_9,
            Card.SPADES_8,
            Card.SPADES_7,
            Card.SPADES_6,
            Card.SPADES_5,
            Card.SPADES_4,
            Card.SPADES_3,
            Card.SPADES_2,
            Card.HEARTS_ACE,
            Card.HEARTS_KING,
            Card.HEARTS_QUEEN,
            Card.HEARTS_JACK,
            Card.HEARTS_10,
            Card.HEARTS_9,
            Card.HEARTS_8,
            Card.HEARTS_7,
            Card.HEARTS_6,
            Card.HEARTS_5,
            Card.HEARTS_4,
            Card.HEARTS_3,
            Card.HEARTS_2,
            Card.DIAMONDS_ACE,
            Card.DIAMONDS_KING,
            Card.DIAMONDS_QUEEN,
            Card.DIAMONDS_JACK,
            Card.DIAMONDS_10,
            Card.DIAMONDS_9,
            Card.DIAMONDS_8,
            Card.DIAMONDS_7,
            Card.DIAMONDS_6,
            Card.DIAMONDS_5,
            Card.DIAMONDS_4,
            Card.DIAMONDS_3,
            Card.DIAMONDS_2
    ));

    public static final int STANDARD52PACKABOVE3ID = 6;
    public static final List<Integer> STANDARD52PACKABOVE3CARDS = new ArrayList<>(Arrays.asList(
            Card.CLUBS_ACE,
            Card.CLUBS_KING,
            Card.CLUBS_QUEEN,
            Card.CLUBS_JACK,
            Card.CLUBS_10,
            Card.CLUBS_9,
            Card.CLUBS_8,
            Card.CLUBS_7,
            Card.CLUBS_6,
            Card.CLUBS_5,
            Card.CLUBS_4,
            Card.CLUBS_3,
            Card.SPADES_ACE,
            Card.SPADES_KING,
            Card.SPADES_QUEEN,
            Card.SPADES_JACK,
            Card.SPADES_10,
            Card.SPADES_9,
            Card.SPADES_8,
            Card.SPADES_7,
            Card.SPADES_6,
            Card.SPADES_5,
            Card.SPADES_4,
            Card.SPADES_3,
            Card.HEARTS_ACE,
            Card.HEARTS_KING,
            Card.HEARTS_QUEEN,
            Card.HEARTS_JACK,
            Card.HEARTS_10,
            Card.HEARTS_9,
            Card.HEARTS_8,
            Card.HEARTS_7,
            Card.HEARTS_6,
            Card.HEARTS_5,
            Card.HEARTS_4,
            Card.HEARTS_3,
            Card.DIAMONDS_ACE,
            Card.DIAMONDS_KING,
            Card.DIAMONDS_QUEEN,
            Card.DIAMONDS_JACK,
            Card.DIAMONDS_10,
            Card.DIAMONDS_9,
            Card.DIAMONDS_8,
            Card.DIAMONDS_7,
            Card.DIAMONDS_6,
            Card.DIAMONDS_5,
            Card.DIAMONDS_4,
            Card.DIAMONDS_3
    ));

    public static final int STANDARD52PACKABOVE5ID = 5;
    public static final List<Integer> STANDARD52PACKABOVE5CARDS = new ArrayList<>(Arrays.asList(
            Card.CLUBS_ACE,
            Card.CLUBS_KING,
            Card.CLUBS_QUEEN,
            Card.CLUBS_JACK,
            Card.CLUBS_10,
            Card.CLUBS_9,
            Card.CLUBS_8,
            Card.CLUBS_7,
            Card.CLUBS_6,
            Card.CLUBS_5,
            Card.SPADES_ACE,
            Card.SPADES_KING,
            Card.SPADES_QUEEN,
            Card.SPADES_JACK,
            Card.SPADES_10,
            Card.SPADES_9,
            Card.SPADES_8,
            Card.SPADES_7,
            Card.SPADES_6,
            Card.SPADES_5,
            Card.HEARTS_ACE,
            Card.HEARTS_KING,
            Card.HEARTS_QUEEN,
            Card.HEARTS_JACK,
            Card.HEARTS_10,
            Card.HEARTS_9,
            Card.HEARTS_8,
            Card.HEARTS_7,
            Card.HEARTS_6,
            Card.HEARTS_5,
            Card.DIAMONDS_ACE,
            Card.DIAMONDS_KING,
            Card.DIAMONDS_QUEEN,
            Card.DIAMONDS_JACK,
            Card.DIAMONDS_10,
            Card.DIAMONDS_9,
            Card.DIAMONDS_8,
            Card.DIAMONDS_7,
            Card.DIAMONDS_6,
            Card.DIAMONDS_5
    ));

    public static final int STANDARD52PACKABOVE7ID = 4;
    public static final List<Integer> STANDARD52PACKABOVE7CARDS = new ArrayList<>(Arrays.asList(
            Card.CLUBS_ACE,
            Card.CLUBS_KING,
            Card.CLUBS_QUEEN,
            Card.CLUBS_JACK,
            Card.CLUBS_10,
            Card.CLUBS_9,
            Card.CLUBS_8,
            Card.CLUBS_7,
            Card.SPADES_ACE,
            Card.SPADES_KING,
            Card.SPADES_QUEEN,
            Card.SPADES_JACK,
            Card.SPADES_10,
            Card.SPADES_9,
            Card.SPADES_8,
            Card.SPADES_7,
            Card.HEARTS_ACE,
            Card.HEARTS_KING,
            Card.HEARTS_QUEEN,
            Card.HEARTS_JACK,
            Card.HEARTS_10,
            Card.HEARTS_9,
            Card.HEARTS_8,
            Card.HEARTS_7,
            Card.DIAMONDS_ACE,
            Card.DIAMONDS_KING,
            Card.DIAMONDS_QUEEN,
            Card.DIAMONDS_JACK,
            Card.DIAMONDS_10,
            Card.DIAMONDS_9,
            Card.DIAMONDS_8,
            Card.DIAMONDS_7
    ));


    public static final int STANDARD52PACKABOVE9ID = 3;
    public static final List<Integer> STANDARD52PACKABOVE9CARDS = new ArrayList<>(Arrays.asList(
            Card.CLUBS_ACE,
            Card.CLUBS_KING,
            Card.CLUBS_QUEEN,
            Card.CLUBS_JACK,
            Card.CLUBS_10,
            Card.CLUBS_9,
            Card.SPADES_ACE,
            Card.SPADES_KING,
            Card.SPADES_QUEEN,
            Card.SPADES_JACK,
            Card.SPADES_10,
            Card.SPADES_9,
            Card.HEARTS_ACE,
            Card.HEARTS_KING,
            Card.HEARTS_QUEEN,
            Card.HEARTS_JACK,
            Card.HEARTS_10,
            Card.HEARTS_9,
            Card.DIAMONDS_ACE,
            Card.DIAMONDS_KING,
            Card.DIAMONDS_QUEEN,
            Card.DIAMONDS_JACK,
            Card.DIAMONDS_10,
            Card.DIAMONDS_9
    ));

    public CardSet() {
    }

    public static List<Integer> getCardSet(int cardSetId){
        List<Integer> cards = new ArrayList<>();
        if(cardSetId == STANDARD52PACKABOVE9ID){
            cards.addAll(STANDARD52PACKABOVE9CARDS);
        } else if(cardSetId == STANDARD52PACKABOVE7ID){
            cards.addAll(STANDARD52PACKABOVE7CARDS);
        } else if(cardSetId == STANDARD52PACKABOVE5ID){
            cards.addAll(STANDARD52PACKABOVE5CARDS);
        } else if(cardSetId == STANDARD52PACKABOVE3ID){
            cards.addAll(STANDARD52PACKABOVE3CARDS);
        }
        Collections.shuffle(cards);
        return cards;
    }

}

