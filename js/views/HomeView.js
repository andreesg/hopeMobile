// Category View
// =============

// Includes file dependencies
define([ "jquery", "backbone"], function( $, Backbone ) {

    // Extends Backbone.View
    var HomeView = Backbone.View.extend({
        
        
        initialize: function() {
            console.log("init home view")
            var that = this;
            this.render();
        },

        // Renders all of the Category models on the UI
        render: function() {
            this.template = _.template($("#home_content").html());
            $(this.el).html(this.template);
            return this;
        }

    } );

    // Returns the View class
    return HomeView;

});
