/* NEED TO FETCH WITH NEW MYSQL DB */

var Shape = Backbone.Model.extend({
	name: 'spatialObject',
	
	url: function(){
		return window.app.project+'/shapes/'+this.get('_id');
	}
});

var ShapeList = Backbone.Collection.extend({
	model: Shape,
	
	initialize: function(model, options){
		this.options = _.extend({}, this.options, options);
		if (this.options.top && this.options.bottom && this.options.left && this.options.right){
			this.bbox = true
		} else {
			this.bbox = false
		}
		
	},
	
	url: function() {
		var url = window.app.project+'/shapes/?'
		if (this.bbox){
			url += '&top='+this.options.top+'&bottom='+this.options.bottom+'&left='+this.options.left+'&right='+this.options.right;
		}
		
		if(this.options.occurrences){
			url += '&occurrences=1'
		}
		
		return url;
	}
});


