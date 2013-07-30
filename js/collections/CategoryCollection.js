// Category Collection
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/CategoryModel"], function($, Backbone, CategoryModel) {

	// Extends Backbone.Router
	var CategoryCollection = Backbone.Collection.extend({
		model: CategoryModel,

		initialize: function(model, options) {
			this.options = _.extend({}, this.options, options);
		},

		url: function() {
			var url = rootUrl + 'mobile/categories/'
			return url;
		}
	});
	// Returns the Model class
	return CategoryCollection;

});