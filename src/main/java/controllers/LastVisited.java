package controllers;

import DAO.AuctionDAO;
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
import java.util.List;

@WebServlet("/LastVisited")
public class LastVisited extends HttpServlet {
    @Serial
    private static final long serialVersionUID = 1L;
    private Connection connection = null;
    private AuctionDAO auctionDAO;

    public void init() throws ServletException {
        ServletContext servletContext = getServletContext();
        connection = ConnectionHandler.getConnection(servletContext);
        auctionDAO = new AuctionDAO(connection);
    }

    public void destroy() {
        try {
            ConnectionHandler.closeConnection(connection);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        User user = (User) request.getSession().getAttribute("user");
        List<AuctionFullInfo> finalAuctionsInfo = new ArrayList<>();
        List<Integer> auctions = new ArrayList<>();

        String [] stringheAppoggio = request.getParameterValues("lVA");

        if( stringheAppoggio == null ) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("No auctions visited selected to add to the auction");
            return;
        }

        for (String s : stringheAppoggio) {
            auctions.add(Integer.parseInt(s));
        }

        try {
            for(Integer id : auctions){
                finalAuctionsInfo.add(auctionDAO.getAuctionFullInfo(id));
            }
        }catch(SQLException e){
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Not possible to recover auctions visited in database");
            return;
        }

        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeTypeAdapter())
                .create();
        String json = gson.toJson(finalAuctionsInfo);

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().println(json);
    }

}
