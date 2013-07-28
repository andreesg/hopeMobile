var OccurrenceView = Backbone.View.extend({
	id: 'occurrence_pane',
	template: 'occurrences_pane_template',
	container: 'central_pane',
	loaded: false,
	
	viewMode: 0,
	
	initialize: function(){
		_.bindAll(this, 'load', 'unload', 'isLoaded', 'hide', 'show', 'initHook', 'exitHook', 'setMode' );
	},
	
	load: function(options){
		if (!this.isLoaded()){

			$(this.el).html(tmpl);
			
			$('#'+this.container).append($(this.el));
			
			$('#occurrence_pane').show();
			if (this.options)
			this.occurrencesMap = new TOcMapView({view: this});
			this.occurrencesListView = new TOccurrenceListView({	el: $('#'+this.id+' .middle-west'), 
																	oid: options.oid,
																	view: this});
		}
		this.loaded = true;
	},
	
	setMode: function(state){
		this.viewMode = state;
		//this.occurrencesListView.setMode(this.viewMode);
		if (state == 0){
			this.layout.show('west');
		} else {
			this.layout.hide('west');
		}
	},
	
	unload: function(){
		this.loaded = false;
	},
	
	isLoaded: function(){
		return this.loaded;
	},
	
	exitHook: function(){
		this.options.app.log('Exiting OcurrenceView');
	},
	
	initHook: function(options){
		this.options.app.log('Initting OcurrenceView');
		
		if (!this.layout){
			$('#occurrence_pane').show();
			
			this.layout = $('#occurrence_pane').layout({
				initClosed: false,
				center__paneSelector:	".middle-center",
				west__paneSelector:		".middle-west",
				east__paneSelector:		".middle-east",
				center__size: '30%',
				west__size: '270',
				east__size: '30%',
				minSize:				30,
				west__closable: 		false,
				west__resizable: 		true,
				spacing_open:			8,	// ALL panes
				spacing_closed:			8,	// ALL panes
				west__spacing_closed:	12,
				east__initClosed: options.oid==undefined?true:false
			});
			
		} else {
			this.layout.resizeAll();
		}
		
	},
	
	hide: function(){
		$("#"+this.id).hide();
	},
	
	show: function(){
		$("#"+this.id).show();
		
	}
});

