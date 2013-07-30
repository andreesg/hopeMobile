// Details View
// =============

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // Extends Backbone.View
    var DetailsView = Backbone.View.extend({
        events: {
        },

        initialize: function() {
            //console.log("init login view")
            //_.bindAll(this, "submitLogin");
            var that = this;
            this.render();
        },

        render: function() {
            
            return this;
        }

    });

    return DetailsView;
});