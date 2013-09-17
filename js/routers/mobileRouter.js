// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone","cordova", "photoswipe", "../views/LoginView", "../views/ReportView","../views/DetailsView", "../models/CategoryModel", "../collections/CategoryCollection", "../collections/OccurrenceCollection", "async!http://maps.google.com/maps/api/js?sensor=false", "facebook"], function($, Backbone, Cordova, PhotoSwipe, LoginView, ReportView, DetailsView, CategoryModel, CategoryCollection, OccurrenceCollection, google, FB) {

    // Extends Backbone.Router
    var CategoryRouter = Backbone.Router.extend({

        // The Router constructor
        initialize: function() {
            // INIT VIEWS
            this.categoryList = new CategoryCollection(null, {
                scope: 1
            });

            this.occurrenceList = new OccurrenceCollection(null, {
                scope: 1
            });

            this.loginView = new LoginView({
                el: "#logincontent",
                app: this
            });

            this.reportView = new ReportView({
                el: "#home",
                app: this
            });

            this.detailsView = null;

            // SET USER DETAILS
            this.user = null;
            this.token = null;

            // INIT FACEBOOK
            /*FB.init({
                appId:"634764129875517",
                status: true,
                xfbml: true
            });*/

            /*console.log("FACEBOOK!");
            FB.getLoginStatus(function(response) {
                console.log("TEST Facebook status:");
                console.log(response);
            });*/

            // START BACKBONE
            Backbone.history.start();

            // LAUNCH OR AUTH
            this.launchAppOrAuth();
        },

        // Backbone.js Routes
        routes: {
            "": "home",
            "hope?:type": "env",
            "details?:id": "details"
        },

        launchAppOrAuth: function() {
            var that = this;

            if (window.localStorage.getItem("user") != null) {
                var _user = window.localStorage.getItem("user");
                var _token = window.localStorage.getItem("auth_token");

                that.token = _token;
                that.user = _user;

                $.ajax({
                    'type': 'GET',
                    'url': domain + "token/" + that.token + "/" + that.user + ".json",
                    success: function(data) {
                        if (data.success) {
                            console.log(data);
                            that.launchApp();
                        } else {
                            that.env("login");
                        }
                        return false;
                    },
                    error: function(xhr, type) {
                        that.env("login");
                    }
                });
            } else {
                this.env("login");
            }
        },

        launchApp: function() {

            this.reportView.render();

            $.mobile.changePage("#home", {
                reverse: false,
                changeHash: false
            });        
        },

        logout: function() {
            window.localStorage.setItem("user", null);
            window.localStorage.setItem("auth_token", null);
            this.user = null;
            this.token = null;

            $.mobile.changePage("#login", {
                reverse: true,
                changeHash: true
            });

        },

        // HOME OR LOGIN
        home: function() {
            $.mobile.changePage("#login", {
                reverse: false,
                changeHash: false
            });
        },

        // Select env
        env: function(type) {
            $.mobile.changePage("#" + type, {
                reverse: false,
                changeHash: false
            });
        },

        details: function(id) {
            var model = this.occurrenceList.get(id);
            if (model != undefined) {
                
                // MADNESS. NEED FIX
                if (this.detailsView != null)
                    this.detailsView.destroy_view();

                this.detailsView = new DetailsView({
                    el: "#details",
                    model: model,
                    app: this
                });

                $.mobile.changePage("#details", {
                    reverse: false,
                    changeHash: false
                });
            } else {
                alert("Something went wrong.");
            }
        }


    });
    return CategoryRouter;

});