package controllers;

import DAO.AuctionDAO;
import DAO.OfferDAO;
import beans.Article;
import beans.Auction;
import beans.Offer;
import beans.User;
import utils.ConnectionHandler;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Serial;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

@WebServlet("/GoToSell")
public class GoToSell extends HttpServlet {
	@Serial
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private AuctionDAO auctionDAO;
	private OfferDAO offerDAO;

	public void init() throws ServletException {
		ServletContext servletContext = getServletContext();

		connection = ConnectionHandler.getConnection(servletContext);
		
		auctionDAO = new AuctionDAO(connection);
		offerDAO = new OfferDAO(connection);
	}
	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException
    {
		User user = (User) request.getSession().getAttribute("user");

		Offer maxOffer;

		LinkedHashMap<Auction,List<Article>> userAuctions;
		LinkedHashMap<Auction,List<Article>> userOpenAuctions = new LinkedHashMap<>();
    	LinkedHashMap<Auction, List<Article>> userClosedAuctions = new LinkedHashMap<>();
    	HashMap<Integer, Offer> maxOffers = new HashMap<>();
/*
		try {

			//userAuctions = auctionDAO.getAuctionsByUser(user.getUser_id());

			for (Auction auction : userAuctions.keySet() ) {

				if(auction.isOpen()){
					userOpenAuctions.put(auction, userAuctions.get(auction));
				}else {
					userClosedAuctions.put(auction, userAuctions.get(auction));
				}

				maxOffer = offerDAO.getWinningOffer(auction.getAuction_id());

				if(maxOffer != null)
					maxOffers.put(auction.getAuction_id(), maxOffer);
			}

		}catch(SQLException e){
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Not possible to recover articles in database");
			return;
		}

 */

		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
    }
}
