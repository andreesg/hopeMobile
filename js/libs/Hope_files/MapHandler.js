var MapHandler = Backbone.View.extend({
	id: "map_canvas",
	categories: [],
	shapeOccurrences: [],
	bingApi: "Ajh4bRNoW057FZF_guDijh3eb1fSSyT8KvN3WoQcxqnwtXK9jLIAxY5Tl8iYssoY",


	initialize: function() {
		_.bindAll(this, 'render', 'hide', 'show', 'load', 'unload', 'renderShapes', 'renderResultsShapes', 'countShapeOccurrences', 'onFeatureSelect', 'updateCategories', 'updateMapFeatures');

		if ((typeof google) == 'undefined') {
			new Error({
				message: 'Oops. Sem ligação à rede.'
			});
		} else {
			this.projection = new OpenLayers.Projection("EPSG:4326");

			var options = {
				controls: [
					new OpenLayers.Control.Navigation({zoomWheelEnabled:false}),
					new OpenLayers.Control.PanZoomBar(),
					new OpenLayers.Control.LayerSwitcher({
						'ascending': false
					}),
					new OpenLayers.Control.ScaleLine(),
					new OpenLayers.Control.KeyboardDefaults()
				]
			}
			this.mapObj = new OpenLayers.Map(this.id, options);

			var satLayer = new OpenLayers.Layer.Google("Google Sattelite", {
				type: google.maps.MapTypeId.SATELLITE,
				minZoomLevel: 3,
				maxZoomLevel: 20,
				tilt: 0,
				zoomWheelEnabled:false
			});

			var gsat = satLayer;

			var groad = new OpenLayers.Layer.Google("Google RoadMap", {
				type: google.maps.MapTypeId.ROADMAP,
				minZoomLevel: 3,
				maxZoomLevel: 20,
				zoomWheelEnabled:false
			});

			var bRoad = new OpenLayers.Layer.Bing({
                name: "Bing Road",
                key: this.bingApi,
                type: "Road"
            });
        
	        var bHybrid = new OpenLayers.Layer.Bing({
	                name: "Bing Hybrid",
	                key: this.bingApi,
	                type: "AerialWithLabels"
	            });
	        
	        var bAerial = new OpenLayers.Layer.Bing({
	                name: "Bing Aerial",
	                key: this.bingApi,
	                type: "Aerial"
	        	});		
 
 
			var osm = new OpenLayers.Layer.OSM();

			this.mapObj.addLayers([osm, groad, gsat, bRoad, bHybrid, bAerial]);

			var latlng = [40.2, -8.416667] //Coimbra's coordinates

			this.mapObj.setCenter(new OpenLayers.LonLat(latlng[1], latlng[0]).transform(
				this.projection,
				this.mapObj.getProjectionObject()), 15);
			var style = new OpenLayers.Style({
				strokeColor: "${strokeColor}",
				//strokeColor: "#ff0000",
				strokeOpacity: 1,
				strokeWidth: "${strokeWidth}",
				//strokeWidth: "2",
				strokeDashstyle: "${strokeDashstyle}",
				fillColor: "#FFFFFF",
				fillOpacity: 0.1,
				pointRadius: this.mapObj.getZoom() / 10,
				pointerEvents: "visiblePainted",

				fontColor: "#ff0000",
				fontSize: "15px",
				fontFamily: "Courier New, monospace",
				fontWeight: "bold",
				labelAlign: "lb"
			}, {
				context: {
					strokeColor: function(f) {
						return f.attributes.style.strokeColor;
					},
					strokeWidth: function(f) {
						return f.attributes.style.strokeWidth + 2;
					},
					strokeDashstyle: function(f) {
						return f.attributes.style.strokeDashstyle;
					}
				}
			});

			this.results_layer = new OpenLayers.Layer.Vector('Resultados de pesquisa', {
				styleMap: new OpenLayers.StyleMap({
					'default': style
				}),
			});


			this.features_layer = new OpenLayers.Layer.Vector("Levantamento", {
				styleMap: new OpenLayers.StyleMap({
					'default': style
				})
			});

			this.mapObj.addLayer(this.results_layer);
			this.mapObj.addLayer(this.features_layer);

			this.selectControl = new OpenLayers.Control.SelectFeature(
				this.features_layer, {
				onSelect: this.onFeatureSelect,
				clickout: true,
				toggle: false,
				multiple: false,
				hover: false
			});
			this.mapObj.addControl(this.selectControl);
			this.selectControl.activate();

			/* 
				Add map events 
				here
			*/

			this._selectedFeature = null;

			$(".olMapViewport").append('<button class="btn btn-blue olRecenterMap" style="position: relative;z-index: 10000;float: right;top: 450px;right: 10px;"> Recenter Map </button>');
			var that = this;
			$(".olRecenterMap").on('click', function() {
				that.setMapCenter();
			});

			dispatcher.on('recenterMap', this.setMapCenter, this);

		}

	},

	setMapCenter: function() {
		console.log("SET MAP CENTER TRIGGERED");
		if (window.app.lat && window.app.lng) {
			latlng = [window.app.lat, window.app.lng];
		}

		this.mapObj.setCenter(new OpenLayers.LonLat(latlng[1], latlng[0]).transform(
			this.projection,
			this.mapObj.getProjectionObject()), 16);
	},

	updateMapFeatures: function() {

		app.log("updating map features");
		BarNotification.init({message: 'Please wait! Loading data...', type: 'alert', fixed:true, timer:20000}); 

		this.addOpacity();

		var bounds = this.mapObj.getExtent().transform(this.mapObj.getProjectionObject(), this.projection);

		if (this.shapeList)
			this.shapeList = null;

		this.shapeList = new ShapeList(null, {
			occurrences: true
		});

		if (this.elementsList)
			this.elementsList = null;

		this.elementsList = new ElementsList(null, {
			scopeId: 1
		});

		this.shapeList.on('reset', this.renderShapes);
		this.elementsList.on('reset', this.renderShapes);

		this.shapeList.view = this;
		this.shapeList.fetch({
			success: function(model, res) {
				app.log("got shapeList");
			}

		});

		this.shapeOccurrences = null;
		var that = this;
		this.elementsList.view = this;
		this.elementsList.fetch({
			success: function(model, res) {

				/* display alert information */
				BarNotification.init({message: 'Successfully loaded all data!', type: 'info'});

				that.removeOpacity();
				console.log("elementsList");
				that.elementsList;
				//$("#results_counter").html(10);

				app.log("got occurrenceList");
			}
		});
	},

	onFeatureSelect: function(feature) {

		_selectedFeature = feature;

		// sync shapes with cids/models
		this.renderShapes();

		this.trigger('selectFeature', this.elementsList.get(feature.attributes.cid));

		var in_options = {
			'internalProjection': this.mapObj.baseLayer.projection,
			'externalProjection': new OpenLayers.Projection("EPSG:4326")
		};

		var geojson_format = new OpenLayers.Format.GeoJSON(in_options);
		var elms = this.elementsList.get(feature.attributes.cid);
		var features = elms.get('_features');

		for (var i = 0, len = features.length; i < len; i++) {
			this.selectControl.highlight(features[i]);
		}
	},

	countShapeOccurrences: function(shapeid) {
		var that = this;
		var categories = oc(this.categories);

		this.shapeOccurrences = _(this.elementsList.models).chain()
			.map(function(model) {

			if (model.get('category')['$oid'] in categories)
				return model.get('segments');
			else
				return [];
		})
			.flatten()
			.reduce(function(counts, segment) {
			counts[segment] = (counts[segment] || 0) + 1;
			return counts;
		}, {}).value();

	},

	updateCategories: function(categories) {
		this.categories = categories;
		this.renderShapes();

		//this.updateMapFeatures();
	},

	renderShapes: function() {

		console.log("Render Shapes");

		if (this.features_layer) {
			this.features_layer.destroyFeatures();
		}

		if (this.marker_layer) {
			if (this.mapObj.getLayer(this.marker_layer.id))
				this.mapObj.removeLayer(this.marker_layer);
		}

		var in_options = {
			'internalProjection': this.mapObj.baseLayer.projection,
			'externalProjection': new OpenLayers.Projection("EPSG:4326")
		};

		var geojson_format = new OpenLayers.Format.GeoJSON(in_options);

		var that = this;
		var categories_list = oc(this.categories);

		var attr = {
			strokeColor: "#555555",
			strokeOpacity: 0.6,
			strokeWidth: "1px",
			strokeDashstyle: "solid",
		}

		var colors = {
			'4f159b20e6e0fa58fab306f0': "#FFFF00",
			'4f159b20e6e0fa58fab306f1': "#595808",
			'4f159b20e6e0fa58fab306f5': "#3636010",
			'4f159b20e6e0fa58fab306f6': "#1d4c9a",
			'4f159b20e6e0fa58fab306f8': "#5f3483",
			'4f159b20e6e0fa58fab306f7': "#62fed1",
			'4f159b20e6e0fa58fab306f3': "#97c1e8",
			'4f159b20e6e0fa58fab306f2': "#6de642"
		}

		this.elementsList.each(function(model) {
			var features = geojson_format.read(model.get('geom'));

			if (features && model.get('category')["$oid"] in categories_list) {
				for (var i in features) {
					var catid = model.get('category')['$oid']
					// set current model cid
					features[i].attributes.cid = model.cid;

					// set feature styles
					features[i].attributes.style = {};
					features[i].attributes.style.strokeColor = attr.strokeColor;
					features[i].attributes.style.strokeWidth = attr.strokeWidth;
					features[i].attributes.style.strokeDashstyle = attr.strokeDashstyle;

					if (colors[catid]) {
						features[i].attributes.style.strokeColor = colors[catid];
					} else {
						/* Log category id */
						//console.log(catid);
					}
				}
				model.set({
					"_features": features
				});
				that.features_layer.addFeatures(features);
			}
		})
	},

	renderResultsShapes: function(model, options) {
		if (typeof(options) == 'undefined') {
			var options = {};
		}

		if (this.results_layer && options.reset) {
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

		if (options.colorize) {
			attr.strokeColor = this.getHexShade(options.value, options.color_from, options.color_to)
			attr.fillColor = this.getHexShade(options.value, options.color_from, options.color_to)
		}

		var features = geojson_format.read(model.get('geom'));

		for (var i in features) {
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

		if (features == null) {
			features = [];
		}
		model.set({
			"_features": features
		});
		console.log(features);
		this.results_layer.addFeatures(features);
	},


	show: function() {
		$(this.el).fadeIn('fast');
	},

	hide: function() {
		$(this.el).fadeOut('fast');
	},

	addOpacity: function() {
		var el = $("#results_container");
		var el2 = $("#operations_container");
		el.css("opacity", "0.4");
		el.css("filter", "alpha(opacity=40)");
		el2.css("opacity", "0.4");
		el2.css("filter", "alpha(opacity=40)");
	},

	removeOpacity: function() {
		var el = $("#results_container");
		var el2 = $("#operations_container");
		el.css("opacity", "1");
		el.css("filter", "alpha(opacity=100)");
		el2.css("opacity", "1");
		el2.css("filter", "alpha(opacity=100)");
	},

	load: function() {
		this.render();
	},

	unload: function() {
		this.hide();
	},

	getBBox: function() {
		return this.mapObj.getExtent();
	},

	drawRecord: function(model) {
		this.renderShapes(model);
	},

	clearMap: function() {
		this.results_layer.destroyFeatures();
	},

	getHexShade: function(value, color1, color2) {
		//Assumes value is between 0 and 1, also colors are an array with 3 elements (R,G,B)
		var red = color1[0] * (1 - value) + color2[0] * (value)
		var green = color1[1] * (1 - value) + color2[1] * (value)
		var blue = color1[2] * (1 - value) + color2[2] * (value)

		var final_color = [Math.round(red).toString(16), Math.round(green).toString(16), Math.round(blue).toString(16)]

		for (var k = 0; k < 3; k++) {
			if (final_color[k].length == 1)
				final_color[k] = "0" + final_color[k];
		}

		var color = "#" + final_color[0] + final_color[1] + final_color[2]

		return color;
	}
});
