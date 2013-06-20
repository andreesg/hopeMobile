// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone", "../models/LoginModel", "../views/LoginView", "../views/SchemaListView", "../views/HomeView", "../models/SchemaModel", "../collections/SchemaCollection", "async!http://maps.google.com/maps/api/js?sensor=false"], function($, Backbone, LoginModel, LoginView, SchemaListView, HomeView, SchemaModel, SchemaCollection, google) {

    // Extends Backbone.Router
    var CategoryRouter = Backbone.Router.extend({

        // The Router constructor
        initialize: function() {

            // Instantiates a new Login View
            //console.log("init view");
            this.loginView = new LoginView({
                el: "#logincontent"
            });

            console.log(window.google);
            // Instantiates a new Home View
            this.homeView = new HomeView({
                el: "#home"
            });

            Backbone.history.start();
        },

        // Backbone.js Routes
        routes: {
            "": "home",
            "hope?:type": "env"
        },

        events: {
            'click .back': window.history.back
        },

        launchAppOrAuth: function() {
            var that = this;

            if (window.localStorage.getItem("user") != null) {
                this.user = window.localStorage.getItem("user");
                this.token = window.localStorage.getItem("auth_token");

                var token = this.token;
                var user = this.user;

                $.ajax({
                    'type': 'GET',
                    'url': domain + "token/" + token + "/" + user + ".json",
                    success: function(data) {
                        if (data.success) {
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
            this.schemaList = new SchemaCollection();

            var that = this;
            var user = window.localStorage.getItem("user");
            var token = window.localStorage.getItem("auth_token");

            $.mobile.loading("show");
            this.schemaList.fetch({
                data: {
                    user: user,
                    token: token
                },
                success: function(collection, response) {
                    that.appendSchemaList = new SchemaListView({
                        model: that.schemaList
                    });
                    $("#categorieslist").html(that.appendSchemaList.el);
                    $('select').selectmenu();
                    $.mobile.changePage("#home", {
                        reverse: false,
                        changeHash: false
                    });
                },
                error: function(collection, response) {
                    alert(JSON.stringify(response));
                }
            });
        },

        // Home method
        home: function() {
            this.launchAppOrAuth();
        },

        // Select env
        env: function(type) {
            $.mobile.changePage("#" + type, {
                reverse: false,
                changeHash: false
            });
        },


    });
    return CategoryRouter;

});