// Occurrence Model
// ==============

define(["jquery", "backbone"], function($, Backbone) {
	var Model = Backbone.Model.extend({
		name: 'occurrence',
		url: function() {
			return rootUrl + 'mobile/create/';
		}
	});
	return Model;
});