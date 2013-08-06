// Mobile Router
// =============

// Includes file dependencies
define(["jquery", "backbone","cordova", "photoswipe", "../views/LoginView", "../views/ReportView","../views/DetailsView", "../models/CategoryModel", "../collections/CategoryCollection", "../collections/OccurrenceCollection", "async!http://maps.google.com/maps/api/js?sensor=false"], function($, Backbone, Cordova, PhotoSwipe, LoginView, ReportView, DetailsView, CategoryModel, CategoryCollection, OccurrenceCollection, google) {

    // Extends Backbone.Router
    var CategoryRouter = Backbone.Router.extend({

        // The Router constructor
        initialize: function() {
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