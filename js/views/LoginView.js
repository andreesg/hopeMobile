// Category View
// =============

// Includes file dependencies
define(["jquery", "backbone", "models/LoginModel"], function($, Backbone, LoginModel) {

    // Extends Backbone.View
    var LoginView = Backbone.View.extend({
        events: {
            'click #submit': 'submitLogin',
        },

        initialize: function() {
            //console.log("init login view")
            _.bindAll(this, "submitLogin");
            var that = this;
            this.render();
        },

        submitLogin: function(evt) {
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

                    app.user = data.user;
                    app.token = data.token;

                    app.launchApp();
                },

                error: function(xhr, error, errorThrown) {
                    alert("Login error!");                
                }
            });

            evt.preventDefault();
        },

        // Renders all of the Category models on the UI
        render: function() {
            this.template = _.template($("#login_content").html());
            $(this.el).html(this.template);
            $("#login").trigger("create");
            return this;
        }

    });

    // Returns the View class
    return LoginView;

});