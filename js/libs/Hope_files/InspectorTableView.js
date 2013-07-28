var InspectorTableView = Backbone.View.extend({
	
	events: {
		'click .save_data': 'saveModel',
		'click .restore_data': 'render',
		'focus .edit': 'onFocus', //maybe a click on the element triggers this?
		'click .image_gallery': 'loadGallery',
	},
	
	initialize: function(){
		_.bindAll(this, 'render', 'saveModel', 'onFocus', 'loadGallery');
		
		this.isTemporary = this.options.temporary===undefined?false:this.options.temporary;
		
		this.render();

		var that = this;
		dispatcher.bind("changed", function(){
				
			if(that.options.edit){
				$('.data_operations').show()
			}
		});
	},
	
	loadGallery: function(evt){

		var imageGallery = new ImageGalleryView({	model: this.model, 
													fieldName: $(evt.target).attr('rel'),
													temporary: this.isTemporary
												});
		
		evt.preventDefault();
	},
	
	onFocus: function(evt){
		//TODO - toggle view/edit
		if (this.options.edit){
			$('.data_operations').show();
		}
		evt.preventDefault();
	},
	
	saveModel: function(evt){
		console.log("Saving")
		// Construir um objecto com os dados do formulário
		var dataArray = $('form',this.el).serializeArray();
		
		var data = {}
		for(var i in dataArray){
			var key = dataArray[i].name;
			
			if (key in this.model.schema.attributes){
				if (this.model.schema.get(key).type == 'array#photo'){ continue; }
				
				data[key] = dataArray[i].value;
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
		
		this.render();
		
		evt.preventDefault();
	},
	
	render: function(){
		$(this.el).html($('#inspector2_template').jqote({id: this.model.get('_id')['$oid']}));
		
		var table = $('.inspector', this.el);
		table.addClass('no_round_corners');
		
		if (this.model.schema) {
				var r = 0;
				var attr,elm,val;
				for(attr_key in this.model.schema.attributes){
					attr = this.model.schema.get(attr_key);
					elm  = {};
					var attr_val = this.model.get(attr_key);
					attr_val = attr_val==null?'':attr_val;
					
					if (attr_key[0] == '_') continue;
					
					if (attr.type == 'array#photo'){
						//table.append('<tr><td class="key"><label for="'+attr_key+'">'+attr.readable+'</label></td>'+
						//				'<td class="value photo_array">'+attr_val.length+' foto(s) <button rel="'+attr_key+'" name="photo" class="image_gallery">Ver</button></td></tr>')
						var imggal = $($('#image_gallery_template_small').jqote())
						
						var fancybox = null;
						var photos = attr_val
		
						var imgContainer = $('.image_list_small', imggal);
						imgContainer.html('');
		

						var lim = photos!=undefined?photos.length:0;
						for(var i=0;i<lim;i++)
						{
							console.log("Loading photo:");
							console.log(photos);
							imggal.append($('#single_image_template_small').jqote({ photo: photos[i] }));
						}

						fancybox = $("a[rel=group]", imggal).fancybox({
							'transitionIn'		: 'none',
							'transitionOut'		: 'none',
							'titlePosition' 	: 'none'
						});
						
						console.log(attr_val)
						console.log(this.model.get(attr_key))
						console.log(imgContainer)
						console.log(imggal)

						var lasttd = $('<td class="value" />').append(imggal)
						var line = $('<tr><td class="key"><label for="'+attr_key+'">'+attr.readable+'</label></td></tr>')
						line.append(lasttd)
						table.append(line);
						//table.append('<td class="value">'+imggal.html()+"</td></tr>");

					} else {
						var odd = true;
						if((r++) % 2 == 0){
							odd = false;
						}
						
						var root_type = attr.type.split("#")[0] //composite types are separated by #
						var row, label, value, view;
						row = $('<tr />');
						label = $('<td class="key"><label for="'+attr_key+'">'+attr.readable+"</label></td>")
						row.append(label)

						value = $('<td class="value" />');
						row.append(value)

						console.log(attr);

						switch(root_type){
							case 'int':
							view = new IntegerView({edit: true, data: {name: attr_key, spec: attr, value: attr_val}});
							break;
							case 'real':
							view = new RealView({edit: true, data: {name: attr_key, spec: attr, value: attr_val}});
							break;
							case 'reference':
							view = new ReferenceView({edit: true, data: {name: attr_key, spec: attr, value: attr_val}});
							break;
							case 'array':
							view = new ArrayView({edit: true, data: {name: attr_key, spec: attr, value: attr_val}});
							break;
							default:
							view = new StringView({edit: true, data: {name: attr_key, spec: attr, value: attr_val}});
							break;
						}

						value.append(view.render().el);
						table.append(row);
					}
				}
				delete attr;
				delete elm;
				delete val;
			}
		table.append('<tr><td></td><td></td></tr>');
		
		$('.data_operations').hide();

		return this;
		
	}
})
