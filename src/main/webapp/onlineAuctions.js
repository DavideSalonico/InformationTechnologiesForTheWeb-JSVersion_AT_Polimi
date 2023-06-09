{
    //page components
    let loginBanner, menu, purchasePage, sellPage, offerPage, auctionDetailsPage, pageOrchestrator;
    let alertContainer = document.getElementById("id_alert");

    pageOrchestrator = new PageOrchestrator();

    window.addEventListener("load", () => {
        if(sessionStorage.getItem('username') === null) {
            window.location.href = "index.html";
        } else {
            pageOrchestrator.start();
            let hasLoggedBefore = localStorage.getItem('hasLoggedBefore');
            if(hasLoggedBefore) {
                if (localStorage.getItem('lastActionWasCreateAuction') === "true") {
                    pageOrchestrator.renderSell();
                } else {
                    pageOrchestrator.renderSpecialPurchase();
                }
                let lastVisitedAuctions = localStorage.getItem('visitedAuctions');
                let lVA = new Map();
                //Deletes all the auctions visited more than 30 days ago
                if (lastVisitedAuctions != null) {
                    lVA = new Map(Object.entries(JSON.parse(lastVisitedAuctions)));
                    for (let [key, value] of lVA.entries()) {
                        let date = new Date(value);
                        if (new DiffDate(date, new Date()).days > 30) {
                            lVA.delete(key);
                        }
                    }
                    localStorage.setItem('visitedAuctions', JSON.stringify(Array.from(lVA.entries())));
                }
            }
            else{
                localStorage.setItem('hasLoggedBefore', "true");
                let visitedAuctions = new Map();
                localStorage.setItem('visitedAuctions', JSON.stringify(visitedAuctions));
                localStorage.setItem('lastActionWasCreateAuction', "false");
                pageOrchestrator.renderPurchase();
            }
        }
    }, false);

    function DiffDate(days, hours, minutes){
        this.days = days;
        this.hours = hours;
        this.minutes = minutes;
    }

    function encodeBase64FromArray(array) {
        let binary = '';
        for (let i = 0; i < array.length; i++) {
            binary += String.fromCharCode(array[i]);
        }
        return btoa(binary);
    }

    function timeDifference(deadline, currDate){
        deadline.setSeconds(0);
        deadline.setMilliseconds(0);
        currDate.setSeconds(0);
        currDate.setMilliseconds(0);
        let millisecondsDiff = deadline - currDate;
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        const millisecondsInHour = 1000 * 60 * 60;
        const millisecondsInMinute = 1000 * 60;
        const days = Math.floor(millisecondsDiff / millisecondsInDay);
        const hours = Math.floor((millisecondsDiff % millisecondsInDay) / millisecondsInHour);
        const minutes = Math.floor((millisecondsDiff % millisecondsInHour) / millisecondsInMinute);

        return new DiffDate(days, hours, minutes);
    }

    function createArticleTable(artList, container, title, emptyMessage) {
        if(artList.length === 0){
            container.innerHTML = "";
            let msg = document.createElement("p");
            msg.textContent = emptyMessage;
            container.appendChild(msg);
        }
        else{
            container.innerHTML = "";
            let ttl = document.createElement("h2");
            ttl.textContent = title
            container.appendChild(ttl);
            let table = document.createElement("table");
            let thead = document.createElement("thead");
            let hrow = document.createElement("tr");
            let namehead = document.createElement("td");
            namehead.textContent = "Name";
            hrow.appendChild(namehead);
            let codehead = document.createElement("td");
            codehead.textContent = "Code";
            hrow.appendChild(codehead);
            let pricehead = document.createElement("td");
            pricehead.textContent = "Price";
            hrow.appendChild(pricehead);
            let description = document.createElement("td");
            description.textContent = "Description";
            hrow.appendChild(description);
            let image = document.createElement("td");
            image.textContent = "Image";
            hrow.appendChild(image);
            thead.appendChild(hrow);
            table.appendChild(thead);
            let tbody = document.createElement("tbody");
            artList.forEach((article) => {
                let row = document.createElement("tr");
                let namecell = document.createElement("td");
                namecell.textContent = article.name;
                row.appendChild(namecell);
                let codecell = document.createElement("td");
                codecell.textContent = article.article_id;
                row.appendChild(codecell);
                let pricecell = document.createElement("td");
                pricecell.textContent = article.price;
                row.appendChild(pricecell);
                let descriptioncell = document.createElement("td");
                descriptioncell.textContent = article.description;
                row.appendChild(descriptioncell);
                // Cella per l'immagine
                let imageCell = document.createElement('td');
                let imagetag = document.createElement('img');
                //let imageURL = URL.createObjectURL(new Blob(article.imageBytes, {type: 'image/*'}));
                let base64Image = encodeBase64FromArray(new Uint8Array(article.imageBytes));
                imagetag.src = 'data:image/jpeg;base64,' + base64Image;
                imageCell.appendChild(imagetag);
                row.appendChild(imageCell);
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            container.appendChild(table);
        }
    }


    // Constructors of view components
    function LoginBanner(_username, _bannercontainer, _messagecontainer, _alertContainer){
        this.username = _username;
        this.bannercontainer = _bannercontainer;
        this.messagecontainer = _messagecontainer;
        this.alertContainer = alertContainer;

        this.reset = function(){
            this.bannercontainer.style.display = "none";
        };

        this.show = function(){
            this.messagecontainer.textContent = "Welcome back " + _username;
            this.bannercontainer.style.display = "block";
            if(_username == null){
                this.bannercontainer.style.display = "none";
                this.messagecontainer.textContent = "";
                this.alertContainer.textContent =  "LOGIN FAILED !";
                this.alert.style.display = "block";
            }
        };
    }

    function Menu(_home, _purchase, _sell, _logout){
        this.home = _home;
        this.purchase = _purchase;
        this.sell = _sell;
        this.logout = _logout;

        this.registerEvents = function(){
            this.home.addEventListener('click', () => {
                pageOrchestrator.refresh();
            }, false);

            this.purchase.addEventListener('click', () => {
                pageOrchestrator.renderPurchase();
            }, false);

            this.sell.addEventListener('click', () => {
                pageOrchestrator.renderSell();
            }, false);

            this.logout.addEventListener('click', () => {
               logout();
            }, false);
        }
    }

    function logout(){
        window.sessionStorage.clear();
        //window.localStorage.clear();
        window.location.href = "home.html";
    }

    //il parametro della keyword lo passo con "key" nel form appeso all'url (e non la chiave)
    //leggo un JSON che ha attributi "auction_id", "price", "raise", "expiring_time", "articles"
    function SearchForm(_searchButton, _searchedAuctionsContainerDiv){
        this.searchButton = _searchButton;
        this.searchedAuctionsContainerDiv = _searchedAuctionsContainerDiv;
        this.alert = document.getElementById("id_alert");

        this.show = function(){
            let self = this;
            self.searchedAuctionContainer = new SearchedAuctionContainer(this.searchedAuctionsContainerDiv);
        }

        this.specialShow = function() {
            let self = this;
            self.searchedAuctionContainer = new SearchedAuctionContainer(this.searchedAuctionsContainerDiv);
            let lastVisitedAuctions = localStorage.getItem('visitedAuctions');
            let lVA = new Map();
            if (lastVisitedAuctions != null && lVA.size !== 0) {
                lVA = new Map(Object.entries(JSON.parse(lastVisitedAuctions)));

                // Convert the values of lVA map to an array of integers
                let lVAValuesArray = Array.from(lVA.keys());
                // or: let lVAValuesArray = [...lVA.values()];

                makeCall("GET", 'LastVisited?lVA=' + lVAValuesArray.join(','), null,
                    function(req) {
                        if (req.readyState === 4) {
                            let message = req.responseText;
                            if (req.status === 200) {
                                let stillValidAuctions = JSON.parse(req.responseText);
                                let currDate = new Date();
                                self.searchedAuctionContainer.update(stillValidAuctions, currDate);
                            } else if (req.status === 403) {
                                logout();
                            } else {
                                self.alert.textContent = message;
                            }
                        }
                    });
            }
        };



        this.registerEvents = function(){
            this.searchButton.addEventListener('click', (e) => {
                let form = e.target.closest("form");
                if(form.checkValidity()){
                    let self = this;
                    let key = form.querySelector("input").value;
                    if(key === ""){
                       self.alert.textContent = "Insert a keyword";
                        return;
                    }
                    makeCall("GET", 'Search?key=' + key,null,
                        function(req){
                            self.alert.textContent = "";
                        if(req.readyState === 4){
                            let message = req.responseText;
                            if(req.status === 200){
                                let filteredAuctions = JSON.parse(req.responseText);
                                let currDate = new Date();
                                self.searchedAuctionContainer.update(filteredAuctions, currDate);
                                //self.reset(); // to delete the inserted key in the form
                            }
                            else if(req.status === 403){
                                logout();
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
                    pageOrchestrator.renderOffers(aucFullInfo.auction.auction_id);
                    let map = new Map();
                    const storedAuctions = localStorage.getItem('visitedAuctions');
                    if (storedAuctions) {
                        const parsedAuctions = JSON.parse(storedAuctions);
                        const entries = Object.entries(parsedAuctions);
                        map = new Map(entries);
                    }
                    if(aucFullInfo.auction.auctionId != null)
                        map.set(aucFullInfo.auction.auctionId, new Date());
                    localStorage.setItem('visitedAuctions', JSON.stringify(Object.fromEntries(map)));
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
                if(diffTime.minutes > 0){
                    par.textContent = "Remaining time: " + diffTime.days + " days, " + diffTime.hours + " hours, " + diffTime.minutes + " minutes";
                }
                else{
                    par.textContent = "Expired";
                }
                anchor.appendChild(table);
                anchor.appendChild(par);
                self.searchedAuctionsDiv.appendChild(anchor);
            });
            self.searchedAuctionsDiv.style.display = "block";
        }
    }

    function WonOfferContainer(_wonOfferContainer){
        this.wonOfferContainer = _wonOfferContainer;
        this.alert = document.getElementById("id_alert");

        this.show = function(){
            let self = this;

            makeCall("GET", "WonOffers", null,
                function(req){
                    self.alert.textContent = "";
                    if (req.readyState === 4) {
                        let message = req.responseText;
                        if (req.status === 200) {
                            let wonOffers = JSON.parse(req.responseText);
                            self.update(wonOffers);
                        } else if (req.status === 403) {
                            logout();
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
        this.alert = document.getElementById("id_alert");

        this.show = function(){
            let self = this;
            makeCall("GET", "GetAuctionsList", null,
                function(req){
                self.alert.textContent = "";
                    if (req.readyState === 4) {
                        let message = req.responseText;
                        if (req.status === 200) {
                            let Auctions = JSON.parse(req.responseText);
                            self.update(Auctions);
                        } else if (req.status === 403) {
                            logout();
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
                    let anchor, table, thead, tbody, hrow, namehead, codehead, pricehead, par, maxOffer;
                    anchor = document.createElement("a");
                    anchor.addEventListener("click", function(event){
                        event.preventDefault();
                        pageOrchestrator.renderAuctionDetails(aucFullInfo.auction.auction_id);
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
                    maxOffer = document.createElement("p");
                    let exp = aucFullInfo.auction.expiring_date;
                    let expDate = new Date(Date.parse(exp));
                    let log = sessionStorage.getItem("logDate");
                    let logDate = new Date(Date.parse(log));
                    let diffTime = timeDifference(expDate, logDate);
                    if(diffTime.minutes > 0){
                        par.textContent = "Remaining time: " + diffTime.days + " days, " + diffTime.hours + " hours, " + diffTime.minutes + " minutes";
                    }
                    else{
                        par.textContent = "Expired";
                    }
                    let maxO = aucFullInfo.maxOffer.price;
                    par.textContent = "Remaining time: " + diffTime.days + " days, " + diffTime.hours + " hours, " + diffTime.minutes + " minutes";
                    maxOffer.textContent = "Maximum offer: " + maxO;
                    anchor.appendChild(table);
                    anchor.appendChild(par);
                    anchor.appendChild(maxOffer);
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
                    let anchor, table, thead, tbody, hrow, namehead, codehead, pricehead, par, maxOffer;
                    anchor = document.createElement("a");
                    anchor.addEventListener("click", function(event){
                        event.preventDefault();
                        pageOrchestrator.renderAuctionDetails(aucFullInfo.auction.auction_id);
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
                    maxOffer = document.createElement("p");
                    let exp = aucFullInfo.auction.expiring_date;
                    let expDate = new Date(Date.parse(exp));
                    let log = sessionStorage.getItem("logDate");
                    let logDate = new Date(Date.parse(log));
                    let diffTime = timeDifference(expDate, logDate);
                    let maxO = aucFullInfo.maxOffer.price;
                    par.textContent = "Remaining time: " + diffTime.days + " days, " + diffTime.hours + " hours, " + diffTime.minutes + " minutes";
                    maxOffer.textContent = "Maximum offer: " + maxO;
                    if(diffTime.minutes > 0){
                        par.textContent = "Remaining time: " + diffTime.days + " days, " + diffTime.hours + " hours, " + diffTime.minutes + " minutes";
                    }
                    else{
                        par.textContent = "Expired";
                    }
                    anchor.appendChild(table);
                    anchor.appendChild(par);
                    anchor.appendChild(maxOffer);
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
        this.alert = document.getElementById("id_alert");

        this.registerEvents = function() {
            this.formButton.addEventListener('click', (e) => {
                let form = e.target.closest("form");
                if (form.checkValidity()) {
                    let self = this;
                    makeCall("POST", 'CreateArticle', form,
                        function (req) {
                            self.alert.textContent = "";
                            if (req.readyState === 4) {
                                let message = req.responseText;
                                if (req.status === 200) {
                                    localStorage.setItem("lastActionWasCreateAuction", "false");
                                    self.createAuctionWizard.show();
                                } else if (req.status === 403) {
                                    logout();
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

    function CreateAuctionWizard(_addArticleToAuctionButton, _createAuctionButton, openAucList){
        this.addArticleToAuctionButton = _addArticleToAuctionButton;
        this.createAuctionButton = _createAuctionButton;
        this.availableArticles = [];
        this.selectedArticles = [];
        this.alert = document.getElementById("id_alert");
        this.openAucList = openAucList;

        this.show = function(){
            let self = this;
            let listDiv = document.getElementById("id_selectedArticlesList");
            listDiv.innerHTML = "";
            let title = document.createElement("h3");
            title.textContent = "Selected Articles : ";
            listDiv.appendChild(title);
            let par = document.createElement("p");
            par.textContent = "No articles selected yet!";
            listDiv.appendChild(par);
            makeCall("GET", 'GetAvailableArticles', null,
                cback = function (req) {
                    self.alert.textContent = "";
                    if (req.readyState === 4) {
                        let message = req.responseText;
                        if (req.status === 200) {
                            let arts = JSON.parse(message);
                            arts.forEach((art) => {
                                if (!self.selectedArticles.some((selectedArt) => selectedArt.article_id === art.article_id)) {
                                    self.availableArticles.push(art);
                                }
                            });
                            self.update();
                        } else if (req.status === 403) {
                            logout();
                        } else {
                            self.alert.textContent = message;
                        }
                    }
                });
        }

        this.update = function(){
            if(this.availableArticles.length > 0){
                let par = document.getElementById("id_firstOfAll");
                par.textContent = "";

                let select = document.getElementById("id_articleSelector");
                select.disabled = false;

                // CANCELLA IL <p> dove dice di inserire un articolo !
                while (select.options.length > 0) {
                    select.remove(0);
                }
                for(let i = 0; i < this.availableArticles.length; i++){
                    let opt = document.createElement("option");
                    opt.value = this.availableArticles[i].article_id;
                    opt.textContent = this.availableArticles[i].name;
                    select.appendChild(opt);
                }
            }
            else{
                let par = document.getElementById("id_firstOfAll");
                par.textContent = "First of all, insert an article";
                let select = document.getElementById("id_articleSelector");
                select.disabled = true;
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
            this.alert = document.getElementById("id_alert");
            let self = this;

            self.addArticleToAuctionButton.addEventListener('click', () => {
                //let form = e.target.closest("form");
                let articleSelector = document.getElementById("id_articleSelector");
                let articleToAdd_id = articleSelector.value;
                let articleToAdd = self.availableArticles.find((el) => {
                    return el.article_id == articleToAdd_id;
                });
                //let articleToAdd = self.availableArticles.filter((el) => { return el.article_id === articleToAdd_id; })[0];
                let indexToRemove = self.availableArticles.findIndex((el) => {
                    return el.article_id == articleToAdd_id;
                });

                if (indexToRemove !== -1) {
                    self.availableArticles.splice(indexToRemove, 1);
                }
                for (let i = 0; i < articleSelector.options.length; i++) {
                    if (articleSelector.options[i].value == articleToAdd_id) {
                        articleSelector.options[i].remove();
                        break; // No need to loop further
                    }
                }
                self.selectedArticles.push(articleToAdd);
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
                            self.alert.textContent = "";
                            if (req.readyState === 4) {
                                let message = req.responseText;
                                if (req.status === 200) {
                                    localStorage.setItem("lastActionWasCreateAuction", "true");
                                    self.availableArticles = [];
                                    self.selectedArticles = [];
                                    self.show();
                                    self.openAucList.show();
                                }
                                else if (req.status === 403) {
                                    logout();
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

    function PurchasePage(_purchasePage) {
        let searchForm, wonOffers;
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

        this.specialShow = function () {
            let self = this;
            searchForm.specialShow();
            self.purchasePage.style.display = "block";
        }
    }

    function SellPage(_sellPage) {
        let auctionList, createArticleWizard, createAuctionWizard;
        this.sellPage = _sellPage;

        this.start = function () {
            auctionList = new AuctionLists(document.getElementById("id_openAuctions"), document.getElementById("id_closedAuctions"));
            auctionList.show();

            createAuctionWizard = new CreateAuctionWizard(document.getElementById("id_addToAuctionButton"), document.getElementById("id_createAuctionButton"), auctionList);
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

    function OfferPage(_offerPage) {
        this.offerPage = _offerPage;
        let articleList, offerList, offerMaker;

        this.start = function () {
            offerList = new OfferList(document.getElementById("id_offerList"));
            offerMaker = new OfferMaker(document.getElementById("id_makeOfferButton"), document.getElementById("id_hiddenAucIdMakeOffer"));
            articleList = new ArticleList(document.getElementById("id_offerArticles"), offerList, offerMaker);
        }

        this.show = function(int) {
            let self = this;
            articleList.show(int);
            self.offerPage.style.display = "block";
        }

        this.reset = function () {
            let self = this;
            self.offerPage.style.display = "none";
        }
    }

    function ArticleList(_articleList, offerList, offerMaker){
        this.articleList = _articleList;
        this.alert = document.getElementById("id_alert");

        this.show = function(auctionId){
            let aucDetails;
            let self = this;
            makeCall("GET", "GoToAuctionDetails?auctionId=" + auctionId, null,
                cback = function (req) {
                    self.alert.textContent = "";
                    if (req.readyState === 4) {
                        let message = req.responseText;
                        if (req.status === 200) {
                            aucDetails = JSON.parse(req.responseText);
                            offerMaker.registerEvents(aucDetails.auction.auction_id);
                            self.update(aucDetails);
                            offerList.update(aucDetails);
                        } else if (req.status === 403) {
                            logout();
                        } else {
                            self.alert.textContent = message;
                        }
                    }
                });
        }

        this.update = function(aucDetails){
            createArticleTable(aucDetails.articles, this.articleList, "List of Articles contained by auction", "No articles contained by auction");
        }
    }

    function OfferList(_offerList){
        this.offerList = _offerList;

        this.update = function(aucDetails){
            //Create offers table
            if(aucDetails.offers_username != null && aucDetails.offers_username.length > 0){
                this.offerList.innerHTML = "";
                let title = document.createElement("h2");
                title.textContent = "List of Offers for this auction";
                this.offerList.appendChild(title);
                let table = document.createElement("table");
                let thead = document.createElement("thead");
                let hrow = document.createElement("tr");
                let idcell = document.createElement("th");
                idcell.textContent = "OfferID";
                hrow.appendChild(idcell);
                let usercell = document.createElement("th");
                usercell.textContent = "Username";
                hrow.appendChild(usercell);
                let pricecell = document.createElement("th");
                pricecell.textContent = "Price";
                hrow.appendChild(pricecell);
                this.offerList.appendChild(hrow);
                thead.appendChild(hrow);
                table.appendChild(thead);
                let tbody = document.createElement("tbody");
                aucDetails.offers_username.forEach((offer) => {
                    let row, icell, ucell, pcell;
                    row = document.createElement("tr");
                    icell = document.createElement("td");
                    icell.textContent = offer.first.offer_id;
                    row.appendChild(icell);
                    ucell = document.createElement("td");
                    ucell.textContent = offer.second;
                    row.appendChild(ucell);
                    pcell = document.createElement("td");
                    pcell.textContent = offer.first.price;
                    row.appendChild(pcell);
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                this.offerList.appendChild(table);
            }
            else {
                this.offerList.innerHTML = "";
                let title = document.createElement("h2");
                title.textContent = "No offers for this auction";
                this.offerList.appendChild(title);
            }
        }
    }

    function OfferMaker(_makeOfferButton, _hiddenAucIdMakeOffer){
        this.makeOfferButton = _makeOfferButton;
        this.hiddenAucIdMakeOffer = _hiddenAucIdMakeOffer;
        this.alert = document.getElementById("id_alert");

        this.registerEvents = function(auctionId){
            this.makeOfferButton.addEventListener('click', (e) => {
                let form = e.target.closest("form");
                this.hiddenAucIdMakeOffer.value = auctionId;
                let self = this;
                makeCall("POST", "MakeOffer", form,
                    function (req) {
                        self.alert.textContent = "";
                        if (req.readyState === 4) {
                            let message = req.responseText;
                            if (req.status === 200) {
                                pageOrchestrator.renderOffers(auctionId);
                            } else if (req.status === 403) {
                                logout();
                            } else {
                                self.alert.textContent = message;
                            }
                        }
                    });
            }, false);
        }
    }

    function DetArticleList(_articleList, offerList, aucCloser){
        this.articleList = _articleList;
        this.offerList = offerList;
        this.alert = document.getElementById("id_alert");

        this.show = function(auctionId){
            let aucDetails;
            let self = this;
            makeCall("GET", "GoToAuctionDetails?auctionId=" + auctionId, null,
                function (req) {
                    self.alert.textContent = "";
                    if (req.readyState === 4) {
                        let message = req.responseText;
                        if (req.status === 200) {
                            aucDetails = JSON.parse(req.responseText);
                            self.update(aucDetails);
                            self.offerList.update(aucDetails);
                            let currTime = new Date();
                            let expiringTime = new Date(Date.parse(aucDetails.auction.expiring_date));
                            let expired = expiringTime - currTime <= 0;
                            aucCloser.show(auctionId, aucDetails.auction.open, aucDetails.winner, expired);
                        } else if (req.status === 403) {
                            logout();
                        } else {
                            self.alert.textContent = message;
                        }
                    }
                });
        }

        this.update = function(aucDetails){
            createArticleTable(aucDetails.articles, this.articleList, "List of Articles contained by auction", "No articles contained by auction");
            let initialPrice = document.createElement("p");
            initialPrice.textContent = "Initial price: " + aucDetails.auction.initial_price;
            this.articleList.appendChild(initialPrice);
            let minimumRaise = document.createElement("p");
            minimumRaise.textContent = "Minimum raise: " + aucDetails.auction.minimum_raise;
            this.articleList.appendChild(minimumRaise);
            let expiringDate = document.createElement("p");
            let expDate = new Date(Date.parse(aucDetails.auction.expiring_date));
            let truncatedDate = (expDate.toString()).split('GMT')[0];
            expiringDate.textContent = "Expiring date: " + truncatedDate;
            this.articleList.appendChild(expiringDate);
        }
    }

    function DetOfferList(_offerList){
        this.offerList = _offerList;

        this.update = function(aucDetails){
            //Create offers table
            if(aucDetails.offers_username != null && aucDetails.offers_username.length > 0){
                this.offerList.innerHTML = "";
                let title = document.createElement("h2");
                title.textContent = "List of Offers for this auction";
                this.offerList.appendChild(title);
                let table = document.createElement("table");
                let thead = document.createElement("thead");
                let hrow = document.createElement("tr");
                let idcell = document.createElement("th");
                idcell.textContent = "OfferID";
                hrow.appendChild(idcell);
                let usercell = document.createElement("th");
                usercell.textContent = "Username";
                hrow.appendChild(usercell);
                let pricecell = document.createElement("th");
                pricecell.textContent = "Price";
                hrow.appendChild(pricecell);
                this.offerList.appendChild(hrow);
                thead.appendChild(hrow);
                table.appendChild(thead);
                let tbody = document.createElement("tbody");
                aucDetails.offers_username.forEach((offer) => {
                    let row, icell, ucell, pcell;
                    row = document.createElement("tr");
                    icell = document.createElement("td");
                    icell.textContent = offer.first.offer_id;
                    row.appendChild(icell);
                    ucell = document.createElement("td");
                    ucell.textContent = offer.second;
                    row.appendChild(ucell);
                    pcell = document.createElement("td");
                    pcell.textContent = offer.first.price;
                    row.appendChild(pcell);
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                this.offerList.appendChild(table);
            }
            else {
                this.offerList.innerHTML = "";
                let title = document.createElement("h2");
                title.textContent = "No offers for this auction";
                this.offerList.appendChild(title);
            }
        }
    }

    function AuctionCloser(_auctionCloser, auctionInfo){
        this.auctionCloser = _auctionCloser;
        this.auctionInfo = auctionInfo;
        this.alert = document.getElementById("id_alert");

        this.show = function(auctionId, open, winner, expired){
            if(open == true && expired == true) {
                let button = document.getElementById("id_auctionCloserButton");
                button.addEventListener('click', () => {
                    let self = this;
                    makeCall("GET", "CloseAuction?auctionId=" + auctionId, null,
                        function (req) {
                            self.alert.textContent = "";
                            if (req.readyState === 4) {
                                let message = req.responseText;
                                if (req.status === 200) {
                                    sellPage.start();
                                    pageOrchestrator.renderSell();
                                } else if (req.status === 403) {
                                    logout();
                                } else {
                                    self.alert.textContent = message;
                                }
                            }
                        });
                });
                this.auctionCloser.style.display = "block";
            }
            else {
                this.auctionCloser.style.display = "none";
                this.auctionInfo.update(winner);
            }
        }
    }

    function AuctionInfo(_auctionInfo){
        this.auctionInfo = _auctionInfo;

        this.update = function(winner){
            let self = this;
            if(winner != null){
                self.auctionInfo.style.display = "block";
                self.auctionInfo.textContent = "Auction closed. Winner is " + winner.username + "\nAddress: " + winner.address;
            }
            else{
                self.auctionInfo.style.display = "none";
            }
        }
    }

    function AuctionDetailsPage(_auctionDetailsPage) {
        this.auctionDetailsPage = _auctionDetailsPage;
        let artList, offList, aucCloser, aucInfo;

        this.start = function () {
            offList = new DetOfferList(document.getElementById("id_detailsOfferList"));
            aucInfo = new AuctionInfo(document.getElementById("id_auctionInfo"));
            aucCloser = new AuctionCloser(document.getElementById("id_auctionCloser"), aucInfo);
            artList = new DetArticleList(document.getElementById("id_detailsArtList"), offList, aucCloser);
        };

        this.show = function(int) {
            let self = this;
            artList.show(int);
            self.auctionDetailsPage.style.display = "block";
        }

        this.reset = function () {
            let self = this;
            self.auctionDetailsPage.style.display = "none";
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
                document.getElementById("id_username"),
                alertContainer);
            loginBanner.show();

            purchasePage = new PurchasePage(document.getElementById("id_purchasePage"));
            purchasePage.start();

            sellPage = new SellPage(document.getElementById("id_sellPage"));
            sellPage.start();

            offerPage = new OfferPage(document.getElementById("id_offersPage"));
            offerPage.start();

            auctionDetailsPage = new AuctionDetailsPage(document.getElementById("id_auctionDetailsPage"));
            auctionDetailsPage.start();
        };

        this.refresh = function(){
            alertContainer.textContent = "";
            loginBanner.show();
            purchasePage.reset();
            sellPage.reset();
            offerPage.reset();
            auctionDetailsPage.reset();

            localStorage.setItem('lastActionWasCreateAuction', 'false');
        };

        this.renderPurchase = function(){
            alertContainer.textContent = "";
            loginBanner.reset();
            purchasePage.show();
            sellPage.reset();
            offerPage.reset()
            auctionDetailsPage.reset();

            localStorage.setItem('lastActionWasCreateAuction', 'false');
        };

        this.renderSell = function(){
            alertContainer.textContent = "";
            loginBanner.reset();
            purchasePage.reset();
            sellPage.show();
            offerPage.reset();
            auctionDetailsPage.reset();

        };

        this.renderOffers = function(auctionId){
            alertContainer.textContent = "";
            loginBanner.reset();
            purchasePage.reset();
            sellPage.reset();
            offerPage.show(auctionId);
            auctionDetailsPage.reset();

            localStorage.setItem('lastActionWasCreateAuction', 'false');
            let map = new Map();
            const storedAuctions = localStorage.getItem('visitedAuctions');
            if (storedAuctions) {
                const parsedAuctions = JSON.parse(storedAuctions);
                const entries = Object.entries(parsedAuctions);
                map = new Map(entries);
            }
            map.set(auctionId, new Date());
            localStorage.setItem('visitedAuctions', JSON.stringify(Object.fromEntries(map)));
        }

        this.renderAuctionDetails = function(auctionId){
            alertContainer.textContent = "";
            loginBanner.reset();
            purchasePage.reset();
            sellPage.reset();
            offerPage.reset();
            auctionDetailsPage.show(auctionId);

            localStorage.setItem('lastActionWasCreateAuction', 'false');
            let map = new Map();
            const storedAuctions = localStorage.getItem('visitedAuctions');
            if (storedAuctions) {
                const parsedAuctions = JSON.parse(storedAuctions);
                const entries = Object.entries(parsedAuctions);
                map = new Map(entries);
            }
            map.set(auctionId, new Date());
            localStorage.setItem('visitedAuctions', JSON.stringify(Object.fromEntries(map)));
        }

        this.renderSpecialPurchase = function(){
            alertContainer.textContent = "";
            loginBanner.reset();
            sellPage.reset();
            offerPage.reset();
            auctionDetailsPage.reset();

            purchasePage.specialShow();
            localStorage.setItem('lastActionWasCreateAuction', 'false');
        }
    }
}