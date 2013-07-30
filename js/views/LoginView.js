// Login View
// =============

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // Extends Backbone.View
    var LoginView = Backbone.View.extend({
        events: {
        },

        initialize: function() {
            //console.log("init login view")
            //_.bindAll(this, "submitLogin");
            var that = this;
            this.render();
        },

        render: function() {
            this.template = _.template($("#login_content").html());
            $(this.el).html(this.template);
            $("#login").trigger("create");
            return this;
        }

    });

    return LoginView;
});