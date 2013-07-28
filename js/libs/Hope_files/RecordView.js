var RecordView = Backbone.View.extend({
	id: 'recordDialog',
	tagName: 'div',
	
	events: {
		'submit form': 'saveModel',
	},
	
	initialize: function(options){
		_.bindAll(this, 'render', 'saveModel');
		
		this.model.bind('updateSchema', this.render);
		
		this.render();
	},
	
	saveModel: function(evt){

		var dataArray = $('form',this.el).serializeArray();
		
		var data = {}
		for(var i in dataArray){
			var key = dataArray[i].name;
			
			if (key in this.model.schema.attributes){
				if (this.model.schema.get(key).type == 'array#photo'){}
				
				data[key] = dataArray[i].value
			}
		}
		
		var _features = this.model.get(_features)
		this.model.attributes._features = undefined

		this.model.save(data, {
								success: function(){
									new Notice({message: "Elemento guardado com sucesso."})
								},
								error: function(){
									new Error({message: "Occorreu um erro a salvar o elemento. Tente Novamente."});
								}});

		this.model.attributes._features = _features
		
		return false;
	},

	
	render: function(){
		// if the schema wasn't filled previously, get it now.
		if (this.model.schema == undefined) {
			this.model.fetchWithSchema();
			return this;
		}
		
		$(this.el).html("");
		
		var formdata =
		{
			"action" : "",
			"method" : "",
			"elements" : []
		};
		
		for(attr_key in this.model.schema.attributes){
			var attr = this.model.schema.get(attr_key);
			var elm  = {};
			
			if (attr_key[0] == '_') continue;
			
			if(attr_key == '_id' || attr_key == 'scope'){
				elm = { type: 'text', caption: attr_key}
				elm.value = attr_key=='_id'?this.model.get('_id')['$oid']:this.model.get('scope');
			} else {
				if (attr.type == 'string')
					elm.type = 'text';
				else if (attr.type == 'array#photo'){
					elm.type = 'array_photo';
					elm.model = this.model;
				}else {
					elm.type = 'text';
				}
				elm.caption = attr.readable;
				elm.value = this.model.get(attr_key);
			}
			
			//this.model.get('_id')['$oid']+'_'
			elm.name = attr_key;
			
			formdata.elements.push(elm);
		}

		formdata.elements.push({"type" : "submit", "value" : "Guardar"})
	
		$(this.el).buildForm(formdata);
		
		
		// build the dialog
		$(this.el).dialog({ position: 'center', 
							resizable: true,
							closeOnEscape: true,
							title: '' , 
						});
		
		
		//$('form', this.el).bind('submit', this.saveModel);
		
		return this;
	}
});
