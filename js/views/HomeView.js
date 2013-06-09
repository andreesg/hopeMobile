// Home View
// =============

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

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

            $("#getlocation").click(function(evt) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var coord_string = "" + position.coords.latitude + "," + position.coords.longitude;

                    $("#_latfield").val(position.coords.latitude);
                    $("#_lngfield").val(position.coords.longitude);

                    $("#location_map").attr("src", "https://maps.googleapis.com/maps/api/staticmap?center=" + coord_string + "&sensor=true&size=400x400&markers=size:tiny|" + coord_string);
                    console.log($("#location_map").attr("src"));
                    $("#location_map").show();
                }, function(error) {
                    alert("error location!");
                })

                evt.preventDefault();
            });

            $("#takepicture").click(function(evt) {
                navigator.camera.getPicture(function(fileURI) {
                    $("#camera_image").attr("src", fileURI);
                    $("#camera_image").show();
                }, function(message) {
                    setTimeout(function() {
                        alert(message)
                    }, 100);
                }, {
                    quality: 100,
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    sourceType: navigator.camera.PictureSourceType.CAMERA,
                    encodingType: navigator.camera.EncodingType.JPEG,
                });

                evt.preventDefault();
            });

            $("#selectpicture").click(function(evt) {
                alert("select picture");
                navigator.camera.getPicture(function(fileURI) {
                    $("#camera_image").attr("src", fileURI);
                    $("#camera_image").show();
                }, function(message) {
                    setTimeout(function() {
                        alert(message)
                    }, 100);
                }, {
                    quality: 100,
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                    encodingType: navigator.camera.EncodingType.JPEG,
                });

                evt.preventDefault();
            });
            return this;
        }

    });

    // Returns the View class
    return HomeView;

});