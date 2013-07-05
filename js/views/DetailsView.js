// Home View
// =============

// Includes file dependencies
define(["jquery", "backbone", "cordova", "gmap", "async!http://maps.google.com/maps/api/js?sensor=false", "jqueryui"], function($, Backbone, Cordova, gmap, google) {

    // Extends Backbone.View
    var DetailsView = Backbone.View.extend({


        initialize: function() {
            console.log("init details view")
            var that = this;
            this.render();
        },

        // Renders all of the Category models on the UI
        render: function() {

            this.template = _.template($("#details_content").html());
            $(this.el).html(this.template);


            $("#details_newphoto").click(function(evt) {
                navigator.camera.getPicture(function(fileURI) {
                    $("#details_image").attr("src", fileURI);
                    $("#details_image").show();
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
            return this;
        }

    });

    // Returns the View class
    return DetailsView;

});