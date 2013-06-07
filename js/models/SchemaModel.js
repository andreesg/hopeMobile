
// Schema Model
// ==============

define(["jquery", "backbone"], function($, Backbone) {
	var Model = Backbone.Model.extend({
		urlRoot: rootUrl + "mobile/schemas/",
		initialize:function(){
			if(this.has('_id')){
				this.set('id', this.get('_id')['$oid']);
			}
			this.fieldsCollection = new Backbone.Collection(this.get('fields'));
		}
	});
	return Model;
});
