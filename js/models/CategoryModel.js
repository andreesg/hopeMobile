// Schema Model
// ==============

define(["jquery", "backbone"], function($, Backbone) {
	var Model = Backbone.Model.extend({
		name: 'category',
		url: function() {
			return 'mobile/categories/'+this.get('_id');
		}
	});
	return Model;
});