package controllers;


import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.Serial;


@WebServlet("/LogOut")
public class LogOut extends HttpServlet {
	@Serial
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
		HttpSession s = request.getSession(false);
		// Checks if the session exists
		if(s != null){
			// This invalidates the session and the user is logged out
			s.invalidate();
			response.setStatus(HttpServletResponse.SC_OK);
			response.getWriter().println("User logged out successfully!");
		}

		// Since the user is no longer logged in, he is redirected to the login page
		response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		response.getWriter().println("Error, user not logged out correctly!");
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		doGet(request, response);
	}
}
