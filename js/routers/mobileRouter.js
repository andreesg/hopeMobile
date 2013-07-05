// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone", "../models/LoginModel", "../views/LoginView", "../views/SchemaListView", "../views/HomeView","../views/DetailsView", "../models/SchemaModel", "../collections/SchemaCollection", "async!http://maps.google.com/maps/api/js?sensor=false"], function($, Backbone, LoginModel, LoginView, SchemaListView, HomeView, DetailsView, SchemaModel, SchemaCollection, google) {

    // Extends Backbone.Router
    var CategoryRouter = Backbone.Router.extend({

        // The Router constructor
        initialize: function() {
            this.mapOcurrences = null;

            this.loginView = new LoginView({
                el: "#logincontent"
            });

            this.homeView = new HomeView({
                el: "#home"
            });

            this.detailsView = new DetailsView({
                el: "#details"
            });

            $('.page-map').live("pagecreate", function() {
                $('#location_map').gmap({
                    'center': '40.208696,-8.425400',
                    'disableDefaultUI': true,
                    'bounds': true,
                    'zoom': 15
                }).bind('init', function(ev, map) {
                    // maps
                });
            });

            Backbone.history.start();
        },

        // Backbone.js Routes
        routes: {
            "": "home",
            "hope?:type": "env",
            "details?:id": "details"
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

            // fetch ocurrences
            // add to this.mapOcurrences
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

        details: function(id) {
            // set photo
            // set coords img
            var coord_string = "40.208696,-8.425400";
            var w = $("body").width();
            console.log(w);
            $("#details_coords").attr("src", "https://maps.googleapis.com/maps/api/staticmap?center="+coord_string+"&sensor=true&size="+w+"x"+400+"&markers=size:tiny|"+coord_string);
            $("#details_coords").show();
            $.mobile.changePage("#details", {
                reverse: false,
                changeHash: false
            });
        }


    });
    return CategoryRouter;

});