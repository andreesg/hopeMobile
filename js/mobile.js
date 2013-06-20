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
            "async": "libs/async",
            "goog": "libs/goog"
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
require(["jquery", "backbone", "routers/mobileRouter"], function($, Backbone, Mobile) {

      $(document).on("mobileinit",
      // Set up the "mobileinit" handler before requiring jQuery Mobile's module

      function() {
            // Prevents all anchor click handling including the addition of active button state and alternate link bluring.
            $.mobile.linkBindingEnabled = false;

            // Disabling this will prevent jQuery Mobile from handling hash changes
            $.mobile.hashListeningEnabled = false;
            $.mobile.defaultPageTransition = "slide";

      });

      require(["jquerymobile"], function() {
            app = new Mobile();
      });

      function onDeviceReady() {
            // on device ready
      }
      $(document).ready(function() {
            $(document).bind('deviceready', function() {
                  // Phonegap ready
                  onDeviceReady();
            });
      });
});