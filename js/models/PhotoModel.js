// Occurrence Model
// ==============

define(["jquery", "backbone"], function($, Backbone) {
	var Model = Backbone.Model.extend({
		name: 'photo',

		initialize: function(model, options) {
			this.options = _.extend({}, this.options, options);
		},

		url: function() {
			return rootUrl + 'occurrences/upload/'+this.options.occurr_id+'/';
		}
	});
	return Model;
});