/* NEED TO FETCH WITH NEW MYSQL DB */

var Element = Backbone.Model.extend({
	name: 'element',
	
	url: function(){
		return window.app.project+'/elements/'+this.get('_id')['$oid']+'/';
	},
	
	fetchWithSchema: function(options){
		this.fetch({
			success: function(model, resp){
				var element = model;
				element.schema = new Schema({_id: model.get('category')['$oid']});
				//element.schema.elementModel = model;
				element.schema.fetch({
					success: function(model, resp){
						element.trigger('updateSchema');
						//model.elementModel.trigger('updateSchema');
						if (options && options.success)
							options.success();
					}
				});
			}
		});
	}
});

var ElementsList = Backbone.Collection.extend({
	model: Element,
	
	initialize: function(model, options){
		this.options = _.extend({}, this.options, options);
		if (this.options.top && this.options.bottom && this.options.left && this.options.right){
			this.bbox = true
		} else {
			this.bbox = false
		}
	},
	
	url: function() {
		var url = window.app.project+'/elements/?'
		
		// Ask for elements in a bounding box
		if (this.bbox){
			url += '&top='+this.options.top+'&bottom='+this.options.bottom+'&left='+this.options.left+'&right='+this.options.right;
		}
		
		// return the elements associated to a shape_id
		if (this.options.shapeId){
			url += '&shape_id=' + this.options.shapeId;
		}
		
		// return the elements associated to a category_id
		if (this.options.categoryId){
			url += '&category_id=' + this.options.categoryId;
		}
		
		if (this.options.scopeId != undefined){
			url += '&scope_id=' + this.options.scopeId;
		}
		
		return url
	}
});

var SearchElementsList = Backbone.Collection.extend({
	model: Element,

	initialize: function(model, options){
		this.options = _.extend({}, this.options, options);
		this.bbox = false;
	},

	url: function(){

	}
});


