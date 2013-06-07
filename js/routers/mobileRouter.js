// Mobile Router
// =============

// Includes file dependencies
define([ "jquery","backbone", "../models/LoginModel", "../views/LoginView", "../views/HomeView", "../models/SchemaModel", "../collections/SchemaCollection" ], function($, Backbone, LoginModel, LoginView, HomeView, SchemaModel, SchemaCollection) {

    // Extends Backbone.Router
    var CategoryRouter = Backbone.Router.extend( {

        // The Router constructor
        initialize: function() {

            // Instantiates a new Login View
            console.log("init view");
            this.loginView = new LoginView({
                el: "#login"
            });

            // Instantiates a new Login View
            this.homeView = new HomeView({
                el: "#home"
            });

            Backbone.history.start();
            this.launchAppOrAuth();
        },

        // Backbone.js Routes
        routes: {
            "": "home",
            "hope?:type": "env"
        },

        launchAppOrAuth: function() {
            var that = this;

            if(window.localStorage.getItem("user") != null) {
                this.user = window.localStorage.getItem("user");
                this.token = window.localStorage.getItem("auth_token");

                var token = this.token;
                var user = this.user;

                $.ajax({
                    'type': 'GET',
                    'url':  domain+"token/" + token + "/" + user + ".json",
                    success: function(data) {
                        if (data.success) {
                            that.launchApp();
                        } else {
                            that.env("login");
                        }
                        return false;
                    },
                    error: function(xhr, type){
                        that.env("login");
                    }

                });
            } else {
                this.env("login");
            }
        },

        launchApp: function() {
            alert("launch app");
            this.schemaList = new SchemaCollection();
            
            var that = this;
            var user = window.localStorage.getItem("user");
            var token = window.localStorage.getItem("auth_token");

            this.schemaList.fetch({
                data: {
                    user: user,
                    token: token
                },
                success: function(collection, response) {
                    alert("Fetch success!");
                },
                error: function(collection, response){
                    alert(JSON.stringify(response));
                }
            });

            var view = this[ "homeView" ];
            $.mobile.changePage( "#home", {
                reverse: false,
                changeHash: false 
            });
        },

        // Home method
        home: function() {
            $.mobile.changePage( "#hopemobile" , {
                reverse: false,
                changeHash: false
            });
        },

        // Select env
        env: function(type) {
            var currentView = this[ type + "View" ];
            $.mobile.changePage( "#" + type, {
                reverse: false,
                changeHash: false 
            });
        },

       
    });
    return CategoryRouter;

});
