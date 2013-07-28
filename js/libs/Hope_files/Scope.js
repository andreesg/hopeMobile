var Scope = Backbone.Model.extend({
	name: 'scope',
});

var ScopeList = Backbone.Collection.extend({
	model: Scope,
	
	initialize: function(model, options){
		this.options = _.extend({}, this.options, options);
	},
	
	url: function() {
		return 'scopes/'+app.project;
	}
});


