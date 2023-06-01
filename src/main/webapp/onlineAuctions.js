{
    //page components
    let loginBanner, menu;
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
        };

        this.refresh = function(){
            alertContainer.textContent = "";
            loginBanner.show();
        };

        this.renderPurchase = function(){
            loginBanner.reset();
        };

        this.renderSell = function(){
            loginBanner.reset();
        };
    }
}