// Category Collection
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/VoteModel"], function($, Backbone, VoteModel) {

	// Extends Backbone.Router
	var VoteCollection = Backbone.Collection.extend({
		model: VoteModel,

		initialize: function(model, options) {
			this.options = _.extend({}, this.options, options);
		},

		url: function() {
			var url = rootUrl + 'mobile/votes/'+this.get('occurr_id')+'/'
			return url;
		}
	});
	// Returns the Model class
	return VoteCollection;

});