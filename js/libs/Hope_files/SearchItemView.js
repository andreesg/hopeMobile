var SearchItemView = Backbone.View.extend({
	events: {
		'click #peek_result': 'peekResult',
		'click .well': 'resultSelected'
	},

	resultSelected: function(){
		console.log("clicked on search result");

		app.currentView.mapHandler.renderShapes(this.model, {});

		$(this.el).addClass("object_selected");
		$(this.el).addClass("selected");
	},
	
	peekResult: function(evt){
		var view = new ElementView({element_id: this.model.get('_id')});
		
		if(typeof(app.currentView.activePopover) != 'undefined' && app.currentView.activePopover != this.popover){
			app.currentView.activePopover.popover('hide');
		}

		this.popover = $("#peek_result", this.el);

		this.popover.popover({title:"Detalhes", content: view.el});
		

		var that = this;
		window.setTimeout(function(){
			$("#peek_result", that.el).popover('show');
			app.currentView.activePopover = that.popover;
		}, 100);

		evt.stopPropagation();

	},

	initialize: function(){
		_.bindAll(this, 'render', 'resultSelected', 'peekResult');

		var that = this;

		this.model.bind("map_selected", function(){
			console.log("listening to selection through map");
			that.resultSelected();
		});

		this.render();
	},

	render: function(){
			$(this.el).html($("#search_result_item").jqote(this.model));
			return this;
	},
});
