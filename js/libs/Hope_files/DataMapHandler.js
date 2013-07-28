var DataMapHandler = Backbone.View.extend({
	id: "data_map",
	
	initialize: function(){
		_.bindAll(this, 'render', 'recenterMap', 'hide', 'show', 'load', 'unload', 'drawRecord', 'renderShapes', 'renderResultsShapes', 'onFeatureSelect', 'clearMap', 'getHexShade');

		if ((typeof google) == 'undefined') {
			new Error({ message: 'Oops. Sem ligação à rede.'});
		} else {
			this.projection = new OpenLayers.Projection("EPSG:4326");
			
			var options = { controls: [
				new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.PanZoomBar(),
				new OpenLayers.Control.LayerSwitcher({'ascending':false}),
				new OpenLayers.Control.ScaleLine(),
				new OpenLayers.Control.KeyboardDefaults()
				] 
			}
			this.mapObj = new OpenLayers.Map(this.id,options);

			var gsat = new OpenLayers.Layer.Google( "Google Sattelite",
				{	type: google.maps.MapTypeId.SATELLITE,
					minZoomLevel: 3,
					maxZoomLevel: 20
				}
			);

			var groad = new OpenLayers.Layer.Google("Google RoadMap",
				{	type: google.maps.MapTypeId.ROADMAP,
					minZoomLevel: 3,
					maxZoomLevel: 20
				}
			);

			this.mapObj.addLayers([groad, gsat]);

			var latlng = [40.2,-8.416667] //Coimbra's coordinates
			
			this.mapObj.setCenter(	new OpenLayers.LonLat(latlng[1],latlng[0]).transform(
														this.projection,
														this.mapObj.getProjectionObject()
													), 4);
			
			
			var style = new OpenLayers.Style({
					strokeColor: "${strokeColor}",
					//strokeColor: "#ff0000",
					strokeOpacity: 0.8,
					strokeWidth: "${strokeWidth}",
					//strokeWidth: "2",
					strokeDashstyle: "${strokeDashstyle}",
					//strokeDashstyle: "solid",
					fillColor: "${strokeColor}",
					fillOpacity: 0.8,
					pointRadius: this.mapObj.getZoom() / 10,
					pointerEvents: "visiblePainted",
					
					fontColor: "#ff0000",
					fontSize: "15px",
					fontFamily: "Courier New, monospace",
					fontWeight: "bold",
					labelAlign: "lb"
				}, {
					context: {
						strokeColor: function(f) { return f.attributes.style.strokeColor; },
						strokeWidth: function(f) { return f.attributes.style.strokeWidth+2; },
						strokeDashstyle: function(f) { return f.attributes.style.strokeDashstyle; }
					}
				});

			this.results_layer = new OpenLayers.Layer.Vector('Resultados de pesquisa', {
				styleMap: new OpenLayers.StyleMap({'default': style}),
			});
			
			this.features_layer = new OpenLayers.Layer.Vector("Levantamento", {
				styleMap: new OpenLayers.StyleMap({'default': style
				})
			});
		
			this.mapObj.addLayer(this.results_layer);
			this.mapObj.addLayer(this.features_layer);
			
			var controls = this.mapObj.getControlsByClass('OpenLayers.Control.Navigation');
			controls[0].activate();

			this.selectControl = new OpenLayers.Control.SelectFeature( 	this.results_layer,
																		{
																			onSelect: this.onFeatureSelect,
																			clickout: true, toggle: false,
																			multiple: false, hover: false,
																			//toggleKey: "shiftKey", 
																			// ctrl key removes from selection
																			//multipleKey: "altKey",
																			// shift key adds to selection
																			//box: true
																			}
																	);
			this.mapObj.addControl(this.selectControl);
			this.selectControl.activate();

			this.mapObj.events.register("moveend", null, this.updateMapFeatures);
		}
		
	},

	onFeatureSelect: function(feature){
		console.log("Selected map feature");
		console.log(feature);
		feature.attributes.model.trigger("map_selected");
	},

	recenterMap: function(){
		var latlng = [40.2,-8.416667] //Coimbra's coordinates
			
		this.mapObj.setCenter(	new OpenLayers.LonLat(latlng[1],latlng[0]).transform(
														this.projection,
														this.mapObj.getProjectionObject()
													), 4);
	},
	
	updateMapFeatures: function(){
		app.log("updating map features");
	},
	
	drawRecord: function(model){
		this.renderShapes(model);
	},

	clearMap: function(){
		this.results_layer.destroyFeatures();
	},

	getHexShade: function(value, color1, color2){
		//Assumes value is between 0 and 1, also colors are an array with 3 elements (R,G,B)
		var red = color1[0]*(1 - value) + color2[0]*(value)
		var green = color1[1]*(1 - value) + color2[1]*(value)
		var blue = color1[2]*(1 - value) + color2[2]*(value)

		var final_color = [Math.round(red).toString(16), Math.round(green).toString(16), Math.round(blue).toString(16)]

		for(var k=0; k<3; k++){
			if(final_color[k].length == 1)
				final_color[k] = "0"+final_color[k];
			}

		var color = "#"+final_color[0]+final_color[1]+final_color[2]

		return color;
	},

	renderResultsShapes: function(model, options){
		if(typeof(options) == 'undefined'){
			var options = {};
		}

		if(this.results_layer && options.reset){
			this.results_layer.destroyFeatures();
		}

		var in_options = {
			'internalProjection': this.mapObj.baseLayer.projection,
			'externalProjection': new OpenLayers.Projection("EPSG:4326")
		};
	
		var geojson_format = new OpenLayers.Format.GeoJSON(in_options);

		var that = this;

		var attr = {
			strokeColor: "#000000",
			fillColor: "#000000",
			strokeOpacity: 0.5,
			strokeWidth: 2,
		}

		if(options.colorize){
			attr.strokeColor = this.getHexShade(options.value, options.color_from, options.color_to)
			attr.fillColor = this.getHexShade(options.value, options.color_from, options.color_to)
		}

		var features = geojson_format.read(model.get('geom'));

		for(var i in features){
			// set current model cid
			features[i].attributes.cid = model.cid;
			features[i].attributes.model = model
				
			// set feature styles
			features[i].attributes.style = {};
			features[i].attributes.style.strokeColor = attr.strokeColor;
			features[i].attributes.style.fillColor = attr.fillColor;

			features[i].attributes.style.strokeWidth = attr.strokeWidth;
			features[i].attributes.style.strokeDashstyle = attr.strokeDashstyle;
		}

		if(features == null){
			features = [];
		}
		model.set({"_features": features });
		console.log(features);
		this.results_layer.addFeatures(features);
	},
	
	renderShapes: function(model, options){
		if(typeof(options) === 'undefined'){
			var options = {};
		}
		app.log("rendering shape"+ model.cid);
			
		if (this.features_layer && !options.keep){
			this.features_layer.destroyFeatures();
		}
		
		if (this.marker_layer && !options.keep_marks){
			if (this.mapObj.getLayer(this.marker_layer.id))
				this.mapObj.removeLayer(this.marker_layer);
		}
		
		var in_options = {
			'internalProjection': this.mapObj.baseLayer.projection,
			'externalProjection': new OpenLayers.Projection("EPSG:4326")
		};
	
		var geojson_format = new OpenLayers.Format.GeoJSON(in_options);
		
		var that = this;
		
		var customColor = false;
		if (options.color){
			customColor = true;
		}
		
		var attr = {
			strokeColor: "#FF00FF",
			strokeOpacity: 1,
			strokeWidth: 3,
			strokeDashstyle: "longdash",
		}
		
		var features = geojson_format.read(model.get('geom'));
			
		if (features){
			this.bounds = new OpenLayers.Bounds();
			
			for(var i in features){
				// set current model cid
				features[i].attributes.cid = model.cid;
					
				// set feature styles
				features[i].attributes.style = {};
				features[i].attributes.style.strokeColor = attr.strokeColor;
				features[i].attributes.style.strokeWidth = attr.strokeWidth;
				features[i].attributes.style.strokeDashstyle = attr.strokeDashstyle;
					
				if (model.get('_strokeColor')!=undefined) features[i].attributes.style.strokeColor = model.get('_strokeColor');
				if (model.get('_strokeWidth')!=undefined) features[i].attributes.style.strokeWidth = model.get('_strokeWidth');
				if (model.get('_strokeDashstyle')!=undefined) features[i].attributes.style.strokeDashstyle = model.get('_strokeDashstyle');
				
				
				// need to calculate bounds.
				features[i].geometry.calculateBounds();
				this.bounds.extend(features[i].geometry.bounds);
			}
			model.set({"_features": features });
			that.features_layer.addFeatures(features);
			
			this.mapObj.zoomToExtent(this.bounds,false);
		}
		
		
		
	},
	
	show: function(){
		$(this.el).show();
	},
	
	hide: function(){
		$(this.el).hide();
	},
	
	load: function(){
		this.render();
	},
	
	unload: function(){
		this.hide();
	},
	
	getBBox: function(){
		return this.mapObj.getExtent();
	},

});
