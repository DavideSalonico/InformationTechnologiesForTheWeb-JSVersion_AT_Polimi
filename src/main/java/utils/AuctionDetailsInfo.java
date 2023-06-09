package utils;

import beans.Article;
import beans.Auction;
import beans.Offer;
import beans.User;


import java.sql.SQLException;
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
    }

    public void addWinner(User winner) {
    	this.winner.setUser_id(0); //Not to show user_id to the client
        this.winner = winner;
    }

    public void addOfferWinner(List<Pair<Offer,String>> copy, User awardedUser) {
    	this.offers_username = new ArrayList<>(copy);
        for(Pair<Offer,String> pair : offers_username){
            pair.getFirst().setUser(0); //Not to show user_id to the client
        }
        if(!auction.isOpen()){
            addWinner(awardedUser);
        }
    }

    public void transformImages() throws SQLException {
        for(Article article : articles){
            article.setImageBytes(article.getImage().getBytes(1, (int) article.getImage().length()));
            article.setImage(null); //So that the image is not sent to the client (it would be duplicated unreadable data after JSON transformation)
        }
    }

}
