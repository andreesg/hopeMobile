OpenLayers.Control.ModifyButton = OpenLayers.Class(OpenLayers.Control, {
	
	type: OpenLayers.Control.TYPE_TOOL,
	
	initialize: function(layer, options) {
		OpenLayers.Control.prototype.initialize.apply(this, [options]);
		this.layer = layer;
		this.map = this.layer.map;
		
		this.control = new OpenLayers.Control.ModifyFeature(this.layer);
		this.control.deactivate();
		this.map.addControl(this.control);
		
	},
	
	activate: function(){
		var activated = OpenLayers.Control.prototype.activate.apply(this,arguments);
		if (activated){
			this.control.activate();
		}
	},
	
	deactivate: function(){
		var deactivated = OpenLayers.Control.prototype.deactivate.apply(this,arguments);
		if (deactivated){
			this.control.deactivate();
			app.log('deactivating modify tool');
		}
	},

    CLASS_NAME: "OpenLayers.Control.ModifyButton"
});
