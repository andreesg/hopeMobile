/* NEED TO FETCH WITH NEW MYSQL DB */

var Schema = Backbone.Model.extend({
	name: 'schema',
	url: function(){
		return window.app.project+'/schemas/'+this.get('_id');
	}
});
