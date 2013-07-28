/*
|--------------------------------------------------------------------------
| ManageView
|--------------------------------------------------------------------------
| 'Front Controller' to #manage view
| View responsible for object creation with map shape editing 
| features.
| 
*/

var ManageView = Backbone.View.extend({

	/**
	 *
	 * el: 			manage-page is the div#id 
	 * template: 	#manage-page-template, find it in templates/templates-manage.html.
	 *
	 **/
	events: {
		'click #new_attr_btn': 'newAttribute',
		'click #save_changes_btn': 'saveChanges',
		'click #cancel_changes_btn': 'cancelChanges'
	},

	loaded: false,
	editMode: false,

	/**
	 *
	 *	nothing special goes here, just initialize events
	 *
	 **/
	categoryList: new CategoryList(null, {
		scope: 1
	}),

	initialize: function() {
		_.bindAll(this, 'load', 'unload', 'isLoaded', 'hide', 'show','cleanView', 'initHook', 'exitHook','buildSingle','renderManageTemplate','newAttribute','cancelChanges','saveChanges');
		this.newAttr = 2;
	},

	load: function(options) {
		console.log("[ManageView] Load");
		if (!this.isLoaded()) {
			var that = this;
			this.renderManageTemplate();
			this.categoryList.fetch().then(function() {
				var categoriesTree = that.buildSingle(that.categoryList.models);
				that.render(categoriesTree);
			});
		}
		this.loaded = true;
	},

	/**
	 *
	 * Renders the manage template, it appends it to page div
	 *
	 **/
	renderManageTemplate: function() {
		console.log("[ManageView] Render Manage Template");
		var page = _.template($("#manage-page-template").html());
		$("#page").append(page);
	},
	
	cleanView: function(element) {
		element.undelegateEvents();
		element.unbind();
	},

	render: function(categories) {
		console.log("[ManageView] Render Categories List");
		//creates the form template skeleton	
		var template_manage = _.template($("#manage-categories-list").html(), {
			cat: categories
		});

		//console.log(template_manage);
		$("#categories_list_div").html(template_manage);
		$("#manage_cat_select").select2();

		/* NEED FIX ON EVENTS! */
		$("#new_attr_btn").click(this.newAttribute);
		$("#save_changes_btn").click(this.saveChanges);
		$("#cancel_changes_btn").click(this.cancelChanges);
		$(".delete_attr_btn").click(this.deleteAttr);
	},

	/**
	 *
	 * Functions used on click events
	 *
	 **/

	newAttribute: function(evt) {
		/* TODO */
		/* Add new attr to table */
		//console.log("click new attr btn");
		var template = _.template($("#attrtable-row").html(), {
			value: "Test",
			type: "string"
		});

		/* If POST to DJANGO success: */
		this.newAttr += 1;
		$("#newattr_count").text(this.newAttr + " new");
		$("#attrtable_body").append(template);
		$("#save_changes_btn").show();
		$("#cancel_changes_btn").show();
		$(".delete_attr_btn").click(this.deleteAttr);
	},

	saveChanges: function(evt) {
		/* TODO */
		/* Save new changes*/
	},

	cancelChanges: function(evt) {
		/* TODO */
		/* Cancel changes */
		/* Para cancelar: ir fazer o fetch dos atributos outra vez
		   e substituir a tabela de atributos existente */
		/* newAttr = 0; */
		$(".newattr").html('');
		$(".attrchanged").each(function() {
			$(this).attr("class","status-info");
			var span = $(this).find('span')[0];
			$(span).attr('class','label label-green');
			$(span).text("");
		});
		
		$("#save_changes_btn").hide();
		$("#cancel_changes_btn").hide();
	},

	deleteAttr: function(evt) {
		console.log("click on delete attr");
		evt.preventDefault();
		var tr = $(this).closest('tr');
		tr.attr('class','status-error attrchanged');
		var span = tr.find('span')[0];
		$(span).attr('class','label label-red');
		$(span).text("delete");
		$("#save_changes_btn").show();
		$("#cancel_changes_btn").show();
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

	/* --- HELPERS --- */
	hide: function() {
		$("#manage-page").hide();
	},
	
	show: function() {
		$("#manage-page").show();
	},

	initHook: function() {
		console.log('[ManageView] Initting');
		var that = this;

		if(!this.isLoaded) {
			this.load();
		}

	},

	exitHook: function() {
		this.options.app.log('[ManageView] Exiting');
	},

	unload: function() {
		this.loaded = false;
	},
	
	isLoaded: function() {
		return this.loaded;
	},
	/* -- -- */

});