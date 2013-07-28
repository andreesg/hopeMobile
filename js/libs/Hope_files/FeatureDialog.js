/*
|--------------------------------------------------------------------------
| Feature Dialog View
|--------------------------------------------------------------------------
|
| View object that displays and edit a single element data
|
*/

var FeatureDialog = Backbone.View.extend({
	id: 'selected_container',
	renderLock: false,
	selectedFeature: null,

	events: {
		'submit form': 'saveModel',
	},

	initialize: function() {
		_.bindAll(this, 'render', 'load', 'unload', 'hide', 'show', 'loadFeature', 'loadInfo', 'onDetail');
		console.log("loading feature dialog");
		this.options.mapHandler.on('selectFeature', this.loadFeature, this);
		// comes from DataView
		var that = this;
		dispatcher.on("loadObject", function(id) {
			console.log("loadObject triggered");
			that.loadElement(id);
		});

		// make x-editable inline
		$.fn.editable.defaults.mode = 'popup';

		this.render();
		this.loadInfo();
	},

	/**
	 *
	 * function that saves updated data
	 * receives evt and params from
	 * x-editable on save event
	 *
	 **/
	saveModel: function(evt, params) {
		console.log(evt);
		console.log(params);

		var key = evt.target.name;
		var schema = this.model.schema;
		var data = {};

		if (key in schema.attributes) {
			var _features = this.model.get(_features);
			this.model.attributes._features = undefined;

			data[key] = params.newValue;

			this.model.save(data, {
				success: function() {
					// display alerts
					console.log("model saved");
				},
				error: function() {
					console.log("error saving model");
				}
			});

			this.model.attributes._features = _features;
		}

		return false;

	},

	/* -- HELPERS -- */
	show: function() {
		$(this.el).parent().show();
	},

	hide: function() {
		$(this.el).parent().hide();
	},

	load: function() {
		this.render();
	},

	unload: function() {
		this.remove()
		this.renderLock = false;
	},
	/* -- / -- */

	onDetail: function(evt) {
		var mdl = this.elementsList.get(evt.target.rel);

		new RecordView({
			model: mdl
		});

		evt.preventDefault();
	},

	/**
	 *
	 * callback function that is responsible
	 * to load the model data from the backend.
	 * This function is listening to the 'selectFeature'
	 * event, that's triggered on MapHandler.js
	 *
	 **/

	loadFeature: function(feature) {

		if (this.selectedFeature) {
			this.selectedFeature = null;
			$(this.el).fadeOut('fast');
		}

		this.selectedFeature = feature;
		this.model = this.selectedFeature;

		this.model.fetchWithSchema({
			success: function() {
				app.log('got model');
			}
		});

		this.model.on('updateSchema', this.loadInfo);

		$(this.el).fadeIn('fast');
	},

	/**
	 *
	 * callback function that is responsible
	 * to load the model data from the backend.
	 * This function is listening to the 'loadObject'
	 * event, that's triggered on DataView.js/elementsListView
	 *
	 **/

	loadElement: function(id) {
		if(this.selectedFeature) {
			this.selectedFeature = null;
			$(this.el).fadeOut('fast');
		}
		
		this.model = new Element({
			_id: {
				"$oid": id
			}
		});

		this.selectedFeature = this.model;

		this.model.fetchWithSchema();
		this.model.on('updateSchema', this.loadInfo);

		$(this.el).fadeIn('fast');

	},

	/**
	 *
	 * helper function to work with x-editable
	 * it needs to check the type of data being
	 * rendered and fetch the possible attributes
	 * for instance, select options
	 *
	 **/
	chooseDataType: function(type) {

	},

	/**
	 *
	 * this is a callback function of loadFeature, 'updateSchema'
	 * event trigger when a map selection is performed. it's responsible
	 * to display the selected element specifications and render it
	 * editable.
	 *
	 **/
	loadInfo: function() {
		$(this.el).html("");
		$(this.el).undelegate();
		$(this.el).off();

		if (this.selectedFeature) {

			console.log(this.model.schema);

			var template = _.template($("#selected-feature-content").html());
			$("#selected_container").html(template);


			if (this.model.schema) {

				/* attributes object properties - name, readable, type */
				var r = 0;

				for (attr_key in this.model.schema.attributes) {

					var attr = this.model.schema.get(attr_key);
					var attr_val = this.model.get(attr_key);
					var table = $("#selected-feature-table");
					attr_val = attr_val == null ? '' : attr_val;

					console.log(attr);

					if (attr_key[0] == '_') {
						continue;
					}

					if (attr.type == 'array#photo') {
						$("#thumbs").off();
						$("#image_gallery_new").off();
						$("#thumbs").undelegate();

						var _photos = attr_val;
						var divid = _.uniqueId('thumbs_');
						var gtemplate = _.template($("#new-photos-gallery").html(), {
							photos: _photos, divid : divid
						});
 
						$("#image_gallery_new").html(gtemplate);

						console.log($.fn.touchTouch);
						// initialize touchTouch()
						$("#thumbs a").touchTouch();
					} else {
						table.append('<tr><td width="15%">' + attr.readable + '</td><td width="50%"><a href="#" class="editable" id="' + attr.readable + '" name="' + attr.name + '" data-type="text">' + attr_val + '</a></td><td width="35%"><span class="muted">' + attr.type + '</span></td></tr>');
					}
				}

			}

			$("#element-specs").fadeIn();
			$('body').scrollTo("#element-specs", {
				duration: 'slow'
			});

			// initialize x-editable()
			$('.editable').editable();
			var that = this;
			$('.editable').on('save', function(e, params) {
				that.saveModel(e, params);
			});

		} else {
			$(this.el).html('<p>Sem nenhuma feature selecionada</p>');
		}
	},

	/**
	 *
	 *	Renders Category List
	 *	ready to be killed
	 **/
	render: function() {
		if (!this.renderLock) {
			this.renderLock = true;
			$(this.options.container).append(this.el);
		}
	}
});