// Schema Collection
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/SchemaModel"], function($, Backbone, CategoryModel) {

	// Extends Backbone.Router
	var Collection = Backbone.Collection.extend({
		model: CategoryModel,

		initialize: function(model, options) {
			this.options = _.extend({}, this.options, options);
		},

		url: function() {
			var url = 'mobile/categories/'
			return url;
		}
	});
	// Returns the Model class
	return Collection;

});