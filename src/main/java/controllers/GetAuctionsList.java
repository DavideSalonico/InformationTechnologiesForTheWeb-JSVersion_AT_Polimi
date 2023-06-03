package controllers;

import DAO.AuctionDAO;
import DAO.OfferDAO;
import beans.Article;
import beans.Auction;
import beans.User;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import utils.AuctionFullInfo;
import utils.ConnectionHandler;
import utils.LocalDateTimeTypeAdapter;

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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

@WebServlet("/GetAuctionsList")
public class GetAuctionsList extends HttpServlet {
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
		List<AuctionFullInfo> finalUserAuctions = new ArrayList<>();
		LinkedHashMap<Auction,List<Article>> userAuctions;

		try {
			finalUserAuctions = auctionDAO.getAuctionsByUser(user.getUser_id());
		}catch(SQLException e){
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover articles in database");
			return;
		}

		Gson gson = new GsonBuilder()
				.registerTypeAdapter(LocalDateTime.class, new LocalDateTimeTypeAdapter())
				.create();
		String json = gson.toJson(finalUserAuctions);

		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().println(json);

		response.setStatus(HttpServletResponse.SC_OK);
    }
}
