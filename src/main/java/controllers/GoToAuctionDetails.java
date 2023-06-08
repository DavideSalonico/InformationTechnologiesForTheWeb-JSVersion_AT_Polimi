package controllers;

import DAO.AuctionDAO;
import DAO.OfferDAO;
import DAO.UserDAO;
import beans.Offer;
import beans.User;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import utils.AuctionDetailsInfo;
import utils.ConnectionHandler;
import utils.LocalDateTimeTypeAdapter;
import utils.Pair;

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
import java.time.LocalDateTime;
import java.util.List;

@WebServlet("/GoToAuctionDetails")
public class GoToAuctionDetails extends HttpServlet {
	@Serial
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	private OfferDAO offerDAO;
	private AuctionDAO auctionDAO;
	private UserDAO userDAO;
	
	public void init() throws ServletException {
		ServletContext servletContext = getServletContext();
		connection = ConnectionHandler.getConnection(servletContext);

		offerDAO = new OfferDAO(connection);
		auctionDAO = new AuctionDAO(connection);
		userDAO = new UserDAO(connection);
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws IOException {

		int auctionId;
		AuctionDetailsInfo auctionDetailsInfo;
		List<Pair<Offer, String>> auctionOffers;
		User awardedUser;

		try{
			auctionId = Integer.parseInt(request.getParameter("auctionId"));
		} catch(NumberFormatException e){
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("auctionId must be an integer value");
			return;
		}


		try {
			auctionDetailsInfo = auctionDAO.getAuctionDetails(auctionId);
			if (auctionDetailsInfo == null) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("auctionId is not valid");
				return;
			}
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Unable to access the database");
			return;
		}

		try {
			// WINNING OFFERS IS AT TOP, IF EXISTS
			auctionOffers = offerDAO.getOffers(auctionId);

			if(!auctionOffers.isEmpty()){
				awardedUser = userDAO.getUser(auctionOffers.get(0).getFirst().getUser());
				if(awardedUser != null){
					// Removes the password from the object for security purposes
					awardedUser.setPassword("");
					awardedUser.setUser_id(0);
				}
				auctionDetailsInfo.addOfferWinner(auctionOffers,awardedUser);
			}

			auctionDetailsInfo.transformImages(); //This method is used to transform the images from byte[] to base64

		}catch(SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Error accessing the database!");
			return;
		}

		Gson gson = new GsonBuilder()
				.registerTypeAdapter(LocalDateTime.class, new LocalDateTimeTypeAdapter())
				.create();
		String json = gson.toJson(auctionDetailsInfo);

		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.setStatus(HttpServletResponse.SC_OK);
		response.getWriter().println(json);
	}
	

	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

}
