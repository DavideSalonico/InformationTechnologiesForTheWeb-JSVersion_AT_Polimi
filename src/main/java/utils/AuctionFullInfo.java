package utils;

import beans.Article;
import beans.Auction;
import beans.Offer;

import java.util.ArrayList;
import java.util.List;

public class AuctionFullInfo {
    Auction auction;
    List<Article> articles;
    Offer maxOffer;

    public AuctionFullInfo(Auction auction, List<Article> articles, Offer maxOffer) {
        this.auction = auction;
        this.articles = new ArrayList<>();
        for(Article article : articles) {
            article.setImage(null);
            this.articles.add(article);
        }
        this.maxOffer = maxOffer;
    }

    public void addArticle(Article article) {
    	article.setImage(null);
    	this.articles.add(article);
    }
}
