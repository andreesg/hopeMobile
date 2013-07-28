/* NEED TO FETCH WITH NEW MYSQL DB */

var Category = Backbone.Model.extend({
	name: 'category',

	url: function(){
		return '1/categories/'+this.get('_id');
	}
});

var CategoryList = Backbone.Collection.extend({
	model: Category,
	
	initialize: function(model, options){
		this.options = _.extend({}, this.options, options);
	},
	
	url: function() {

		var url = '1/categories/?'
		if (this.options.scope != undefined)
			url += '&scope='+this.options.scope;
		
		return url;
	}
});


