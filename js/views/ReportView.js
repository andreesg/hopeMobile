// Report View
// =============

// Includes file dependencies
define(["jquery", "backbone", "cordova", "../collections/CategoryCollection", "../collections/OccurrenceCollection", "../models/OcurrenceModel"], function($, Backbone, Cordova, CategoryCollection, OccurrenceCollection, OcurrenceModel) {

    // Extends Backbone.View
    var ReportView = Backbone.View.extend({

        events: {
            'change #categorieslist':'categoryChanged',
            'click #takepicture': 'takePicture',
            'click #selectpicture': 'selectPicture',
            'click #savebtn': 'saveReport',
            'click #getlocation': 'getLocation',
            'click .back': 'goBack',
            'click #logoutbtn': 'logout'
        },

        categoriesList: null,

        initialize: function() {
            console.log("[ReportView] Init.");
            this.arrayMarkers = [];
            _.bindAll(this, "categoryChanged","takePicture","selectPicture","saveReport","getLocation", "renderCategories", "renderOccurrences", "goBack", "transferFile");
            var that = this;

            this.app = this.options.app;
            //this.render();
        },

        logout: function(evt) {
            this.app.logout();
        },

        goBack: function(evt) {
            console.log("[ReportView] go back.");
            console.log(evt);
        },

        categoryChanged: function(evt) {
            console.log("[ReportView] Category Changed.");
            var id = $("#categorieslist").val();
            var model = this.categoriesList.get({"id":id});

            var fields = model.get('fields');
            var template = "";
            for (var i = 0; i < fields.length; i++) {
                template = "<input type='text' name='attr_" + fields[i].id + "' id='attr_" + fields[i].id + "' data-theme='c' placeholder='"+fields[i].name+"'>";
                $("#category-fields").append(template);
            };
            $("#category-fields").trigger('create');
            $("#category-fields").show();

            $("#titleinput").show();
        },

        takePicture: function(evt) {
            console.log("[ReportView] Take picture.");
            navigator.camera.getPicture(function(fileURI) {
                $("#camera_image").attr("src", fileURI);
                $("#camera_image").show();
            }, function(message) {
                setTimeout(function() {
                    alert(message)
                }, 100);
            }, {
                quality: 25,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.CAMERA,
                encodingType: navigator.camera.EncodingType.JPEG
            });

            evt.preventDefault();
        },

        selectPicture: function(evt) {
            console.log("[ReportView] Select picture.");
            navigator.camera.getPicture(function(fileURI) {
                $("#camera_image").attr("src", fileURI);
                $("#camera_image").show();
            }, function(message) {
                setTimeout(function() {
                    alert(message)
                }, 100);
            }, {
                quality: 25,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                encodingType: navigator.camera.EncodingType.JPEG,
                targetWidth: 480,
                targetWidth: 640
            });

            evt.preventDefault();

        },

        saveReport: function() {
            console.log("[ReportView] Save Report.");

            var that = this;

            that.user = window.localStorage.getItem("user");
            that.token = window.localStorage.getItem("auth_token");

            var lat = $("#_latfield").val();
            var lng = $("#_lngfield").val();

            var latlng = ""+lat+", "+lng+"";
            var cat_id = $("#categorieslist :selected").attr("id");
            var title = $("#report_title").val();
            var attributes = [];

            $("#category-fields :input").each(function() {
                attributes.push({"id": $(this).attr("id").split("_")[1], "value": $(this).val()});
            });

            console.log("DEBUGGGGG");
            console.log(attributes);

            var new_occurr = new OcurrenceModel({
                geo: {
                    start: {
                        latitude: lat,
                        longitude: lng,
                        distance: 0
                    }
                },
                id: 0,
                category_id: cat_id,
                title: title,
                coords: latlng,
                attributes: attributes,
                user: that.user,
                token: that.token
            });

            new_occurr.save(null, {
                success: function(model, response, options) {
                    console.log("[ReportView] occurrence saved.");
                    //alert("Saved Successfully.");
                    $("#report_title").val('');
                    $("#titleinput").hide();
                    $("#category-fields").hide();
                    result = response.result;
                    occurr_id = result['id'];

                    if ($("#camera_image").attr("src") != "") {
                        that.transferFile(occurr_id);
                    } else {
                        alert("Occurrence reported!");
                    }

                },
                error: function(model, response, options) {
                    console.log("error");
                    console.log(model);
                    console.log(response);
                    console.log(options);
                }
            });
        },

        transferFile: function(occurr_id) {
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = "new_image.jpg";
            //options.mimeType = "multipart/form-data"
            options.chunkedMode = false; // nginx server

            var params = new Object();
            params.latitude = $('#_latfield').val();
            params.longitude = $('#_lngfield').val();
            options.params = params;

            var ft = new FileTransfer();
            $.mobile.loading("show");
            ft.upload($("#camera_image").attr("src"), rootUrl + "occurrences/upload/" + occurr_id + "/", function(response) {
                alert("Saved Successfully!");
                $("#camera_image").hide();
                $.mobile.loading("hide");
            }, function(error) {
                alert("Something went wrong.");
                console.log(error);
                $.mobile.loading("hide");
            }, options);

        },

        getLocation: function() {
            console.log("[ReportView] Get Location.");
            var marker;
            var that = this;

            $.mobile.loading("show");
            navigator.geolocation.getCurrentPosition(function(position) {
                var clientPosition = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                $("#_latfield").val(position.coords.latitude);
                $("#_lngfield").val(position.coords.longitude);
                console.log("position:");
                console.log(clientPosition);
                $(that.map).gmap('addMarker', {
                    'position': clientPosition,
                    'bounds': true,
                    'draggable': true
                });
                /*marker.addEventListener("dragend", function(opts) {
                        alert(JSON.stringify(opts));
                });*/
                $.mobile.loading("hide");
            }, function(error) {
                setTimeout(function() {
                    alert(error);
                }, 100);
            });
        },

        loadMap: function(lat, lng) {
            var that = this;
            var center = ""+lat+", "+lng+"";

            that.map = $('#location_map').gmap({
                'center': center,
                'disableDefaultUI': true,
                'bounds': true,
                'zoom': 15
            }).bind('init', function(ev, map) {
                console.log("[ReportView] Map init.");
            });
        },

        renderCategories: function(collection, response) {
            console.log("[ReportView] Render categories.");
            $("#categorieslist").html("<option>Select a category:</option>");
            var template = "";
            
            this.categoriesList = collection;
            console.log("TEST!");
            console.log(this.categoriesList);

            collection.each(function(model) {
                template += "<option value='"+model.get("id")+"' id='"+model.get("id")+"'>"+model.get("name")+"</option>";
            });
            $("#categorieslist").append(template);
            $("#categorieslist").show();
        },

        renderOccurrences: function(collection, response) {
            console.log("[ReportView] Render occurrences.");
            var that = this;
            collection.each(function(model) {
                var latlng = model.get("coords");
                var marker = $(that.map).gmap('addMarker', {
                    'position': latlng,
                    'draggable': false
                }).click(function() {
                    window.location.href = "#details?"+model.get("id");
                });
                that.arrayMarkers.push(marker);
            });
        },
 
        render: function() {
            console.log("[ReportView] Render.");
            
            this.loadMap(40.208696, -8.425400);

            this.app.categoryList.on('reset', this.renderCategories, this);
            this.app.occurrenceList.on('reset', this.renderOccurrences, this);
            this.app.categoryList.fetch();
            this.app.occurrenceList.fetch();

            this.delegateEvents();
            return this;
        }

    });

    return ReportView;
});