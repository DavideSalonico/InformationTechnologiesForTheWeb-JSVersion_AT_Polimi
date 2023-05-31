package controllers;

import DAO.UserDAO;
import beans.User;
import utils.ConnectionHandler;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Serial;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;


@WebServlet("/CheckLogin")
@MultipartConfig
public class CheckLogin extends HttpServlet {
	@Serial
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	private UserDAO userDao;
    
    public CheckLogin() {
        super();
    }


	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
		
		userDao = new UserDAO(connection);  // Initialize the connection only once, not every doPost()
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		// obtain and escape params                                                                                
		String usrn;
		String pwd;
		                                                                                                           
		try {        
			usrn = request.getParameter("username");
			pwd = request.getParameter("pwd");
			                                                                                                       
			if (usrn == null || pwd == null || usrn.isEmpty() || pwd.isEmpty()) {                                  
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Missing credential value. Username or password are null or empty");
				return;
			}
			if (usrn.length() < 3 || usrn.length() > 20 || pwd.length() < 3 || pwd.length() > 20) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Username or password length is not valid");
				return;
			}
		} catch (IOException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Wrong format for password and username");
			return;
		}

		User user;
		try {                                                                                                      
			user = userDao.checkCredentials(usrn, pwd);                                                            
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not Possible to check credentials");
			return;                                                                                                
		}                                                                                                          

		// If the user exists, add info to the session and go to home page, otherwise                              
		// show login page with error message
		if (user == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().println("Incorrect username or password");
		} else {
			request.getSession().setAttribute("user", user);
			request.getSession().setAttribute("creationTime", LocalDateTime.now());
			response.setStatus(HttpServletResponse.SC_OK);
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().println(usrn);
		}                                                                                                       
	}
	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
