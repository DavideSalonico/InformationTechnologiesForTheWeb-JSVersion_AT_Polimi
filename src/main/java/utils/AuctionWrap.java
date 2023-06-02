package utils;
import beans.Article;
import beans.Auction;
import beans.Offer;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class AuctionWrap {
    private LinkedHashMap<Auction, List<Article>> openAuctions;
    private LinkedHashMap<Auction, List<Article>> closedAuctions;
    private HashMap<Integer, Offer> maxOffers = new HashMap<>();


    public AuctionWrap(LinkedHashMap<Auction, List<Article>> openAuctions, LinkedHashMap<Auction, List<Article>> closedAuctions, HashMap<Integer, Offer> maxOffers) {
        this.openAuctions = openAuctions;
        this.closedAuctions = closedAuctions;
        this.maxOffers = maxOffers;
    }
}
