package utils;

import beans.Article;
import beans.Auction;
import beans.Offer;

import java.util.List;

public class AuctionFullInfo {
    Auction auction;
    List<Article> articles;
    Offer maxOffer;

    public AuctionFullInfo(Auction auction, List<Article> articles, Offer maxOffer) {
        this.auction = auction;
        this.articles = articles;
        this.maxOffer = maxOffer;
    }
}
