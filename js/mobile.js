// Sets the require.js configuration for your application.
require.config({

      // 3rd party script alias names (Easier to type "jquery" than "libs/jquery-1.8.2.min")
      paths: {

            // Core Libraries
            "jquery": "libs/jquery",
            "jquerymobile": "libs/jquerymobile",
            "underscore": "libs/lodash",
            "backbone": "libs/backbone",
            "cordova": "libs/cordova-2.7.0",
            "gmap": "libs/jquery.ui.map",
            "jqueryui": "libs/jquery.ui.map.extensions",
            "async": "libs/async",
            "goog": "libs/goog",
            "photoswipe": "libs/photoswipe",
            "fastclick": "libs/fastclick"
      },

      // Sets the configuration for your third party scripts that are not AMD compatible
      shim: {

            "backbone": {
                  "deps": ["underscore", "jquery"],
                  "exports": "Backbone" //attaches "Backbone" to the window object
            }
      } // end Shim Configuration

});

// Includes File Dependencies
require(["jquery", "backbone", "cordova","fastclick", "routers/mobileRouter"], function($, Backbone, Cordova, FastClick, MobileRouter) {

      $(document).on("mobileinit",
      // Set up the "mobileinit" handler before requiring jQuery Mobile's module

      function() {
            $.mobile.ajaxEnabled = false;
            // Prevents all anchor click handling including the addition of active button state and alternate link bluring.
            $.mobile.linkBindingEnabled = false;
            $.mobile.listview.prototype.options.icon = "";

            // Disabling this will prevent jQuery Mobile from handling hash changes
            $.mobile.hashListeningEnabled = false;

            // set default page transition to slide
            $.mobile.defaultPageTransition = "slide";
            $.mobile.pushStateEnabled = false;
            $.mobile.buttonMarkup.hoverDelay = 0;


      });

      require(["jquerymobile", "gmap", "fastclick"], function() {
            $(function() {
                  FastClick.attach(document.body);
            });
            app = new MobileRouter();
      });

      function onDeviceReady() {
            // on device ready
            // require jquery mobile module
            // INIT APP
            
      }

      $(document).ready(function() {
            $(document).bind('deviceready', function() {
                  // Phonegap ready
                  onDeviceReady();
            });
      });
});