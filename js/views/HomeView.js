// Home View
// =============

// Includes file dependencies
define(["jquery", "backbone", "cordova", "gmap", "google"], function($, Backbone, Cordova, gmap, google) {

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
                $.mobile.loading("show");
                navigator.geolocation.getCurrentPosition(function(position) {
                    var clientPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    console.log(clientPosition);
                    $('#location_map').gmap('addMarker', {
                        'position': clientPosition,
                        'bounds': true
                    });
                    $('#location_map').gmap('addShape', 'Circle', {
                        'strokeWeight': 0,
                        'fillColor': "#008595",
                        'fillOpacity': 0.25,
                        'center': clientPosition,
                        'radius': 15,
                        'clickable': false
                    });
                    $.mobile.loading("hide");
                }, function(error) {
                    $.mobile.loading("hide");
                });

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
                //alert("select picture");
                //$.mobile.loading("show");
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

            $("#home_content").height($("body").height()-38);

            $('#location_map').gmap().bind('init', function(ev, map) {
                // google maps
            });

            //console.log($("#home_content").height());
            return this;
        }

    });

    // Returns the View class
    return HomeView;

});