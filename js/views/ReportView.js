// Report View
// =============

// Includes file dependencies
define(["jquery", "backbone", "../collections/CategoryCollection"], function($, Backbone, CategoryCollection) {

    // Extends Backbone.View
    var ReportView = Backbone.View.extend({

        categoryList: new CategoryCollection(null, {
            scope: 1
        }),

        events: {
            'change #listcategories':'categoryChanged',
            'click #takepicture': 'takePicture',
            'click #selectpicture': 'selectPicture',
            'click #savebtn': 'saveReport',
            'click #getlocation': 'getLocation'
        },

        initialize: function() {
            console.log("[ReportView] Init.");
            this.arrayMarkers = [];
            _.bindAll(this, "categoryChanged","takePicture","selectPicture","saveReport","getLocation", "renderCategories");
            var that = this;
            this.render();
        },

        categoryChanged: function() {
            console.log("[ReportView] Category Changed.");
        },

        takePicture: function() {
            console.log("[ReportView] Take picture.");
        },

        selectPicture: function() {
            console.log("[ReportView] Select picture.");
        },

        saveReport: function() {
            console.log("[ReportView] Save Report.");
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

        loadMap: function() {
            var that = this;
            that.map = $('#location_map').gmap({
                'center': '40.208696, -8.425400',
                'disableDefaultUI': true,
                'bounds': true,
                'zoom': 15
            }).bind('init', function(ev, map) {
                console.log("[ReportView] Map init.");
            });
        },

        renderCategories: function(collection, response) {
            console.log("[ReportView] Render categories.");
            collection.each(function(model) {
                console.log(model);
            });
        },
 
        render: function() {
            console.log("[ReportView] Render.");
            /*this.template = _.template($("#home_content").html());
            $(this.el).html(this.template);
            */
            this.loadMap();

            this.categoryList.on('reset', this.renderCategories, this);
            this.categoryList.fetch();

            this.delegateEvents();
            return this;
        }

    });

    return ReportView;
});