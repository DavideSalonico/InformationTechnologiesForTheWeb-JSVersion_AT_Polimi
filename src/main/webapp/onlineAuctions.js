{
    //page components
    let openAuctions, closedAuctions, articleCreator, auctionCreator, searchForm, searchedAuctions,
        wonOffers, informations, offerCreator;
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

    function PersonalMessage(_username, messagecontainer){
        this.username = _username;
        this.show = function(){
            messagecontainer.textContent = this.username;
        }
    }

    function PageOrchestrator() {
        var alertContainer = document.getElementById("id_alert");

        this.start = function() {
            let personalMessage = new PersonalMessage(sessionStorage.getItem('username'), document.getElementById("id_username"));
            personalMessage.show();

        this.refresh = function(currentMission) { // currentMission initially null at start
            alertContainer.textContent = "";        // not null after creation of status change
            missionsList.reset();
            missionDetails.reset();
            missionsList.show(function() {
                missionsList.autoclick(currentMission);
            }); // closure preserves visibility of this
            wizard.reset();
        };
    }
}