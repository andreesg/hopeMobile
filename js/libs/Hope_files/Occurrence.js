/* NEED TO FETCH WITH NEW MYSQL DB */

var Occurrence = Backbone.Model.extend({
	name: 'occurrence',
	
	url: function(){
		return '1/occurrences/'+this.get('_id')['$oid']+'/';
	}
});

var OccurrenceList = Backbone.Collection.extend({
	model: Occurrence,
	
	initialize: function(model, options){
		this.options = _.extend({}, this.options, options);
		if (this.options.top && this.options.bottom && this.options.left && this.options.right){
			this.bbox = true
		} else {
			this.bbox = false
		}
		
	},
	
	url: function() {
		var url = '1/occurrences/?'
		if (this.bbox){
			url += '&top='+this.options.top+'&bottom='+this.options.bottom+'&left='+this.options.left+'&right='+this.options.right;
		}
		
		if (this.options.shape_id){
			url += '&shape_id=' + this.options.shape_id
		}
		
		return url;
	}
});


var TemporaryOccurrence = Backbone.Model.extend({
	name: 'tempoccurrence',
	url: function(){
		var url = 'temp/1/'
		if (this.get('_id') != undefined)
			url += this.get('_id')['$oid']+'/';
			
		return url;
	},
	
	fetchWithSchema: function(options){
		this.fetch({
			success: function(model, resp){
				model.schema = new Schema({_id: model.get('category')['$oid']});
				model.schema.elementModel = model;
				model.schema.fetch({
					success: function(model, resp){
						model.elementModel.trigger('updateSchema');
						if (options && options.success)
							options.success(model,resp);
					}
				});
			},
			error: function(model, resp){
				if (options && options.error)
					options.error(model, resp);
			}
		});
	},

	destroyHook: function(options) {
		$.ajax({
		    url: this.url(),
		    type: 'DELETE',
		    success: function(result) {
		        console.log("element deleted");
		    }
		});
	}

});

var TemporaryOccurrenceList = Backbone.Collection.extend({
	model: TemporaryOccurrence,
	
	initialize: function(model, options){
		this.options = _.extend({}, this.options, options);
	},
	
	url: function() {
		return 'temp/1/';
	}
});


