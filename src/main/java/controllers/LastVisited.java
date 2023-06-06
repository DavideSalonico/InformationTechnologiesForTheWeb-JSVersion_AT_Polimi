package controllers;

import DAO.AuctionDAO;
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
        List<AuctionFullInfo> finalAuctionsInfo = new ArrayList<>();
        List<Integer> auctions = new ArrayList<>();

        String paramValue = request.getParameter("lVA");

        if (paramValue != null) {
            String[] values = paramValue.split(",");

            for (String value : values) {
                try {
                    int intValue = Integer.parseInt(value.trim());
                    auctions.add(intValue);
                } catch (NumberFormatException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().println("Incorrect format for the parameter");
                }
            }
        } else{
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("No auctions visited selected to add to the auction");
            return;
        }


        try {
            for(Integer id : auctions){
                AuctionFullInfo auctionFullInfo = auctionDAO.getAuctionFullInfo(id);
                // CHECK : if the auction is open, it is added to the list so the user can see only the open auctions visited
                if(auctionFullInfo.getAuction().isOpen())
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
