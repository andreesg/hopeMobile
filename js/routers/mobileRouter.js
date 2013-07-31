// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone", "../views/LoginView", "../views/ReportView","../views/DetailsView", "../models/CategoryModel", "../collections/CategoryCollection", "async!http://maps.google.com/maps/api/js?sensor=false"], function($, Backbone, LoginView, ReportView, DetailsView, CategoryModel, CategoryCollection, google) {

    // Extends Backbone.Router
    var CategoryRouter = Backbone.Router.extend({

        // The Router constructor
        initialize: function() {
            this.mapOcurrences = null;

            this.loginView = new LoginView({
                el: "#logincontent"
            });

            this.reportView = new ReportView({
                el: "#home"
            });

            this.detailsView = new DetailsView({
                el: "#details"
            });

            Backbone.history.start();
        },

        // Backbone.js Routes
        routes: {
            "": "home",
            "hope?:type": "env",
            "details?:id": "details"
        },

        // HOME OR LOGIN
        home: function() {
            $.mobile.changePage("#home", {
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
            $.mobile.changePage("#details", {
                reverse: false,
                changeHash: false
            });
        }


    });
    return CategoryRouter;

});