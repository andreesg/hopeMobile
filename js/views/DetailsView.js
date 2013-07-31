// Details View
// =============

// Includes file dependencies
define(["jquery", "backbone", "photoswipe"], function($, Backbone, PhotoSwipe) {

    // Extends Backbone.View
    var DetailsView = Backbone.View.extend({

        events: {
            'click .back': window.history.back,
            'click .back': 'goBack'
        },

        initialize: function() {
            _.bindAll(this, "goBack", "render");
            var that = this;
            this.render();
        },

        goBack: function(evt) {
            console.log("[ReportView] go back.");
            console.log(evt);
            window.history.back();
        },

        render: function() {
            var photoSwipeInstance = $("#gallery1 a").photoSwipe({enableMouseWheel:false, enableKeyboard:false});
            this.delegateEvents();
            return this;
        }

    });

    return DetailsView;
});