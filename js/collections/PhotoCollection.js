// Category Collection
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/PhotoModel"], function($, Backbone, PhotoModel) {

	// Extends Backbone.Router
	var PhotoCollection = Backbone.Collection.extend({
		model: PhotoModel,

		initialize: function(model, options) {
			this.options = _.extend({}, this.options, options);
		},

		url: function() {
			var url = rootUrl + 'mobile/photos/'+this.options.occurr_id+'/'
			return url;
		}
	});
	// Returns the Model class
	return PhotoCollection;

});