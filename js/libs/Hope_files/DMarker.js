/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Marker.js
 */

/**
 * Class: OpenLayers.Marker.Box
 *
 * Inherits from:
 *  - <OpenLayers.Marker> 
 */
OpenLayers.Marker.DMarker = OpenLayers.Class(OpenLayers.Marker, {

    /** 
     * Property: lonlat 
     * {<OpenLayers.LonLat>} 
     */
    lonlat: null,

    /** 
     * Property: div 
     * {DOMElement} 
     */
    div: null,
    
    /** 
     * Constructor: OpenLayers.Marker.Box
     *
     * Parameters:
     * lonlat - {<OpenLayers.LonLat>} the position of this marker
     * borderColor - {String} 
     * borderWidth - {int} 
     */
    initialize: function(lonlat, borderColor, borderWidth) {
        this.lonlat = lonlat;
        this.div    = OpenLayers.Util.createDiv();
        this.div.style.overflow = 'hidden';
        this.events = new OpenLayers.Events(this, this.div, null);
        this.setBorder(borderColor, borderWidth);
    },

    /**
     * Method: destroy 
     */    
    destroy: function() {

        this.lonlat = null;
        this.div = null;

        OpenLayers.Marker.prototype.destroy.apply(this, arguments);
    },

    /** 
     * Method: setBorder
     * Allow the user to change the box's color and border width
     * 
     * Parameters:
     * color - {String} Default is "red"
     * width - {int} Default is 2
     */
    setBorder: function (color, width) {
        if (!color) {
            color = "red";
        }
        if (!width) {
            width = 2;
        }
        this.div.style.border = width + "px solid " + color;
    },
    
    /** 
    * Method: draw
    * 
    * Parameters:
    * px - {<OpenLayers.Pixel>} 
    * sz - {<OpenLayers.Size>} 
    * 
    * Returns: 
    * {DOMElement} A new DOM Image with this marker´s icon set at the 
    *         location passed-in
    */
    draw: function(px, sz) {
        OpenLayers.Util.modifyDOMElement(this.div, null, px, sz);
        return this.div;
    }, 

    /**
     * Method: onScreen
     * 
     * Rreturn:
     * {Boolean} Whether or not the marker is currently visible on screen.
     */
    onScreen:function() {
        var onScreen = false;
        if (this.map) {
            var screenBounds = this.map.getExtent();
            onScreen = screenBounds.containsBounds(this.lonlat);
        }    
        return onScreen;
    },
    
    /**
     * Method: display
     * Hide or show the icon
     * 
     * Parameters:
     * display - {Boolean} 
     */
    display: function(display) {
        this.div.style.display = (display) ? "" : "none";
    },

    CLASS_NAME: "OpenLayers.Marker.DMarker"
});

