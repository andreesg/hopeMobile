// Details View
// =============

// Includes file dependencies
define(["jquery", "backbone", "cordova", "photoswipe", "../collections/PhotoCollection", "../models/VoteModel"], function($, Backbone, Cordova, PhotoSwipe, PhotoCollection, VoteModel) {

    // Extends Backbone.View
    var DetailsView = Backbone.View.extend({

        events: {
            'click .back': 'goBack',
            'click #reinforcebtn': 'vote',
            'click #details_newphoto': 'addPhoto'
        },

        initialize: function() {
            _.bindAll(this, "goBack", "render", "addPhoto", "vote", "transferFile", "destroy_view");
            var that = this;
            //console.log(that.model.id);
            this.photoList = new PhotoCollection(null, {
                occurr_id: that.model.id 
            });
            
            this.render();
        },

        destroy_view: function() {
            console.log("[DetailsView] Destroy.");
            //COMPLETELY UNBIND THE VIEW
            this.undelegateEvents();

            //Backbone.View.prototype.remove.call(this);
        },

        goBack: function(evt) {
            console.log("[ReportView] go back.");
            console.log(evt);
            window.history.back();
        },

        vote: function(evt) {
            var that = this;
            console.log("[DetailsView] Vote.");
            var vote = new VoteModel(null, {
                occurr_id: that.model.id
            });
            vote.save(null, {
                success: function(model, response, options) {
                    console.log("success");
                    alert("Vote saved Successfully.");
                },
                error: function(model, response, options) {
                    console.log("error");
                    console.log(model);
                    console.log(response);
                    console.log(options);
                }
            });
        },

        transferFile: function(occurr_id, url) {
            console.log("[DetailsView] Transfer file!");
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = "Upload image";
            //options.mimeType = "multipart/form-data"
            options.chunkedMode = false; // nginx server

            var params = new Object();
            params.latitude = $('#_latfield').val();
            params.longitude = $('#_lngfield').val();
            options.params = params;

            var ft = new FileTransfer();
            $.mobile.loading("show");
            ft.upload(url, rootUrl + "occurrences/upload/" + occurr_id + "/", function() {
                alert("Upload successfully!");
                $.mobile.loading("hide");
                $("#camera_image").hide();
            }, function(error) {
                alert("Upload Failed!");
                console.log(error);
            }, options);

        },

        addPhoto: function(evt) {
            var that = this;
            console.log("[DetailsView] add photo.");
            navigator.camera.getPicture(function(fileURI) {
                var template = "<li><a href='"+fileURI+"' rel='external'><img src='"+fileURI+"'/></a></li>";
                $("#gallery1").append(template);
                that.transferFile(that.model.id, fileURI);
            }, function(message) {
                setTimeout(function() {
                    alert(message)
                }, 100);
            }, {
                quality: 100,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.CAMERA,
                encodingType: navigator.camera.EncodingType.JPEG
            });

            evt.preventDefault();
        },

        renderPhotos: function(collection, response) {
            console.log("[DetailsView] Render Photos.");
            //console.log(collection);
            
            var staticUrl = "http://webmoth.dec.uc.pt/static/";
            var template = "";
            collection.each(function(model) {
                template += "<li><a href='"+staticUrl+model.get("path_big")+"' rel='external'><img src='"+staticUrl+model.get("path_small")+"'/></a></li>";
            });

            if (collection.length > 0) {
                $("#gallery1").html(template);
                var photoSwipeInstance = $("#gallery1 a").photoSwipe({enableMouseWheel:false, enableKeyboard:false});
            } else {
                $("#gallery1").html('');
            }
        },

        render: function() {
            this.photoList.on('reset', this.renderPhotos, this);
            this.photoList.fetch();
            $("#vote_counter").html(""+this.votes);
            this.delegateEvents();
            return this;
        }

    });

    return DetailsView;
});