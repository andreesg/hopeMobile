/*
|--------------------------------------------------------------------------
| Editor View
|--------------------------------------------------------------------------
|
| 'Front Controller' to #map view. It's the parent view that creates
|  the MapHandler View to display content on map, the FeatureDialog 
|  view that displays a selected element data, and the operationMapView
|  that allows to search elements
|
*/
var EditorView = Backbone.View.extend({
	loaded: false,
	el: "#search-page",
	template: "#search-page-template",

	initialize: function() {
		_.bindAll(this, 'resizeMap', 'load', 'unload', 'isLoaded', 'hide', 'hideAlert', 'show', 'exitHook', 'initHook', 'loadTest', 'displayAlert');
	},

	resizeMap: function() {
		console.log("Resizing Map");
		
		this.mapHandler.mapObj.updateSize();
		$("div#map-middle-center").height($('body').innerHeight() - $('div#header').innerHeight());
		this.mapHandler.mapObj.updateSize();
	},


	displayAlert: function(head, body, type) {
		var msg = {};
		msg.head = head;
		msg.body = body;
		msg.type = type;
		var el = $("#alert-container");

		var template = _.template($("#alert-template").html(), {
			message: msg
		});
		el.html(template);
		el.fadeIn();
	},


	load: function() {

		if (!this.isLoaded()) {

			this.renderSearchTemplate();

			if (!this.mapHandler) {
				this.mapHandler = new MapHandler();
				this.mapHandler.on('dataLoaded', this.displayAlert, this);
				this.mapHandler.on('hideAlert', this.hideAlert, this);
			}

			this.mapHandler.load();

			if (!this.operationView)
				this.operationView = new OperationMapView({
					mapHandler: this.mapHandler
				});

			if (!this.featureDialog)
				this.featureDialog = new FeatureDialog({
					mapHandler: this.mapHandler
				});
			this.featureDialog.load();

			this.loaded = true;
		}
	},

	renderSearchTemplate: function() {
		console.log("render search page");
		var page = _.template($(this.template).html());
		$("#page").append(page);
		this.rendered = true;
	},

	unload: function() {
		this.loaded = false;
		//this.categoriesDialog.unload();
		//this.featureDialog.unload();
		//this.mapHandler.unload();
	},

	isLoaded: function() {
		return this.loaded;
	},

	hide: function() {
		$("#search-page").hide();
		if (this.featureDialog) this.featureDialog.hide();
		if (this.optionsDialog) this.optionsDialog.hide();
	},

	hideAlert: function() {
		$("#alert-container").fadeOut();
	},

	show: function() {
		$("#search-page").show();

		if (this.featureDialog) this.featureDialog.show();
		if (this.optionsDialog) this.optionsDialog.show();
	},

	exitHook: function() {
		this.options.app.log('Exiting EditorView');
	},

	initHook: function() {
		this.options.app.log('Initing EditorView');

		if (this.mapHandler) {
			this.options.app.log('triggering shape refresh');
			this.mapHandler.updateMapFeatures();
		}
		
		this.resizeMap();
	},

	loadTest: function() {
		$.ajax({
			//url: '/media/main/hawaii_mod.json',
			dataType: 'json',
			url: '/1/shapes/?format=geojson',
			success: function(resp, status) {
				var in_options = {
					'internalProjection': this.mapHandler.mapObj.baseLayer.projection,
					'externalProjection': new OpenLayers.Projection("EPSG:4326")
				};

				var geojson_format = new OpenLayers.Format.GeoJSON(in_options);
				var vector_layer = new OpenLayers.Layer.Vector("Elements Layer");

				this.mapHandler.mapObj.addLayer(vector_layer);

				var features = geojson_format.read(resp);

				if (features) {
					vector_layer.addFeatures(features);
				}

				/* display alert information */
				if (features.length > 0) {
					this.displayAlert("Done!", "Displaying " + features.length + " results", "-info");
				} else {
					BarNotification.init({message: "We couldn't find any results.", type: 'alert'});
				}


			},
			error: function(jqXHR, textStatus, errorThrown) {
				new Error({
					message: 'Oops. Algo correu mal. Por favor tente novamente. (' + textStatus + ')'
				});
			}

		});
	},
});



