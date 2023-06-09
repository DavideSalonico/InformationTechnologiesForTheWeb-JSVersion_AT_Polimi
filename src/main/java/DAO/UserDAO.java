package DAO;

import beans.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserDAO {
	private Connection connection;
	private PreparedStatement pstatement = null;
	private ResultSet result = null;

	public UserDAO(Connection con) {
		this.connection = con;
	}
	
	public User checkCredentials(String username, String password) throws SQLException{
		User user;
		String query = "SELECT * FROM user WHERE BINARY username = ? AND BINARY password = ?";
		try {
			this.pstatement = connection.prepareStatement(query);
			// This sets the user_id as first parameter of the query
			pstatement.setString(1, username);
			pstatement.setString(2, password);
			result = pstatement.executeQuery();
			// If there is a match the entire row is returned here as a result
			if (!result.isBeforeFirst()) // no results, credential check failed
				return null;
			else {
				result.next();
				user = new User();
				user.setUser_id(result.getInt("user_id"));
				user.setUsername(result.getString("username"));
				user.setPassword(result.getString("password"));
				user.setAddress(result.getString("address"));
				return user;
			}
		} catch (SQLException e) {
		    e.printStackTrace();
			throw new SQLException(e);

		} finally {
			try {
				result.close();
			} catch (Exception e1) {
				throw new SQLException(e1);
			}
			try {
				pstatement.close();
			} catch (Exception e2) {
				throw new SQLException(e2);
			}
		}	
	}
	
	

	public User getWinningUser(int auction_id) throws SQLException{
		User user = null;
		try {
			pstatement = connection.prepareStatement("""
					SELECT u.*
					FROM auction au
					LEFT JOIN (
					    SELECT o1.*
					    FROM offer o1
					    INNER JOIN (
					        SELECT o3.auction, MAX(o3.price) AS max_price
					        FROM offer o3
					        GROUP BY o3.auction
					    ) o2 ON o1.auction = o2.auction AND o1.price = o2.max_price
					) o ON o.auction = au.auction_id
					JOIN user u ON u.user_id = o.user
					WHERE au.auction_id = ?;""");
			pstatement.setInt(1, auction_id);
			result = pstatement.executeQuery();
			if(result.next()) {
				user = new User();
				user.setUser_id(result.getInt("user_id"));
				user.setAddress(result.getString("address"));
				user.setUsername(result.getString("username"));
				user.setPassword("");
			}


		} catch (SQLException e) {
			throw new SQLException(e);

		} finally {
			try {
				result.close();
			} catch (Exception e1) {
				throw new SQLException(e1);
			}
			try {
				pstatement.close();
			} catch (Exception e2) {
				throw new SQLException(e2);
			}
		}
		return user;
	}
}
