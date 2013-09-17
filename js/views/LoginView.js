// Login View
// =============

// Includes file dependencies
define(["jquery", "backbone", "facebook"], function($, Backbone, FB) {

    // Extends Backbone.View
    var LoginView = Backbone.View.extend({
        events: {
            'click #submit': 'submitLogin',
            'click #fbloginbtn': 'facebookLogin'
        },

        initialize: function() {
            console.log("[LoginView] init.");
            _.bindAll(this, "submitLogin");
            var that = this;
            this.app = this.options.app;
            this.render();
        },

        facebookLogin: function(evt) {
            /*console.log("[LoginView] Facebook Login!");
            FB.getLoginStatus(function(response) {
                console.log("Facebook status:");
                console.log(response);
            });*/
        },

        submitLogin: function(evt) {
            console.log("[LoginView] Normal Login!");
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