var TOccurrenceListView = Backbone.View.extend({
	editMode: false,
	events: {
		'click a.tocc_item': 'onClick',
		'click .sort_d': 'sortCollection',
		'click .sort_n': 'sortCollection',
		'click #new_occurrence': 'createNewOccurrence'
	},
	
	initialize: function(){
		_.bindAll(this, 'render', 'addOne', 'onClick', 'loadOccurrence', 'setMode', 'sortCollection', 'createNewOccurrence', 'fillSelectBox');
		
		this.categoryList = new CategoryList(null,{scope: 1});
		
		
		this.occurrenceList = new TemporaryOccurrenceList();
		this.occurrenceList.bind('refresh', this.render);
		this.occurrenceList.bind('remove', this.render);
		this.occurrenceList.bind('add', this.render);

		this.occurrenceList.view = this;
		
		this.occurrenceList.comparator = function(occurrence){
			return occurrence.get('geo')['start'].distance;
		}
				
		this.occurrenceList.fetch({
			// if the id of the occurrence is passed by the url, load the occurrence
			success: function(model, resp){
				if (model.view.options.oid != undefined){
					model.view.loadOccurrence(model.view.options.oid);
				}
			}
		});
		
		this.sortByDistance = true;
		
	},
	
	sortCollection: function(evt)
	{
		if (evt.target.classList[0]){
		 	if (evt.target.classList[0] === "sort_d"){
				this.occurrenceList.comparator = function(occurrence){
					return occurrence.get('geo')['start'].distance;
				}
				this.sortByDistance = true;
				
			} else if (evt.target.classList[0] === "sort_n"){
				this.occurrenceList.comparator = function(occurrence){
					return occurrence.get('name');
				}
				this.sortByDistance = false;
			}
			this.occurrenceList.sort();
		} 
		evt.preventDefault();
	},
	
	setMode: function(state){
		if (state>0){
			$(this.el).append('<div id="occurrences_view_disabled" class="disabled_view"></div>');
			$(this.el).css('overflow', 'hidden');
		} else {
			$(this.el).find('#occurrences_view_disabled').remove();
			$(this.el).css('overflow-y', 'auto');
		}
	},
	
	addOne: function(obj){
		$(this.el.occlist).append($('#occurrences_item').jqote(	{
																	id:obj.get('_id')['$oid'],
																	name:obj.get('name')
																}))
	},
	
	fillSelectBox: function(){
		var elm = $('.category_list');
		var cur_id = this.options.id;
		this.categoryList.each(function(cat){
			var id = cat.get('_id')['$oid'];
			elm.append('<option value="'+id+'" '+((id==cur_id)?'selected':'')+'>'+cat.get('name')+'</option>');
		})
	},
	
	createNewOccurrence: function(evt){
		
		var category = $('.category_list').val();
		
		// for now, get the center of the map in the screen
		var startCoordinate = this.options.view.occurrencesMap.mapObj.center;
		var newCoordinates = startCoordinate.transform(	this.options.view.occurrencesMap.mapObj.getProjectionObject() , this.options.view.occurrencesMap.projection);
		
		// tem de ter uma categoria escolhida
		if (category != undefined) {
			var tmpOccurrence = new TemporaryOccurrence();
			
			var that = this;
			tmpOccurrence.view = this;
			
			tmpOccurrence.save({	geo : 	{	start: {	latitude: newCoordinates.lat, 
												longitude: newCoordinates.lon, distance: 0}
											},
									"category": {"$oid": category}
								}, 
								{ 	success: function(model,resp){
										//app.log("-->"+model.get('_id')['$oid']);
										that.loadOccurrence(model.get('_id')['$oid']);
										
										that.occurrenceList.add(model);
								},
									silent: true
								});
			
			// actualizar a lista de ocorrencias
			//this.occurrenceList.fetch();
		}
		return false;
	},
	
	render: function(){
		app.log('rendering occurrences list');
		/*var exists = ($(this.options.container).find($('#'+this.id)).length > 0);
		if (exists)
			$(this.el).remove();*/
			
		$(this.el).html('');

		$(this.el).append($("#occurence_west_template").jqote({project_id:app.project, csrftoken: getCookie('csrftoken')}));
		
		
		this.el.occlist = $('#occurrence_list');
		
		var that = this;
		$("#upload").submit(function(evt){
				$(this).ajaxSubmit({
					success:function(){
						that.occurrenceList.fetch();
						}
					});
				evt.preventDefault();
				});

		this.occurrenceList.each(this.addOne);
		
		if (this.sortByDistance){
			$('.sort_d').hide();
			$('.sort_n').show();
		} else {
			$('.sort_d').show();
			$('.sort_n').hide();
		}
		
		this.categoryList.fetch({
			success: this.fillSelectBox
		});
		
		return this;
	},
	
	onClick: function(evt){
		this.loadOccurrence(evt.target.rel);
		
		this.options.view.layout.open('east');
		// return false to prevente the page of reloading
		evt.preventDefault();
	},
	
	loadOccurrence: function(oid){
		app.log('loading '+oid);
		
		/*var obj = this.occurrenceList.filter(function(occ){
			return occ.get('_id')['$oid'] == oid;
		});*/
		
		if (oid.length > 1){
			
			this.currentOccurrence = new TOccurrenceObjectView( {	model_id: oid,//obj[0], 
																	el: $('#occurrence_pane .middle-east'), 
																	collection: this.occurrenceList,
																	view: this.options.view
																});
			
			app.log('changing map occurrence');
			//this.options.view.occurrencesMap.changeOccurrence(obj[0]);
		}
		/** else {
			new Notice({message: 'Ocorrencia não encontrada'});
			app.log('Temporary Occurrence not found ('+oid+')');
		}*/
		
	}
	
});

