// Occurrence Model
// ==============

define(["jquery", "backbone"], function($, Backbone) {
	var Model = Backbone.Model.extend({
		name: 'votes',

		initialize: function(model, options) {
			this.options = _.extend({}, this.options, options);
		},
		
		url: function() {
			return rootUrl + 'mobile/vote/'+this.options.occurr_id+'/';
		}
	});
	return Model;
});