// Occurrence Collection
// ===================

// Includes file dependencies
define(["jquery", "backbone", "models/OcurrenceModel"], function($, Backbone, OccurrenceModel) {

	// Extends Backbone.Router
	var OccurrenceCollection = Backbone.Collection.extend({
		model: OccurrenceModel,

		initialize: function(model, options) {
			this.options = _.extend({}, this.options, options);
		},

		url: function() {
			var url = rootUrl + 'mobile/occurrences/'
			return url;
		}
	});
	// Returns the Model class
	return OccurrenceCollection;

});