var TOccurrenceObjectView = Backbone.View.extend({
	
	events: {
		'click .confirm_occurrence': 'confirmOccurrence',
		'click .delete_occurrence': 'deleteOccurrence',
		'click .edit_geometry': 'editGeometry',
		'click .associate_shape': 'associateShape',
		'click .cancel_association': 'cancelAssociation',
		'click .cancel_edit': 'cancelEdit',
	},
	
	initialize: function(){
		_.bindAll(this, 'render', 'confirmOccurrence', 'deleteOccurrence' , 'isConfirmed', 'associateShape', 'editGeometry', 'cancelAssociation', 'toggleAssociation', 'cancelEdit', 'toggleEdit', 'onCategoryChange');
		
		this.model = new TemporaryOccurrence({_id: {"$oid": this.options.model_id }});
		this.model.bind('change', this.isConfirmed);
		this.model.bind('updateSchema', this.render);
		
		
		this.model.collection = this.options.collection;
		this.view = this.options.view;
		
		this.model.view = this;
		
		this.model.fetchWithSchema({
			success: function(model, resp){
				model.elementModel.view.view.occurrencesMap.changeOccurrence(model.elementModel);
			},
			error: function(model, resp){
				new Notice({message: 'Ocorrencia não encontrada'});
				app.log('Temporary Occurrence not found ('+model.get('_id')["$oid"]+')');
			}
		});
		
	},
	
	init: function(){
		this.model.fetchWithSchema();
	},
	
	onCategoryChange: function(data){
		this.model.set({_id: {'$oid': data._id}}, {silent:true});
		
		(this.category_changer.el).unbind()
		this.category_changer.remove();
		
		this.model.fetchWithSchema();
		this.options.collection.fetch();
	},
	
	cancelAssociation: function(evt){
		if (this.associateMode){
			this.model.trigger('cancelAssociation');
			this.toggleAssociation(false);
			this.associateMode = false;
		}
		evt.preventDefault();
	},
	
	toggleAssociation: function(state){
		if (state){
			this.view.setMode(1);  // set in associate Mode
			$('.associate_shape').html('Guardar Associação');
			$('.occurrence_operations .button').hide();
			$('.associate_shape').show();
			$('.cancel_association').show();
		} else {
			this.view.setMode(0); // set in normal Mode
			$('.associate_shape').html('Associar a Segmentos');
			$('.occurrence_operations .button').show();
			$('.cancel_association').hide();
			$('.cancel_button').hide();
		}
	},
	
	associateShape: function(evt){
		this.associateMode = !this.associateMode;
		if (this.associateMode){
			this.model.trigger('startAssociateGeo');
			this.toggleAssociation(true);
		} else {
			this.model.trigger('endAssociateGeo');
			this.toggleAssociation(false);
		}
		
		evt.preventDefault();
	},
	
	cancelEdit: function(evt){
		if (this.editMode){
			this.model.trigger('cancelEdit');
			this.toggleEdit(false);
			this.editMode = false;
		}
		evt.preventDefault();
	},
	
	toggleEdit: function(state){
		if (state){
			this.view.setMode(2);
			$('.edit_geometry').html('Guardar Geometria');
			$('.occurrence_operations .button').hide();
			$('.edit_geometry').show();
			$('#occurrence_operations .cancel_edit').show();
		} else {
			this.view.setMode(0);
			$('.edit_geometry').html('Editar Geometria');
			$('.occurrence_operations .button').show();
			$('.cancel_button').hide();
			$('.cancel_edit').hide();
		}
	},
	
	editGeometry: function(evt){
		this.editMode = !this.editMode;
		if (this.editMode){
			this.model.trigger('startEditGeo');
			this.toggleEdit(true);
		} else {
			this.model.trigger('endEditGeo');
			this.toggleEdit(false);
		}
		
		evt.preventDefault();
	},

	deleteOccurrence: function(evt){
		if(!this.editMode){
			var oid = evt.target.rel;
			var that = this;
			this.model.destroy({'success': function(model, resp){
				var obj = model.collection.filter(function(occ){
					return occ.get('_id')['$oid'] == model.get('_id')['$oid'];
				});
				model.collection.remove(obj);
				
				// manually trigger change
				model.change();

				$(that.el).html("Escolha uma ocorrencia para confirmar!");


			}});
		}
		return evt.preventDefault();
	},
	
	/**
	* Method: confirmOccurrence
	* Desc: Called when the confirm occurrence button is pushed
	*/
	confirmOccurrence: function(evt){
		if (!this.editMode) {
		
		var oid = evt.target.rel;
		
		this.model.save({'confirmed': true},{
			silent: true,
			success: function(model, resp){
				
				// need to find the element in the list witch has the same $oid and then remove it
				var obj = model.collection.filter(function(occ){
					return occ.get('_id')['$oid'] == model.get('_id')['$oid'];
				});
				model.collection.remove(obj);
				
				// manually trigger change
				model.change();

			}
		});
		
		}
		
		return evt.preventDefault();
	},
	
	isConfirmed: function(){
		if (this.model.get('confirmed')){
			$(this.el).html("Escolha uma ocorrencia para confirmar!");
		}
	},
	
	render: function(){
		
		$(this.el).html($('#occurences_east_template').jqote({id: this.model.get('_id')['$oid']}));	
		
		
		this.inspector = new InspectorTableView({el: $('.inspector_placeholder', this.el), edit: true, model: this.model, temporary: true });
		
		this.category_changer = new OccurrenceCategoryChange({	el: $('#category_change', this.el), 
																category_id: this.model.get('category')['$oid'],
																model_id: this.model.get('_id')['$oid']
															});
		this.category_changer.bind('changed', this.onCategoryChange);
		
		$('.cancel_association').hide();
		$('.cancel_edit').hide();
	}
});


