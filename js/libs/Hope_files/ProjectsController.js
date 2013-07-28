/*
|--------------------------------------------------------------------------
| ProjectsController
|--------------------------------------------------------------------------
|
| Entire project frontcontroller. It's responsible to check the state
| of the app and create the main objects.
|
*/

var ProjectsController = Backbone.Router.extend(
{
	initialized: false,

	routes: {
		'' : 'index',
		'map' : 'map',
		'report': 'report',
		'report/:oid': 'report',
		'manage': 'manage'
	},
	
	initialize: function(options){
		this.options = _.extend({}, this.options, options);
		
		this.options.app.manageview = new ManageView({app: this.options.app});
		this.options.app.editor = new EditorView({app: this.options.app});
		this.options.app.reportview = new ReportView({app: this.options.app});
		
	},
	
	index: function(){
		this.navigate("map", {trigger:true});
		//window.location.hash = '#map'
	},
	
	map: function(){
		//this.options.app.resizeLayouts();
		
		/*if(this.options.app.loggedIn()) {
			if (!this.options.app.editor.isLoaded()){
				this.options.app.editor.load();
			}
		}
		
		this.options.app.dataview.hide();
		this.options.app.occview.hide();
		this.options.app.editor.show();*/
		
		this.options.app.setPreviousState();
		
		if(!this.options.app.loggedIn()){
			document.location.hash = "login";
			return;
		}
		
		this.options.app.editor.hide();
		this.options.app.manageview.hide();
		this.options.app.reportview.hide();
		this.options.app.changeView(this.options.app.editor);
	},

	/**
	 *
	 * This view enables the user to insert new
	 * occurences
	 *
	 **/
	report: function(oid) {
		this.options.app.setPreviousState();

		if(!this.options.app.loggedIn()) {
			this.navigate("login", {trigger:true});
		}

		this.options.app.editor.hide();
		this.options.app.manageview.hide();
		this.options.app.changeView(this.options.app.reportview, {oid:oid});
	},

	manage: function() {
		this.options.app.setPreviousState();
		if(!this.options.app.loggedIn()) {
			this.navigate("login", {trigger:true});
		}
		this.options.app.editor.hide();
		this.options.app.reportview.hide();
		this.options.app.changeView(this.options.app.manageview);
	}

});