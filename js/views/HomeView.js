// Home View
// =============

// Includes file dependencies
define(["jquery", "backbone", "cordova", "gmap", "async!http://maps.google.com/maps/api/js?sensor=false", "jqueryui"], function($, Backbone, Cordova, gmap, google) {

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
                    var clientPosition = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    $("#_latfield").val(position.coords.latitude);
                    $("#_lngfield").val(position.coords.longitude);
                    $('#location_map').gmap('addMarker', {
                        'position': clientPosition,
                        'bounds':true     
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

            $('#location_map').gmap({'center':'40.208696,-8.425400', 'disableDefaultUI':true, 'bounds':true}).bind('init', function(ev, map) {
                // google maps
            });

            //console.log($("#home_content").height());
            return this;
        }

    });

    // Returns the View class
    return HomeView;

});