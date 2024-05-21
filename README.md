# Information Technologies for the Web Exam @ Politecnico di Milano 🚀

## Goal 🎯

Web Application to manage online auctions

## Team 👥

- [Jaskaran Ram](https://github.com/JaskaranRam)
- [Davide Salonico](https://github.com/LorenzoReitani)

## Features ✨

JavaScript version

## Specs 🛠️

A web application allows the management of online auctions. Users access through login and can sell and buy at auction. The HOME page contains two links, one to access the SELL page and one to access the BUY page. The SELL page displays a list of auctions created by the user and not yet closed, a list of auctions created by him and closed, and two forms, one for creating a new item and one for creating a new auction to sell the user's items. The first form inserts new items into the database and the second displays the list of items available in the database and allows the selection of more than one. An item has a code, name, description, image, and price. An auction includes one or more items put up for sale, the initial price of the set of items, the minimum bid increment for each offer (expressed as an integer number of euros), and an expiration date and time (e.g., 19-04-2021 at 24:00). The initial price of the auction is obtained as the sum of the prices of the items included in the offer. The same item cannot be included in different auctions. Once sold, an item must not be available for inclusion in additional auctions. The list of auctions is sorted by ascending date+time. The list includes: code and name of the items included in the auction, maximum offer, remaining time (number of days and hours) between the login time (date and time) and the closing date and time of the auction. Clicking on an auction displays a DETAIL AUCTION page that shows for an open auction all the auction data and the list of bids (username, offered price, date and time of the bid) sorted by descending date+time. A CLOSE button allows the user to close the auction if the expiration time has arrived (ignore the case of expired but not closed auctions by the user and do not automatically close auctions after expiration). If the auction is closed, the page displays all the auction data, the name of the winning bidder, the final price, and the user's (fixed) shipping address. The BUY page contains a search form by keyword. When the buyer submits a keyword, the BUY page is updated and displays a list of open auctions (whose expiration is after the submission date and time) for which the keyword appears in the name or description of at least one of the items in the auction. The list is sorted in descending order based on the remaining time (number of days and hours) until closing. Clicking on an open auction displays the BID page that shows the item data, the list of received bids in order of descending date+time, and an input field to enter one's bid, which must be higher than the current maximum bid by an amount at least equal to the minimum increment. After submitting the bid, the BID page shows the updated list of bids. The BUY page also contains a list of bids won by the user with the data of the items and the final price.

## Additional JS specs

Create a web client-server application that extends and/or modifies the previous specifications as follows:

After login, the entire application is implemented on a single page.
If the user accesses the application for the first time, it displays the content of the BUY page. If the user has already used the application, it shows the content of the SELL page if the user's last action was to create an auction; otherwise, it displays the content of the BUY page with the list (possibly empty) of auctions the user has previously clicked on and are still open. Information about the last action performed and the visited auctions is stored on the client side for one month.
Each user interaction is managed without completely reloading the page but produces asynchronous server invocation and only updates the content to be refreshed following the event.
