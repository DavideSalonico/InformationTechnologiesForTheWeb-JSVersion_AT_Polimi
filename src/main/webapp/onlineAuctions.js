{
    //page components
    let loginBanner, menu, searchForm;
    let alertContainer = document.getElementById("id_alert");

    pageOrchestrator = new PageOrchestrator();

    window.addEventListener("load", () => {
        if(sessionStorage.getItem('username') === null) {
            window.location.href = "index.html";
        } else {
            pageOrchestrator.start();
            pageOrchestrator.refresh();
        }
    }, false);

    // Constructors of view components

    function LoginBanner(_username, _bannercontainer, _messagecontainer){
        this.username = _username;
        this.bannercontainer = _bannercontainer;
        this.messagecontainer = _messagecontainer;

        this.reset = function(){
            this.bannercontainer.style.visibility = "hidden";
        };

        this.show = function(){
            this.messagecontainer.textContent = "Welcome back " + _username;
            this.bannercontainer.style.visibility = "visible";
        };
    }

    function SellPage(_username, _sellcontainer, _openAuctions, _closedAuctions, _createArticle, _createAuction){
        this.username = _username;
        this.sellcontainer = _sellcontainer;
        this.openAuctions = _openAuctions;
        this.closedAuctions = _closedAuctions;
        this.createArticle = _createArticle;
        this.createAuction = _createAuction;

        this.reset = function(){
            this.sellcontainer.style.visibility = "hidden";
        };

        this.show = function(){
            this.sellcontainer.style.visibility = "visible";
        };
    }

    function Menu(_home, _purchase, _sell, _logout){
        this.home = _home;
        this.purchase = _purchase;
        this.sell = _sell;
        this.logout = _logout;

        this.registerEvents = function(orchestrator){
            this.home.addEventListener('click', () => {
                orchestrator.refresh();
            }, false);

            this.purchase.addEventListener('click', () => {
                orchestrator.renderPurchase();
            }, false);

            this.sell.addEventListener('click', () => {
                orchestrator.renderSell();
            }, false);

            this.logout.addEventListener('click', () => {
                window.sessionStorage.removeItem('username');
                window.location.href = "home.html";
            }, false);
        }
    }

    function SearchForm(_searchButton, _searchedAuctionsContainerDiv){
        this.searchButton = _searchButton;
        this.searchContainer = this.searchButton.closest("form");
        this.searchedAuctionsContainerDiv = _searchedAuctionsContainerDiv;

        this.reset = function(){
            let self = this
            self.searchContainer.style.visibility = "hidden";
        }

        this.show = function(){
            let self = this;
            self.searchedAuctionContainer = new SearchedAuctionContainer(this.searchedAuctionsContainerDiv);
            self.searchContainer.style.visibility = "visible";
        }

        this.registerEvents = function(){
            this.searchButton.addEventListener('click', (e) => {
                let form = e.target.closest("form");
                if(form.checkValidity()){
                    let self = this;
                    let keyword = form.querySelector("input").value;
                    makeCall("GET", 'GoToPurchase', keyword,
                        function(req){
                        if(req.readyState === 4){
                            let message = req.responseText;
                            if(req.status === 200){
                                let searchedAuctions = JSON.parse(req.responseText);
                                self.searchedAuctionContainer.update(searchedAuctions);
                                self.reset();
                            }
                            else if(req.status === 403){
                                window.location.href = req.getResponseHeader("Location"); //TODO: ???
                                window.sessionStorage.removeItem('username');
                            }
                            else{
                                self.alert.textContent = message;
                            }
                        }
                    })
                }
                else{
                    form.reportValidity();
                }
            });
        };
    }

    function SearchedAuctionContainer(_searchedAuctionsDiv){
        this.searchedAuctionsDiv = _searchedAuctionsDiv;

        this.reset = function(){
            this.searchedAuctionsDiv.style.visibility = "hidden";
            this.searchedAuctionsDiv.innerHTML = "";
        }

        this.update = function(auctionList){
            let self = this;
            auctionList.forEach(function(auction){
                let anchor, table, thead, tbody, hrow, namehead, codehead, pricehead;
                anchor = document.createElement("a");
                anchor.href = "#";
                table = document.createElement("table");
                thead = document.createElement("thead");
                hrow = document.createElement("tr");
                namehead = document.createElement("td");
                namehead.textContent = "Name";
                hrow.appendChild(namehead);
                codehead = document.createElement("td");
                codehead.textContent = "Code";
                hrow.appendChild(codehead);
                pricehead = document.createElement("td");
                pricehead.textContent = "Price";
                hrow.appendChild(pricehead);
                thead.appendChild(hrow);
                table.appendChild(thead);
                tbody = document.createElement("tbody");
                let row, namecell, codecell, pricecell, par;
                auction.articles.forEach(function(article){
                    row.document.createElement("tr");
                    namecell = document.createElement("td");
                    namecell.textContent = article.name;
                    row.appendChild(namecell);
                    codecell = document.createElement("td");
                    codecell.textContent = article.code;
                    row.appendChild(codecell);
                    pricecell = document.createElement("td");
                    pricecell.textContent = article.price;
                    row.appendChild(pricecell);
                    tbody.appendChild(row);
                })
                table.appendChild(tbody);
                par = document.createElement("p");
                par.textContent = "Maximum offer: " + auction.maxOffer;
                anchor.appendChild(table);
                anchor.appendChild(par);
                self.searchedAuctionsDiv.appendChild(anchor);
            });
        }
    }

    function PageOrchestrator() {
        alertContainer = document.getElementById("id_alert");

        this.start = function() {
            menu = new Menu(document.getElementById("home_anchor"),
                document.getElementById("purchase_anchor"),
                document.getElementById("sell_anchor"),
                document.getElementById("logout_anchor"));
            menu.registerEvents(this);

            loginBanner = new LoginBanner(sessionStorage.getItem("username"),
                document.getElementById("id_loginBanner"),
                document.getElementById("id_username"));
            loginBanner.show();

            searchForm = new SearchForm(document.getElementById("id_searchButton"), document.getElementById("id_searchedAuctions"));
            searchForm.show();
            searchForm.registerEvents(this);
        };

        this.refresh = function(){
            alertContainer.textContent = "";
            loginBanner.show();
            searchForm.reset();
            searchForm.searchContainer.reset();
        };

        this.renderPurchase = function(){
            loginBanner.reset();
            searchForm.show();
        };

        this.renderSell = function(){
            loginBanner.reset();
            searchForm.reset();
            searchForm.searchContainer.reset();
        };
    }
}