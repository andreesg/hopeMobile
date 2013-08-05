// Details View
// =============

// Includes file dependencies
define(["jquery", "backbone", "photoswipe", "../collections/PhotoCollection"], function($, Backbone, PhotoSwipe, PhotoCollection) {

    // Extends Backbone.View
    var DetailsView = Backbone.View.extend({

        events: {
            'click .back': 'goBack',
            'click #reinforcebtn': 'vote',
            'click #details_newphoto': 'addPhoto'
        },

        initialize: function() {
            _.bindAll(this, "goBack", "render", "addPhoto", "vote");
            var that = this;

            this.photoList = new PhotoCollection(null, {
                occurr_id: that.model.get('id') 
            });

            this.render();
        },

        goBack: function(evt) {
            console.log("[ReportView] go back.");
            console.log(evt);
            window.history.back();
        },

        vote: function(evt) {
            console.log("[DetailsView] Vote");
        },

        addPhoto: function(evt) {
            console.log("[DetailsView] add photo.");
            navigator.camera.getPicture(function(fileURI) {
                /*$("#camera_image").attr("src", fileURI);
                $("#camera_image").show();*/
                // TODO
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
        },

        renderPhotos: function(collection, response) {
            console.log("[DetailsView] Render Photos.");
            console.log(collection);
            var photoSwipeInstance = $("#gallery1 a").photoSwipe({enableMouseWheel:false, enableKeyboard:false});
        },

        render: function() {
            this.photoList.on('reset', this.renderPhotos, this);
            this.photoList.fetch();

            this.delegateEvents();
            return this;
        }

    });

    return DetailsView;
});