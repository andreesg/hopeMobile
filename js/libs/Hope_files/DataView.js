/*
|--------------------------------------------------------------------------
| Data View
|--------------------------------------------------------------------------
|
| This view will be erased
|
|
*/
var DataView = Backbone.View.extend({
	id: 'data_pane',
	loaded: false,

	initialize: function() {
		_.bindAll(this, 'load', 'unload', 'isLoaded', 'hide', 'show', 'exitHook', 'initHook');

		dispatcher.bind("hello", function(data) {
			alert(data);
		})
	},

	load: function() {
		this.scope_list = new ScopeListView({
			el: $('#scope_list')
		});
		this.loaded = true;
	},

	unload: function() {
		this.loaded = false;
	},

	isLoaded: function() {
		return this.loaded;
	},

	hide: function() {
		$("#" + this.id).hide();
	},

	show: function() {
		$("#" + this.id).show();
	},

	exitHook: function() {
		this.options.app.log('Exiting DataView');
	},

	initHook: function() {
		this.options.app.log('Initing DataView');
		var that = this; //Pointer to this object to use in triggers

		if (!this.layout) {
			$('#data_pane').show();

			this.layout = $('#data_pane').layout({
				initClosed: false,
				center__paneSelector: ".middle-center",
				west__paneSelector: ".middle-west",
				east__paneSelector: ".middle-east",
				west__size: '15%',
				east__size: '20%',
				east__resizable: true,
				minSize: 30,
				spacing_open: 8, // ALL panes
				spacing_closed: 8, // ALL panes
				west__spacing_closed: 12
			});

			this.center_layout = $('#data_pane_center').layout({
				initClosed: false,
				center__paneSelector: "#data_map",
				south__paneSelector: "#objects_list",
				south__size: "20%",
				minSize: 30,
				spacing_open: 8, // ALL panes
				spacing_closed: 8, // ALL panes
			});

		} else {
			this.layout.resizeAll();
			this.center_layout.resizeAll();
		}

		if (!this.mapHandler) {
			this.mapHandler = new DataMapHandler({
				container: $('#' + this.id)
			});
		}

		this.inspector = new CollectionViewer();

		$("#object_details").append(this.inspector.el);

		/*dispatcher.bind("loadObject", function(id) {

			$(that.inspector.el).trigger("loadView", new ElementView({
				element_id: id
			}));
			console.log("loadObject triggered");
		});*/

		dispatcher.bind("loadView", function(view) {
			$(that.inspector.el).trigger("loadView", view);
			console.log("loaded new view");
		});

		this.layout.resizeAll();
		this.center_layout.resizeAll();

		$('html').click(function() {
			if (app.currentView.activePopover)
				app.currentView.activePopover.popover('hide');
		});
	}
});


/*
|--------------------------------------------------------------------------
| Scope List View
|--------------------------------------------------------------------------
|
| This view will be erased
|
|
*/
var ScopeListView = Backbone.View.extend({

	events: {
		'change select.scope_list': 'loadCategory'
	},

	initialize: function() {
		_.bindAll(this, 'render', 'loadCategory');
		this.scopeList = new ScopeList();

		this.scopeList.bind('refresh', this.render);

		this.scopeList.fetch();
	},

	render: function() {

		$(this.el).html($('#scope_list_template').jqote({
			scopes: this.scopeList.models
		}));

		this.loadCategory();
		return this;
	},

	loadCategory: function() {
		var idx = $(this.el).find('select').val();
		this.category_list = new CategoryListView({
			el: $('#category_list'),
			scope_id: idx
		});
	}

});


var ElementView = Backbone.View.extend({

	events: {
		'click .detail': 'showRecord',
		'click .delete_occurrence': 'deleteOccurrence',
	},

	initialize: function() {
		_.bindAll(this, 'render', 'showRecord', 'deleteOccurrence');

		this.model = new Element({
			_id: {
				"$oid": this.options.element_id
			}
		});

		this.model.fetchWithSchema();
		this.model.bind('updateSchema', this.render);

	},

	deleteOccurrence: function(evt) {
		var that = this;
		this.model.destroy({
			'success': function(model, resp) {
				$(that.el).html("")
			}
		});

		return evt.preventDefault();
	},

	showRecord: function(evt) {

		new RecordView({
			model: this.model
		});

		evt.preventDefault();
		evt.stopPropagation();
	},

	render: function() {
		if (this.model == undefined || this.model.schema == undefined) return this;

		if (app.currentView.mapHandler)
			app.currentView.mapHandler.drawRecord(this.model);

		$(this.el).html($('#data_element_template').jqote());

		this.inspector = new InspectorTableView({
			el: $('.inspector_placeholder', this.el),
			edit: true,
			model: this.model,
			temporary: false
		});

		return this;
	}
});
