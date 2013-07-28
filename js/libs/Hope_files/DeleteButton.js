OpenLayers.Control.DeleteButton = OpenLayers.Class(OpenLayers.Control, {
	
	type: OpenLayers.Control.TYPE_TOOL,
	
	initialize: function(layer, options) {
		if (!options){ options = {} }
		if (!options.displayClass) options.displayClass =  "deleteButton";
			
		OpenLayers.Control.prototype.initialize.apply(this, [options]);
		this.layer = layer;
		this.map = this.layer.map;
		
		this.control = new OpenLayers.Control.DeleteFeature(this.layer);
		this.map.addControl(this.control);
		this.control.deactivate();
	},
	
	activate: function(){
		var activated = OpenLayers.Control.prototype.activate.apply(this,arguments);
		this.control.activate();
	},
	
	deactivate: function(){
		var deactivated = OpenLayers.Control.prototype.deactivate.apply(this,arguments);
		this.control.deactivate();
	},

    CLASS_NAME: "OpenLayers.Control.DeleteButton"
});
