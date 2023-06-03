package controllers;

import DAO.ArticleDAO;
import DAO.OfferDAO;
import beans.Offer;
import beans.User;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import utils.AuctionFullInfo;
import utils.ConnectionHandler;
import utils.LocalDateTimeTypeAdapter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Serial;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@WebServlet("/WonOffers")
public class WonOffers extends HttpServlet {
	@Serial
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	ArticleDAO articleDAO;
	OfferDAO offerDAO;

	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
		articleDAO = new ArticleDAO(connection);
		offerDAO = new OfferDAO(connection);
	}

	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		User user;
		List<AuctionFullInfo> wonOffers = new ArrayList<>();

		try{
			user = (User) request.getSession().getAttribute("user");
		} catch (NullPointerException e){
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Error, user not logged in correctly!");
			return;
		}

		try{
			Map<Integer, Offer> winningOffers = offerDAO.getWinningOfferByUser(user.getUser_id());
			for(Integer auction : winningOffers.keySet()){
				wonOffers.add(new AuctionFullInfo(auction, articleDAO.getAuctionArticles(auction), winningOffers.get(auction)));
			}
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover the winning offers");
			return;
		}


		Gson gson = new GsonBuilder()
				.registerTypeAdapter(LocalDateTime.class, new LocalDateTimeTypeAdapter())
				.create();
		String json = gson.toJson(wonOffers);

		response.setStatus(HttpServletResponse.SC_OK);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);
	}


	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
}


