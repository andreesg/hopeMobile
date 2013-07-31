// Schema Model
// ==============

define(["jquery", "backbone"], function($, Backbone) {
	var Model = Backbone.Model.extend({
		name: 'category',
		url: function() {
			return rootUrl + 'mobile/categories/'+this.get('_id')+'/';
		}
	});
	return Model;
});