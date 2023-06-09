package filters;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebFilter({"/CloseAuction", "/CreateAuction", "/GoToAuctionDetails", "/GoToHome", "/GoToOffer", "/Purchase", "/GoToSell", "/MakeOffer", "/Search", "/WonOffers"})
public class LoginChecker implements Filter{

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException {
		
		System.out.print("Login checker filter executing ...\n");

		// java.lang.String login path = "/index.html";
		HttpServletRequest req = (HttpServletRequest) request;
		HttpServletResponse res = (HttpServletResponse) response;

		HttpSession s = req.getSession();
		if (s.isNew() || s.getAttribute("user") == null) {
			res.setStatus(HttpServletResponse.SC_FORBIDDEN);
			res.getWriter().println("You are not logged in. Please, log in first");
			return;
		}

		try {
	        chain.doFilter(request, response);
	    } catch (ServletException e) {
	        res.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			res.getWriter().println("Not possible to check the user id. Try again later");
	    }
	}

}