/*
|--------------------------------------------------------------------------
| Operation Map View
|--------------------------------------------------------------------------
|
| description
|
*/
var OperationMapView = Backbone.View.extend({
	id: 'operations_container',
	categoryList: new CategoryList(null, {
		scope: 1
	}),

	initialize: function() {
		var that = this;
		/* Log cateogry list */
		//this.categoryList = new CategoryList(null,{scope: 1});	
		//console.log(this.categoryList);
		this.categoryList.fetch().then(function() {
			that.categoryList;
			var categoriesTree = that.buildSingle(that.categoryList.models);
			that.render(categoriesTree);
		});
	},

	events: {
		'change .category-select': 'onCategorySelect'
	},

	render: function(categories) {
		var template = _.template($("#operations-action-search").html(), {
			cat: categories
		});
		$("#" + this.id).html(template);

		$('.category-select').select2();

		//needs to send an object with reference to this view	
		$("select.category-select").on('change', {
			mapHandler: this.options.mapHandler,
			cat: categories
		}, this.onCategorySelect);
		return this;
	},


	/**
	 *
	 * buildTree creates the Hierarchical elements model
	 * and returns a tree structure to be used on category
	 * selection
	 *
	 **/
	buildTree: function(data, parent) {
		var initialData = data;
		var tree = [];

		var i = 0;
		for (var i = 0; i < initialData.length; i++) {
			if ((initialData[i].attributes.parent != null && initialData[i].attributes.parent['$oid'] == parent) ||
				(parent == null && initialData[i].attributes.parent == null)) {

				obj = {
					attr: {
						"id": initialData[i].attributes['_id']['$oid']
					},
					data: initialData[i].attributes.name,
					//id: initialData[i].attributes['_id']['$oid'],
					children: this.buildTree(initialData, initialData[i].attributes['_id']['$oid'])
				}
				tree.push(obj);
			}
		}
		return tree;
	},

	/**
	 *
	 * single elements model
	 *
	 **/
	buildSingle: function(data) {
		var initialData = data;
		var tree = [];

		var i = 0;
		for (var i = 0; i < initialData.length; i++) {
			obj = {
				attr: {
					"id": initialData[i].attributes['_id']['$oid']
				},
				data: initialData[i].attributes.name,
			}
				tree.push(obj);
		}
		return tree;
	},


	/**
	 *
	 * Callback function called when category list selection changes
	 * it's responsible to create the create the elements table
	 * on table view option and to update the elements displayed
	 * in the map by calling mapHandler.updateCategories()
	 *
	 **/
	onCategorySelect: function(e, data) {
		
		var catg = [];
		var categories = [];
		var children = [];
		var i;
		var that = this;
		catg = e.data.cat;
		categories.push(e.target.value);
		// e.data.mapHandler is a reference to this.options.mapHandler
		e.data.mapHandler.updateCategories(categories);

		this.schema = new Schema({
			_id: e.target.value
		});

		this.schema.view = this;
		
		BarNotification.init({message: 'Displaying ' + $("#category-sz").find("option:selected").text() + ' category.', type: 'info'});

		this.schema.fetch({
			success: function(model) {
				if (model.view.elementsList != null && model.view.elementsList.selectedObjView != undefined) {
					$(model.view.elementsList.selectedObjView.el).html('');
					if (app.currentView.mapHandler)
						app.currentView.mapHandler.recenterMap();
				}

				$('#table_data').undelegate();
				$('#table_data').unbind();

				model.view.elementsList = new ElementsListView({
					schema: model,
					el: $('#table_data')
				});
	
			}
		});

		if (categories.length > 1) {
			$('.exportelements').hide();
		} else if (categories.length == 1) {
			$('.exportelements').show();
		}
	},

	cleanView: function(element) {
		console.log("cleaning view");
		element.undelegateEvents();
		element.unbind();
	}
});

