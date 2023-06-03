package utils;

import beans.Article;
import beans.Auction;
import beans.Offer;
import beans.User;


import java.util.ArrayList;
import java.util.List;

public class AuctionDetailsInfo {
    private Auction auction;
    private List<Article> articles;
    private List<Pair<Offer, String>> offers_username;
    private User winner;

    public AuctionDetailsInfo(Auction auction, List<Article> articles, List <Pair<Offer,String>> offers_username, User winner) {
        this.auction = auction;
        this.articles = new ArrayList<>(articles);
        this.offers_username = new ArrayList<>(offers_username);
        this.winner = winner;
    }

    public void addWinner(User winner) {
    	this.winner = winner;
    }

    public void addOfferWinner(List<Pair<Offer,String>> copy, User awardedUser) {
    	this.offers_username = new ArrayList<>(copy);
        if(!auction.isOpen()){
            addWinner(awardedUser);
        }
    }

}
