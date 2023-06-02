package controllers;

import DAO.ArticleDAO;
import DAO.AuctionDAO;
import beans.Article;
import beans.Auction;
import com.google.gson.Gson;
import utils.ConnectionHandler;

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
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;

@WebServlet("/Search")
public class Search extends HttpServlet {
	@Serial
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	AuctionDAO auctionDAO;
	ArticleDAO articleDAO;

	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
		auctionDAO = new AuctionDAO(connection);
		articleDAO = new ArticleDAO(connection);
	}

	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		LocalDateTime currLdt = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
		LinkedHashMap<Auction,List<Article>> orderedFilteredMap= new LinkedHashMap<>();

		try{
			request.getSession().getAttribute("user");
		} catch (NullPointerException e){
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Error, user not logged in correctly!");
			return;
		}


		String key = request.getParameter("key");
		if (key != null){
			if(!validateKey(key)){
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Not valid key!, key must contain only letters and be longer than 2 characters, but less than 63");
				return;
			}
			try {
				orderedFilteredMap = auctionDAO.getFiltered(key, currLdt);
			} catch (SQLException e) {
				response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				response.getWriter().println("Error accessing the database!");
				return;
			}
		}


		String json = new Gson().toJson(orderedFilteredMap);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);
	}

	private boolean validateKey(String key){
    	// Checks if the key contains only letters and is longer than 2 characters, but less than 63
		return key.matches("[a-zA-Z]+") && key.length() > 2 && key.length() < 63;
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
}


