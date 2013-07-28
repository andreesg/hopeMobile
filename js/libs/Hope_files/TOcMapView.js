var TOcMapView = Backbone.View.extend({
	id: "toc_map",
	editMode: false,
	associateMode: false,
	controls: {},
	layers: {}, 
	bingApi: "Ajh4bRNoW057FZF_guDijh3eb1fSSyT8KvN3WoQcxqnwtXK9jLIAxY5Tl8iYssoY",
	panel: null,
	
	initialize: function() {

		_.bindAll(this, 'render', 'changeOccurrence', 'onModelChange', 'onStartEdit', 'onStopEdit', 'cancelEdit', 'onStartAssociation', 'onStopAssociation', 'cancelAssociation', 'onLoadBBBoxMap', 'onLoadEditLayer');
		this.layers.edit = new OpenLayers.Layer.Vector("Editable Geometry");

		this.projection = new OpenLayers.Projection("EPSG:4326");
		this.panel = new OpenLayers.Control.EditingToolbar(this.layers.edit);
		this.mapObj = new OpenLayers.Map({	
											div: this.id, 
											controls: 	[ 	new OpenLayers.Control.LayerSwitcher(), 
															this.panel, 
															new OpenLayers.Control.PanZoomBar(),
															new OpenLayers.Control.DragPan()
														]
										});
		
		var groad = new OpenLayers.Layer.Google("Google RoadMap",
				{	type: google.maps.MapTypeId.ROADMAP,
					minZoomLevel: 3,
					maxZoomLevel: 20,
					zoomWheelEnabled:false
				}
		);
		
		var gsat = new OpenLayers.Layer.Google( "Google Sattelite",
				{	type: google.maps.MapTypeId.SATELLITE,
					minZoomLevel: 3,
					maxZoomLevel: 20,
					zoomWheelEnabled:false
				}
			);

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

		this.mapObj.addLayers([osm,groad,gsat,bRoad,bHybrid,bAerial]);

		this.mapObj.zoomToMaxExtent();
        
		var lat = 40.2, lng = -8.416667;
		if (this.options.lat && this.options.lng){
			lat = this.options.lat;
			lng = this.options.lng;
		}
		
		this.mapObj.setCenter(	new OpenLayers.LonLat(lng,lat).transform(	this.projection,  	
																			this.mapObj.getProjectionObject())
								, 13);
		
		this.markers = new OpenLayers.Layer.Markers("Markers");
		
		this.mapObj.addLayer(this.markers);
		this.mapObj.addLayer(this.layers.edit);


		var size = new OpenLayers.Size(21,25);
		var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
		this.starticon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker-green.png',size,offset);
		this.endicon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
				
		OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '4';
		console.log(this.mapObj);
		this.panel.deactivate();

		console.log("TOC MAP RENDERED");	
	},
	
	changeOccurrence: function(occ){
		// do whatever you have to do remove previous model 
		if (this.model != undefined){
			this.model.unbind('change');
			var markers = this.markers.markers;
			this.markers.clearMarkers();
			for(marker in markers)
				delete marker;
		}
		
		
		if (occ){
			this.model = occ;
			// bind events 
			this.model.on('change', this.onModelChange);
			this.model.on('startEditGeo', this.onStartEdit);
			this.model.on('endEditGeo', this.onStopEdit);
			this.model.on('cancelEdit', this.cancelEdit);
			this.model.on('startAssociateGeo', this.onStartAssociation);
			this.model.on('endAssociateGeo', this.onStopAssociation);
			this.model.on('cancelAssociation', this.cancelAssociation);
			this.model.on('toggleControl', this.toggleControl, this);
			
			// place start and end markers
			this.bounds = new OpenLayers.Bounds();
			
			var startObj = this.model.get('geo').start;
			var startPoint = new OpenLayers.LonLat(startObj.longitude, startObj.latitude);
			
			this.markers.addMarker(new OpenLayers.Marker(	startPoint.transform( 	this.projection, 
																					this.mapObj.getProjectionObject())
															,	this.endicon.clone()));
			this.bounds.extend(startPoint);
        	
			if (this.model.get('geo').end){
				var end = this.model.get('geo').end;
				var endPoint = new OpenLayers.LonLat(end.longitude, end.latitude);
        	
				this.markers.addMarker(new OpenLayers.Marker(	endPoint.transform(	this.projection, 
																					this.mapObj.getProjectionObject())
															, 	this.starticon.clone()));
				this.bounds.extend(endPoint);
			}

			
	    	// zoom to include start and end in viewport
			this.mapObj.zoomTo(this.mapObj.getNumZoomLevels()-1);
			this.mapObj.zoomToExtent(this.bounds,false);
			
		}
	},

	toggleControl: function(controls) {

		for(key in this.drawControls) {
            var control = this.drawControls[key];
            if(controls.type == key) {
            	console.log("activating control");
                control.activate();
            } else {
                control.deactivate();
            }
        }
	},
	
	onStartAssociation: function(evt){
		app.log('Starting Associate Mode');
		this.associateMode = true;
		
		this.mapObj.zoomTo(this.mapObj.getNumZoomLevels()-1);
		this.mapObj.zoomToExtent(this.bounds,false);
		
		var bounds = this.bounds.clone().transform(this.mapObj.getProjectionObject(), this.projection)
		
		var controls = this.mapObj.getControlsByClass('OpenLayers.Control.Navigation');
		controls[0].deactivate();

		$.ajax({
			//url: '/media/main/hawaii_mod.json',
			dataType: 'json',
			data: {
				left: bounds.left,
				top: bounds.top,
				right: bounds.right,
				bottom: bounds.bottom,
				format: 'geojson'
			},
			url: window.app.project+'/shapes/',
			success: this.onLoadBBBoxMap,
			error: function(jqXHR, textStatus, errorThrown){
				new Error({ message: 'Oops. Algo correu mal. Por favor tente novamente. ('+textStatus+')'});
			}

		});
	},
	
	onStopAssociation: function(evt){
		this.associateMode = false;
		
		if (!this.base_layer) {
			app.log('no base layer!');
			return false;
		}
		var elems = [];
		
		if (!evt || !evt.cancel){
			for(elm in this.base_layer.selectedFeatures){
				elems.push(this.base_layer.selectedFeatures[elm].fid);
			}
			this.model.save({segments: elems});
		}
		
		if (this.base_layer){
			this.base_layer.destroyFeatures();
		}
		
		if (this.mapObj.getLayer(this.base_layer.id))
			this.mapObj.removeLayer(this.base_layer);
		
		var controls = this.mapObj.getControlsByClass('OpenLayers.Control.Navigation');
		controls[0].activate();
		this.mapObj.removeControl(this.selectControl);
		//this.selectControl.deactivate();
		
		app.log('stop Associate Mode');
		
	},
	
	cancelAssociation: function(evt){
		this.onStopAssociation({cancel:true});
	},
	
	cancelEdit: function(evt){
		this.onStopEdit({cancel:true});
	},
	
	onLoadBBBoxMap: function(resp, status){
		var in_options = {
			'internalProjection': this.mapObj.baseLayer.projection,
			'externalProjection': new OpenLayers.Projection("EPSG:4326")
		};
		 
		var geojson_format = new OpenLayers.Format.GeoJSON(in_options);
		this.base_layer = new OpenLayers.Layer.Vector("Visible Road"); 
		this.mapObj.addLayer(this.base_layer);
		var features = geojson_format.read(resp);
		if (features){
			this.base_layer.addFeatures(features);
			
			this.selectControl = new OpenLayers.Control.SelectFeature(
			this.base_layer,
				{
					clickout: false, toggle: true,
					multiple: true, hover: false,
					toggleKey: "shiftKey", // ctrl key removes from selection
					multipleKey: "altKey", // shift key adds to selection
					box: true
					}
				);
			this.mapObj.addControl(this.selectControl);
			this.selectControl.activate();
			
			for(elm in this.model.get('segments')){
				this.selectControl.select(this.base_layer.getFeatureByFid(this.model.get('segments')[elm]));
			}

		}
	},
	
	onStartEdit: function(){
		this.editMode = true;
		
		this.mapObj.zoomTo(this.mapObj.getNumZoomLevels()-1);
		this.mapObj.zoomToExtent(this.bounds,false);
		
		var bounds = this.bounds.clone().transform(this.mapObj.getProjectionObject(), this.projection);

		if (this.model.get('geom') && this.model.get('geom').length > 0){
			console.log("maior que 0");
			this.onLoadEditLayer(null, false);
		} else {
			$.ajax({
				dataType: 'json',
				data: {
					left: bounds.left,
					top: bounds.top,
					right: bounds.right,
					bottom: bounds.bottom,
					format: 'geojson'
				},
				url: '1/shapes/',
				success: this.onLoadEditLayer,
				error: function(jqXHR, textStatus, errorThrown){
					new Error({ message: 'Oops. Algo correu mal. Por favor tente novamente. ('+textStatus+')'});
				}
			});
		}
		this.panel.activate();
		//$("#controlToggle").show();

		app.log('starting to edit');
	},
	
	onStopEdit: function(evt){
		this.editMode = false;
		app.log('end edit');
		//$("#controlToggle").hide();
		/*
		for(key in this.drawControls) {
            var control = this.drawControls[key];
                control.deactivate();
        }*/

        this.panel.deactivate();
		//this.controls.panel.deactivate();
		//this.controls.panel.div.style.opacity = 0;
		
		if (!evt || !evt.cancel){
			var in_options = {
				'internalProjection': this.mapObj.baseLayer.projection,
				'externalProjection': new OpenLayers.Projection("EPSG:4326")
			};
			
			var geojson_format = new OpenLayers.Format.GeoJSON(in_options);
			if (this.layers.edit.features.length > 0)
				var elems = geojson_format.write(this.layers.edit.features);
			else
				var elems = [];
			this.model.save({geom: elems});
		}
		
		this.layers.edit.destroyFeatures();

	},
	
	onLoadEditLayer: function(resp, status){
		var in_options = {
			'internalProjection': this.mapObj.baseLayer.projection,
			'externalProjection': new OpenLayers.Projection("EPSG:4326")
		};
		 
		var geojson_format = new OpenLayers.Format.GeoJSON(in_options);
		
		if (status){
			var features = geojson_format.read(resp);
			
			var modelSegments = oc(this.model.get('segments'));
			var selectedFeatures = []

			for(var feat in features){
				if (features[feat].fid in modelSegments)
					selectedFeatures.push(features[feat]);
			}
		
			if (selectedFeatures.length > 0){
				this.layers.edit.addFeatures(selectedFeatures);
			}
		
		} else {
			//var bounds = new OpenLayers.Bounds();
			
			var features = geojson_format.read(this.model.get('geom'));
			
			/*for(var i in features){
				bounds.extend(features[i].geometry.getBounds());
			}*/
			
			this.layers.edit.addFeatures(features);
			
			//this.mapObj.zoomToExtent(bounds);
		}

		console.log(this.controls);
		
	},
	
	onModelChange: function(evt){
		BarNotification.init({message: 'Temporary Report changed in map!', type: 'success'});
		app.log('model has changed in map!');
	},

	render: function() {
		return this;
	}

});