var OccurrenceCategoryChange = Backbone.View.extend({
	
	events: {
		'dblclick .category_name' : 'editCategory',
		'click input[type="button"]': 'proceedWithChange',
	},
	
	initialize: function(options){
		_.bindAll(this, 'render', 'editCategory', "fillSelectBox", "proceedWithChange", 'triggerChange');
		
		$('.inplace_list').hide();
		this.category = new Category({_id: options.category_id });
		
		this.categoryList = new CategoryList(null,{scope: 1});
		
		this.categoryList.bind('all', this.fillSelectBox);
		this.categoryList.fetch();
		
		this.category.bind('change', this.render);
		this.category.fetch();
	},
	
	triggerChange: function(){
		this.trigger('changed');
	},
	
	proceedWithChange: function(evt){
		
		if (confirm('Quer alterar a categoria do objecto? Poderá perder dados no processo.')){
			var category_id = $('.category_list option:selected', this.el).val();
			var self = this;
			$.ajax({
				dataType: 'json',
				data: {},
				url: 'change_category/'+window.app.project+'/'+this.options.model_id+'/'+category_id+'/',
				success: function (data, status) { self.trigger('changed', {_id: data._id} ); },
				error: function(jqXHR, textStatus, errorThrown){
					new Error({ message: 'Oops. Algo correu mal. Por favor tente novamente. ('+textStatus+')'});
				}
			});
		} else {
			$('.inplace_list').hide();
			$('.category_name').show();
		}
		
		return false;
	},


	
	fillSelectBox: function(){
		var elm = $('.category_list');
		elm.html('');
		var cur_id = this.options.id;
		this.categoryList.each(function(cat){
			var id = cat.get('_id')['$oid'];
			elm.append('<option value="'+id+'" '+((id==cur_id)?'selected':'')+'>'+cat.get('name')+'</option>');
		})
	},
	
	editCategory: function(ev){
		$('.category_name').hide();
		$('.inplace_list').show();
		
	},
	
	render: function(){
		$('.category_name',this.el).html(this.category.get('name'));	
	}
});




