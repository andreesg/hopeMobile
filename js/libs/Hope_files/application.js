var dispatcher = _.extend({}, Backbone.Events);
var BarNotification = {

	init: function(options) {
		if($('.jbar').length){
			//$('.jbar').undelegateEvents();
			$('.jbar').remove();
		};

		var bgcolor = "#FFFFCC";
		var color = "#FF6600";
		var removebutton = false;
		var timer = 3000;

		if(options.type == 'success') {
			bgcolor = "#dff0d8";
			color = "#468847";
		}
		else if(options.type == 'info') {
			bgcolor = "#d9edf7";
			color = "#3a87ad";
		}
		else if(options.type == 'error') {
			bgcolor = "#f2dede";
			color = "#b94a48";
		}
		else if(options.type == 'alert') {
			bgcolor = "#fcf8e3";
			color = "#c09853";
		}

		if(options.fixed == true) {
			removebutton = options.fixed;
		}

		if(options.timer) {
			timer = options.timer;
		}

		$("#app-body").bar({
			background_color: bgcolor,
			color: color,
			message: options.message,
			position: 'bottom',
			removebutton: removebutton,
			time: timer
		});
	},

	setMessage: function(message) {
		if($('.jbar').length){
			$('.jbar-content').html(message);
		}
	}
	
};

var App = function(options) {
		$(window).bind('beforeunload', null);
		this.map = null;
		this.options = options || {};
		
		this.user = options.user;
		this.initialize();
		
		this.project = 1;
		this.appurl = "/smartroads/"
		this.editor = null;
		this.dataview = null;
		this.lat = null;
		this.lng = null;
		this.getLocation();
		
		this.projectController = new ProjectsController({app: this});
		this.usersController = new UsersController();
		
		this.previous_state = '#';

    	_.bindAll(this, 'log');

		$('#loading').hide();
};

App.prototype = {
	initialize: function(){
		//this.map = new OpenLayersView([40.2,-8.416667]);
		console.log("init app");
	},
	
	viewName: function(){
		return (document.location.hash+'/').split('/')[0]
	},
	
	changeView: function(to, options){
		// run exit hook from current view
		if (this.currentView){
			this.currentView.hide();
			this.currentView.exitHook();
		}
		
		// set new view
		this.currentView = to;
		
		// load view if never loaded;
		if (!this.currentView.isLoaded())
			this.currentView.load(options);
		
		
		// run initHook from new current view
		this.currentView.show();
		this.currentView.initHook(options);
				
		// update header tabs
		//this.header.render();
	},
	
    log: function(str) {
        if(this.options.debug) console.log(str);
    },
    
    setPreviousState: function() {
        this.previous_state = document.location.hash;
    },
    
    gotoPreviousState: function() {
        document.location.hash = this.previous_state;
    },
    
    isMac: function() {
        return navigator.appVersion.indexOf('Mac') != -1;
    },
    
    loggedIn: function() {
        return !this.user.isNew();
    },

    getLocation: function() {
    	var that = this;
		if (navigator.geolocation) {
	    	navigator.geolocation.getCurrentPosition(function(position) {
	    		that.lat = position.coords.latitude;
	    		that.lng = position.coords.longitude;
	    		dispatcher.trigger("recenterMap");
	    	});  
	    }
	}

};


