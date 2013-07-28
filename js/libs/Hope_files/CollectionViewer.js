//Class that manages multiple views in a finder-like view
var CollectionViewer = Backbone.View.extend({
	currentView: 0,
	viewStack: [],

	events: {
		'click #buttonPrevious': 'previousView',
		'click #buttonNext': 'nextView',
		'loadView': 'loadView',
	},

	initialize: function(options){
		if(options == undefined){
			options = {};
		}
		
		if(options.initial_view){
			this.viewStack.push(options.initial_view);
		}

		_.bindAll(this, 'render', 'previousView', 'nextView', 'loadView');

		this.render();
	},

	previousView: function(evt){
		if(this.currentView > 0){
			this.currentView--;
		}

		this.render();

		if(evt){
			evt.preventDefault();
		}
	},

	nextView: function(evt){
		if(this.currentView < this.viewStack.length - 1){
			this.currentView++;
		}

		this.render();

		if(evt){
			evt.preventDefault();
		}
	},

	loadView: function(evt, incomingView){
		//Loads incoming view into the next pane.

		if(this.viewStack.length > this.currentView + 1)
			//Clean every view ahead of the current and place the new view there
			this.viewStack = this.viewStack.slice(0, this.currentView + 1);

		this.viewStack.push(incomingView);

		this.nextView();
		//this.render();

		console.log("CONTROLLER: "+this.currentView);

		if(evt){
			evt.preventDefault();
		}
	},

	render: function(){
		$(this.el).html($("#collection_inspector").jqote());

		//Enable disable controllers based on the state
		if(this.currentView >= this.viewStack.length-1){
			$("#buttonNext").prop("disabled", true);
		}

		if(this.currentView <= 0){
			$("#buttonPrevious").prop("disabled", true);
		}

		if(this.currentView < this.viewStack.length){
			//TODO - Regulate size using some kind of container
			$("#view_container", this.el).append(this.viewStack[this.currentView].el);
		}

		return this.el;
	}
});
