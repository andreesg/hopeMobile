// Report View
// =============

// Includes file dependencies
define(["jquery", "backbone", "../collections/CategoryCollection", "../collections/OccurrenceCollection", "../models/OcurrenceModel"], function($, Backbone, CategoryCollection, OccurrenceCollection, OcurrenceModel) {

    // Extends Backbone.View
    var ReportView = Backbone.View.extend({

        categoryList: new CategoryCollection(null, {
            scope: 1
        }),

        occurrenceList: new OccurrenceCollection(null, {
            scope: 1
        }),

        events: {
            'change #categorieslist':'categoryChanged',
            'click #takepicture': 'takePicture',
            'click #selectpicture': 'selectPicture',
            'click #savebtn': 'saveReport',
            'click #getlocation': 'getLocation',
            'click .back': 'goBack'
        },

        initialize: function() {
            console.log("[ReportView] Init.");
            this.arrayMarkers = [];
            _.bindAll(this, "categoryChanged","takePicture","selectPicture","saveReport","getLocation", "renderCategories", "renderOccurrences", "goBack");
            var that = this;
            this.render();
        },

        goBack: function(evt) {
            console.log("[ReportView] go back.");
            console.log(evt);
            window.history.back();
        },

        categoryChanged: function() {
            console.log("[ReportView] Category Changed.");
            $("#titleinput").show();
        },

        takePicture: function() {
            console.log("[ReportView] Take picture.");
        },

        selectPicture: function() {
            console.log("[ReportView] Select picture.");
        },

        saveReport: function() {
            console.log("[ReportView] Save Report.");
            var lat = $("#_latfield").val();
            var lng = $("#_lngfield").val();

            var latlng = ""+lat+", "+lng+"";
            var cat_id = $("#categorieslist :selected").attr("id");
            var title = $("#report_title").val();

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
                coords: latlng
            });

            new_occurr.save({
                success: function(model, response, options) {
                    console.log("success");
                    console.log(model);
                    console.log(response);
                    console.log(options);
                },
                error: function(model, response, options) {
                    console.log("error");
                    console.log(model);
                    console.log(response);
                    console.log(options);                }
            });

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
                $.mobile.loading("hide");
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
            var template = "";
            collection.each(function(model) {
                template += "<option value='"+model.get("name")+"' id='"+model.get("id")+"'>"+model.get("name")+"</option>";
            });
            $("#categorieslist").html(template);
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

            this.categoryList.on('reset', this.renderCategories, this);
            this.occurrenceList.on('reset', this.renderOccurrences, this);
            this.categoryList.fetch();
            this.occurrenceList.fetch();

            this.delegateEvents();
            return this;
        }

    });

    return ReportView;
});