{
    //page components
    let loginBanner, menu, purchasePage, sellPage, offersPage, auctionDetailsPage;
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

    function DiffDate(days, hours, minutes){
        this.days = days;
        this.hours = hours;
        this.minutes = minutes;
    }

    function timeDifference(deadline, currDate){
        deadline.setSeconds(0);
        deadline.setMilliseconds(0);
        currDate.setSeconds(0);
        currDate.setMilliseconds(0);
        var millisecondsDiff = deadline - currDate;
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        const millisecondsInHour = 1000 * 60 * 60;
        const millisecondsInMinute = 1000 * 60;
        const days = Math.floor(millisecondsDiff / millisecondsInDay);
        const hours = Math.floor((millisecondsDiff % millisecondsInDay) / millisecondsInHour);
        const minutes = Math.floor((millisecondsDiff % millisecondsInHour) / millisecondsInMinute);

        return new DiffDate(days, hours, minutes);
    }

    // Constructors of view components
    function LoginBanner(_username, _bannercontainer, _messagecontainer){
        this.username = _username;
        this.bannercontainer = _bannercontainer;
        this.messagecontainer = _messagecontainer;

        this.reset = function(){
            this.bannercontainer.style.display = "none";
        };

        this.show = function(){
            this.messagecontainer.textContent = "Welcome back " + _username;
            this.bannercontainer.style.display = "block";
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

    //il parametro della keyword lo passo con "key" nel form appeso all'url (e non la chiave)
    //leggo un JSON che ha attributi "auction_id", "price", "raise", "expiring_time", "articles"
    function SearchForm(_searchButton, _searchedAuctionsContainerDiv){
        this.searchButton = _searchButton;
        this.searchedAuctionsContainerDiv = _searchedAuctionsContainerDiv;

        this.show = function(){
            let self = this;
            self.searchedAuctionContainer = new SearchedAuctionContainer(this.searchedAuctionsContainerDiv);
        }

        this.registerEvents = function(){
            this.searchButton.addEventListener('click', (e) => {
                let form = e.target.closest("form");
                if(form.checkValidity()){
                    let self = this;
                    let key = form.querySelector("input").value;
                    //if(key === ""){
                    //    self.alert.textContent = "Insert a keyword";
                    //    return;
                    //}
                    makeCall("GET", 'Search?key=' + key,null,
                        function(req){
                        if(req.readyState === 4){
                            let message = req.responseText;
                            if(req.status === 200){
                                let filteredAuctions = JSON.parse(req.responseText);
                                let currDate = new Date();
                                self.searchedAuctionContainer.update(filteredAuctions, currDate);
                                //self.reset(); // to delete the inserted key in the form
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
            this.searchedAuctionsDiv.style.display = "none";
            this.searchedAuctionsDiv.innerHTML = "";
        }

        this.update = function(auctionList, currDate){
            let self = this;
            self.searchedAuctionsDiv.innerHTML = "";
            let title = document.createElement("h1");
            title.textContent = "Auctions found: " + auctionList.length;
            self.searchedAuctionsDiv.appendChild(title);
            auctionList.forEach((aucFullInfo) => {
                let anchor, table, thead, tbody, hrow, namehead, codehead, pricehead, par;
                anchor = document.createElement("a");
                anchor.addEventListener("click", function(event){
                    event.preventDefault();
                    self.orchestrator.renderOffers(aucFullInfo.auction);
                });
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
                aucFullInfo.articles.forEach((article) => {
                    let row, namecell, codecell, pricecell;
                    row = document.createElement("tr");
                    namecell = document.createElement("td");
                    namecell.textContent = article.name;
                    row.appendChild(namecell);
                    codecell = document.createElement("td");
                    codecell.textContent = article.article_id;
                    row.appendChild(codecell);
                    pricecell = document.createElement("td");
                    pricecell.textContent = article.price;
                    row.appendChild(pricecell);
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                par = document.createElement("p");
                let exp = aucFullInfo.auction.expiring_date;
                let expDate = new Date(Date.parse(exp));
                let diffTime = timeDifference(expDate, currDate);
                par.textContent = "Remaining time: " + diffTime.days + " days, " + diffTime.hours + " hours, " + diffTime.minutes + " minutes";
                anchor.appendChild(table);
                anchor.appendChild(par);
                self.searchedAuctionsDiv.appendChild(anchor);
            });
            self.searchedAuctionsDiv.style.display = "block";
        }
    }

    function WonOfferContainer(_wonOfferContainer){
        this.wonOfferContainer = _wonOfferContainer;

        this.show = function(){
            let self = this;

            makeCall("GET", "WonOffers", null,
                function(req){
                    if (req.readyState === 4) {
                        let message = req.responseText;
                        if (req.status === 200) {
                            let wonOffers = JSON.parse(req.responseText);
                            self.update(wonOffers);
                        } else if (req.status === 403) {
                            window.location.href = req.getResponseHeader("Location");
                            window.sessionStorage.removeItem('username');
                        }
                        else {
                            self.alert.textContent = message;
                        }
                    }
                });
        };

        this.update = function(wonOffers){
            let self = this;
            self.wonOfferContainer.innerHTML = "";
            let title = document.createElement("h1");
            title.textContent = "Won Offers";
            self.wonOfferContainer.appendChild(title);
            if(wonOffers != null){
                wonOffers.forEach(function(aucFullInfo){
                    let table, thead, hrow, namehead, codehead, pricehead, par1, par2;
                    table = document.createElement("table");
                    thead = document.createElement("thead");
                    hrow = document.createElement("tr");
                    namehead = document.createElement("td");
                    namehead.textContent = "Article Name";
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
                    aucFullInfo.articles.forEach((article) => {
                        let row, namecell, codecell, pricecell;
                        row = document.createElement("tr");
                        namecell = document.createElement("td");
                        namecell.textContent = article.name;
                        row.appendChild(namecell);
                        codecell = document.createElement("td");
                        codecell.textContent = article.article_id;
                        row.appendChild(codecell);
                        pricecell = document.createElement("td");
                        pricecell.textContent = article.price;
                        row.appendChild(pricecell);
                        tbody.appendChild(row);
                    });
                    table.appendChild(tbody);
                    par1 = document.createElement("p");
                    par1.textContent = "Auction ID: " + aucFullInfo.auction.auction_id;
                    par2 = document.createElement("p");
                    par2.textContent = "Maximum offer for this Auction: " + aucFullInfo.maxOffer.price;
                    self.wonOfferContainer.appendChild(table);
                    self.wonOfferContainer.appendChild(par1);
                    self.wonOfferContainer.appendChild(par2);
                })
            }
        }
    }

    function AuctionLists(_openContainer, _closedContainer){
        this.openContainer = _openContainer;
        this.closedContainer = _closedContainer;

        this.show = function(){
            let self = this;
            makeCall("GET", "GetAuctionsList", null,
                function(req){
                    if (req.readyState === 4) {
                        let message = req.responseText;
                        if (req.status === 200) {
                            let Auctions = JSON.parse(req.responseText);
                            self.update(Auctions);
                        } else if (req.status === 403) {
                            window.location.href = req.getResponseHeader("Location");
                            window.sessionStorage.removeItem('username');
                        }
                        else {
                            self.alert.textContent = message;
                        }
                    }
                });
        }

        this.update = function (auctionList){
            let self = this;
            let openAuctions = [];
            let closedAuctions = [];
            auctionList.forEach((aucFullInfo) => {
                if(aucFullInfo.auction.open == 1){
                    openAuctions.push(aucFullInfo);
                }
                else{
                    closedAuctions.push(aucFullInfo);
                }
            });
            if(openAuctions.length > 0){
                self.openContainer.innerHTML = "";
                openAuctions.forEach((aucFullInfo) => {
                    let anchor, table, thead, tbody, hrow, namehead, codehead, pricehead, par;
                    anchor = document.createElement("a");
                    anchor.addEventListener("click", function(event){
                        event.preventDefault();
                        self.orchestrator.renderAuctionDetails(aucFullInfo.auction);
                    });
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
                    aucFullInfo.articles.forEach((article) => {
                        let row, namecell, codecell, pricecell;
                        row = document.createElement("tr");
                        namecell = document.createElement("td");
                        namecell.textContent = article.name;
                        row.appendChild(namecell);
                        codecell = document.createElement("td");
                        codecell.textContent = article.article_id;
                        row.appendChild(codecell);
                        pricecell = document.createElement("td");
                        pricecell.textContent = article.price;
                        row.appendChild(pricecell);
                        tbody.appendChild(row);
                    });
                    table.appendChild(tbody);
                    par = document.createElement("p");
                    let exp = aucFullInfo.auction.expiring_date;
                    let expDate = new Date(Date.parse(exp));
                    let log = sessionStorage.getItem("logDate");
                    let logDate = new Date(Date.parse(log));
                    let diffTime = timeDifference(expDate, logDate);
                    par.textContent = "Remaining time: " + diffTime.days + " days, " + diffTime.hours + " hours, " + diffTime.minutes + " minutes";
                    anchor.appendChild(table);
                    anchor.appendChild(par);
                    self.openContainer.appendChild(anchor);
                });
            } else{
                let par = document.createElement("p");
                par.textContent = "No open auctions";
                self.openContainer.appendChild(par);
            }

            if(closedAuctions.length > 0){
                self.closedContainer.innerHTML = "";
                closedAuctions.forEach((aucFullInfo) => {
                    let anchor, table, thead, tbody, hrow, namehead, codehead, pricehead, par;
                    anchor = document.createElement("a");
                    anchor.addEventListener("click", function(event){
                        event.preventDefault();
                        self.orchestrator.renderAuctionDetails(aucFullInfo.auction);
                    });
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
                    aucFullInfo.articles.forEach((article) => {
                        let row, namecell, codecell, pricecell;
                        row = document.createElement("tr");
                        namecell = document.createElement("td");
                        namecell.textContent = article.name;
                        row.appendChild(namecell);
                        codecell = document.createElement("td");
                        codecell.textContent = article.article_id;
                        row.appendChild(codecell);
                        pricecell = document.createElement("td");
                        pricecell.textContent = article.price;
                        row.appendChild(pricecell);
                        tbody.appendChild(row);
                    });
                    table.appendChild(tbody);
                    par = document.createElement("p");
                    let exp = aucFullInfo.auction.expiring_date;
                    let expDate = new Date(Date.parse(exp));
                    let log = sessionStorage.getItem("logDate");
                    let logDate = new Date(Date.parse(log));
                    let diffTime = timeDifference(expDate, logDate);
                    par.textContent = "Remaining time: " + diffTime.days + " days, " + diffTime.hours + " hours, " + diffTime.minutes + " minutes";
                    anchor.appendChild(table);
                    anchor.appendChild(par);
                    self.closedContainer.appendChild(anchor);
                });
            } else{
                let par = document.createElement("p");
                par.textContent = "No closed auctions";
                self.closedContainer.appendChild(par);
            }

        }
    }

    function CreateArticleWizard(_formButton, createAuctionWizard){
        this.formButton = _formButton;
        this.createAuctionWizard = createAuctionWizard;

        this.registerEvents = function() {
            let self = this;
            this.formButton.addEventListener('click', (e) => {
                let form = e.target.closest("form");
                if (form.checkValidity()) {
                    let self = this;
                    makeCall("POST", 'CreateArticle', form,
                        function (req) {
                            if (req.readyState === 4) {
                                let message = req.responseText;
                                if (req.status === 200) {
                                    self.createAuctionWizard.show();
                                } else if (req.status === 403) {
                                    window.location.href = req.getResponseHeader("Location"); //TODO: ???
                                    window.sessionStorage.removeItem('username');
                                } else {
                                    self.alert.textContent = message;
                                }
                            }
                        })
                } else {
                    form.reportValidity();
                }
            });
        }
    }

    function Article(article_id, name, description, image, price, auction_id){
        this.article_id = article_id;
        this.name = name;
        this.description = description;
        this.image = image;
        this.price = price;
        this.auction_id = auction_id;
    }

    function CreateAuctionWizard(_addArticleToAuctionButton, _createAuctionButton){
        this.addArticleToAuctionButton = _addArticleToAuctionButton;
        this.createAuctionButton = _createAuctionButton;
        this.availableArticles = [];
        this.selectedArticles = [];

        this.show = function(){
            let self = this;
            let listDiv = document.getElementById("id_selectedArticlesList");
            listDiv.innerHTML = "";
            let title = document.createElement("h3");
            title.textContent = "Selected Articles";
            listDiv.appendChild(title);
            let par = document.createElement("p");
            par.textContent = "No articles selected yet!";
            listDiv.appendChild(par);
            makeCall("GET", 'GetAvailableArticles', null,
                cback = function (req) {
                    if (req.readyState === 4) {
                        let message = req.responseText;
                        if (req.status === 200) {
                            let arts = JSON.parse(message);
                            arts.forEach((art) => {
                                self.availableArticles.push(art);
                            });
                            self.update();
                        } else if (req.status === 403) {
                            window.location.href = req.getResponseHeader("Location");
                            window.sessionStorage.removeItem('username');
                        } else {
                            self.alert.textContent = message;
                        }
                    }
                });
        }

        this.update = function(){
            if(this.availableArticles.length > 0){
                for(let i = 0; i < this.availableArticles.length; i++){
                    let select = document.getElementById("id_articleSelector");
                    let opt = document.createElement("option");
                    opt.value = this.availableArticles[i].article_id;
                    opt.textContent = this.availableArticles[i].name;
                    select.appendChild(opt);
                }
            }
            else{
                let div = this.addArticleToAuctionButton.closest("div");
                let par = document.createElement("p");
                par.textContent = "First of all, insert an article";
                div.appendChild(par);
            }

            if(this.selectedArticles.length > 0){
                let title, table, thead, tbody, hrow, namehead, codehead, pricehead, row, namecell, codecell, pricecell;
                document.getElementById("id_selectedArticlesList").innerHTML = "";
                title = document.createElement("h3");
                title.textContent = "List of selected articles";
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
                this.selectedArticles.forEach((article) => {
                    row = document.createElement("tr");
                    namecell = document.createElement("td");
                    namecell.textContent = article.name;
                    row.appendChild(namecell);
                    codecell = document.createElement("td");
                    codecell.textContent = article.article_id;
                    row.appendChild(codecell);
                    pricecell = document.createElement("td");
                    pricecell.textContent = article.price;
                    row.appendChild(pricecell);
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                document.getElementById("id_selectedArticlesList").appendChild(title);
                document.getElementById("id_selectedArticlesList").appendChild(table);
                }
        }

        this.registerEvents = function(){
            let self = this;
            self.addArticleToAuctionButton.addEventListener('click', (e) => {
                let form = e.target.closest("form");
                let articleSelector = document.getElementById("id_articleSelector");
                let articleToAdd_id = articleSelector.value;
                let articleToAdd = self.availableArticles.filter((el) => { return el.article_id == articleToAdd_id; })[0];
                console.log(articleToAdd);
                self.availableArticles = self.availableArticles.filter((el) => { return el.article_id != articleToAdd_id; });
                for (let i = 0; i < articleSelector.options.length; i++) {
                    if (articleSelector.options[i].value === articleToAdd_id) {
                        articleSelector.options[i].remove(i);
                        break;
                    }
                }
                self.selectedArticles.push(articleToAdd);
                /*
                let formfieldAuc = this.createAuctionButton.closest("fieldset");
                let input = document.createElement("input");
                input.style.display = "none";
                input.value = articleToAdd.article_id;
                input.textContent = articleToAdd.name;
                formfieldAuc.appendChild(input);
                 */
                this.update();
            });

            self.createAuctionButton.addEventListener('click', (e) => {
                let form = e.target.closest("form");
                let artIds = [];
                self.selectedArticles.forEach((art) => {
                    artIds.push(art.article_id);
                });
                document.getElementById("id_articleSelectedHiddenInput").value = artIds;
                if (form.checkValidity()) {
                    let self = this;
                    makeCall("POST", 'CreateAuction', form,
                        function (req) {
                            if (req.readyState === 4) {
                                let message = req.responseText;
                                if (req.status === 200) {
                                    self.availableArticles = [];
                                    self.selectedArticles = [];
                                    self.show();
                                }
                                else if (req.status === 403) {
                                    window.location.href = req.getResponseHeader("Location");
                                    window.sessionStorage.removeItem('username');
                                }
                                else {
                                    self.alert.textContent = message;
                                }
                            }
                    });
                }
                else {
                    form.reportValidity();
                }
            });
        }
    }

    function OfferList(_offerList) {
        this.offerList = _offerList;

        this.show = function () {
            makeCall("GET", "GetOffers", null,
                cback = function (req) {
                    if (req.readyState === 4) {
                        let message = req.responseText;
                        if (req.status === 200) {
                            let offers = JSON.parse(req.responseText);
                            //TODO
                        } else if (req.status === 403) {
                            window.location.href = req.getResponseHeader("Location");
                            window.sessionStorage.removeItem('username');
                        } else {
                            self.alert.textContent = message;
                        }
                    }
                });
        }
    }

    function OfferInfo(){
        this.show = function(){
            //TODO
        }
    }

    function PurchasePage(orchestrator, _purchasePage) {
        let searchForm, wonOffers;
        this.orchestrator = orchestrator;
        this.purchasePage = _purchasePage;

        this.start = function () {
            searchForm = new SearchForm(document.getElementById("id_searchButton"), document.getElementById("id_searchedAuctions"));
            searchForm.show();
            searchForm.registerEvents();

            wonOffers = new WonOfferContainer(document.getElementById("id_wonOffers"));
            wonOffers.show();
        };

        this.reset = function () {
            let self = this;
            self.purchasePage.style.display = "none";
        }

        this.show = function () {
            let self = this;
            self.purchasePage.style.display = "block";
        }
    }

    function SellPage(orchestrator, _sellPage) {
        let openAuctions, closedAuctions, createArticleWizard, createAuctionWizard;
        this.orchestrator = orchestrator;
        this.sellPage = _sellPage;

        this.start = function () {
            openAuctions = new AuctionLists(document.getElementById("id_openAuctions"), document.getElementById("id_closedAuctions"));
            openAuctions.show();

            createAuctionWizard = new CreateAuctionWizard(document.getElementById("id_addToAuctionButton"), document.getElementById("id_createAuctionButton"));
            createAuctionWizard.show();
            createAuctionWizard.registerEvents();

            createArticleWizard = new CreateArticleWizard(document.getElementById("id_createArticleButton"), createAuctionWizard);
            createArticleWizard.registerEvents();
        };

        this.reset = function () {
            let self = this;
            self.sellPage.style.display = "none";
        }

        this.show = function () {
            let self = this;
            self.sellPage.style.display = "block";
        }
    }

    function OffersPage(orchestrator, _offersPage) {
        let offersList;
        let offerInfo;
        this.orchestrator = orchestrator;
        this.offersPage = _offersPage;


        this.reset = function () {
            let self = this;
            self.offersPage.style.display = "none";
        }

        this.start = function () {
            let self = this;

            offersList = new OfferList(document.getElementById("id_offersList"));
            offersList.show();

            offerInfo = new OfferInfo(document.getElementById("id_offerInfo"));
            offerInfo.show();

            self.offersPage.style.display = "block";
        }
    }

    function AuctionDetailsPage(orchestrator, _auctionDetailsPage) {
        let auctionDetails;
        this.orchestrator = orchestrator;
        this.auctionDetailsPage = _auctionDetailsPage;

        this.start = function () {
            //auctionDetails = new AuctionDetails(document.getElementById("id_auctionDetails"));
            //auctionDetails.show();
        };

        this.reset = function () {
            let self = this;
            self.auctionDetailsPage.style.display = "none";
        }

        this.show = function () {
            let self = this;
            self.auctionDetailsPage.style.display = "block";
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

            purchasePage = new PurchasePage(this, document.getElementById("id_purchasePage"));
            purchasePage.start();

            sellPage = new SellPage(this, document.getElementById("id_sellPage"));
            sellPage.start();

            offersPage = new OffersPage(this, document.getElementById("id_offersPage"));
            offersPage.start();

            auctionDetailsPage = new AuctionDetailsPage(this, document.getElementById("id_auctionDetailsPage"));
            auctionDetailsPage.start();
        };

        this.refresh = function(){
            alertContainer.textContent = "";
            loginBanner.show();
            purchasePage.reset();
            sellPage.reset();
            offersPage.reset();
            auctionDetailsPage.reset();
        };

        this.renderPurchase = function(){
            loginBanner.reset();
            purchasePage.show();
            sellPage.reset();
            offersPage.reset()
            auctionDetailsPage.reset();
        };

        this.renderSell = function(){
            loginBanner.reset();
            purchasePage.reset();
            sellPage.show();
            offersPage.reset();
            auctionDetailsPage.reset();
        };

        this.renderOffers = function(auc){
            loginBanner.reset();
            purchasePage.reset();
            sellPage.reset();
            offersPage.show(auc);
            auctionDetailsPage.reset();
        }

        this.renderAuctionDetails = function(auc){
            loginBanner.reset();
            purchasePage.reset();
            sellPage.reset();
            offersPage.reset();
            auctionDetailsPage.show(auc);
        }
    }
}