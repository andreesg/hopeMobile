// Login View
// =============

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

    // Extends Backbone.View
    var LoginView = Backbone.View.extend({
        events: {
            'click #submit': 'submitLogin'
        },

        initialize: function() {
            console.log("[LoginView] init.");
            _.bindAll(this, "submitLogin");
            var that = this;
            this.app = this.options.app;
            this.render();
        },

        submitLogin: function(evt) {
            var that = this;
            var username = $("#username", this.el).val();
            var password = $("#password", this.el).val();

            $.ajax(domain + "token/new.json", {
                type: 'POST',
                data: {
                    username: username,
                    password: password
                },
                success: function(data, status, xhr) {
                    window.localStorage.setItem("user", data.user);
                    window.localStorage.setItem("auth_token", data.token);

                    that.app.user = data.user;
                    that.app.token = data.token;

                    that.app.launchApp();
                },

                error: function(xhr, error, errorThrown) {
                    alert("Login error!");
                }
            });

            evt.preventDefault();
        },

        render: function() {
            console.log("[LoginView] render.");
            this.delegateEvents();
        }

    });

    return LoginView;
});