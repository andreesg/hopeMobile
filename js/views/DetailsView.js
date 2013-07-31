// Details View
// =============

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // Extends Backbone.View
    var DetailsView = Backbone.View.extend({
        events: {
            'click .back': window.history.back,
            'click .back': 'goBack'
        },

        goBack: function(evt) {
            console.log("[ReportView] go back.");
            console.log(evt);
            window.history.back();
        },

        initialize: function() {
            //console.log("init login view")
            _.bindAll(this, "goBack");
            var that = this;
            this.render();
        },

        render: function() {
            this.delegateEvents();
            return this;
        }

    });

    return DetailsView;
});