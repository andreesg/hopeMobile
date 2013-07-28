/*
|--------------------------------------------------------------------------
| ReportView
|--------------------------------------------------------------------------
| 'Front Controller' to #report view
| View responsible for object creation with map shape editing 
| features.
| 
*/

var ReportView = Backbone.View.extend({

	/**
	 *
	 * el: 			report-page is the div#id 
	 * template: 	#report-page-template, find it in templates/templates-report.html.
	 *
	 **/
	events: {
		'click #new_occurrence_btn': 'createNewOccurrence',
		'click .sort_d': 'sortCollection',
		'click .sort_n': 'sortCollection',
		//'click .tocc_item': 'onSelectedReport',
	},

	loaded: false,
	editMode: false,

	/**
	 *
	 *	nothing special goes here, just binding events
	 *
	 **/
	initialize: function() {
		_.bindAll(this, 'load', 'unload', 'isLoaded', 'hide', 'show','cleanView', 'initHook', 'exitHook', 'fillSelectBox','createNewOccurrence','renderOccurrenceList', 'sortCollection','onSelectedReport' );
		this.el = $("#ocurrence-box");
		this.render();
	},



	/**
	 *
	 *	function that's triggered when click sorting by something
	 *
	 **/
	sortCollection: function(evt)
	{
		console.log("inside sort collection");
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

	/**
	 *
	 *	Load function, here we create the skeleton template
	 *  for ReportView and create the handlers for its functionallity
	 *  we load this view creating the necessary collections and subviews and
	 *  adding event listeners.
	 *
	 **/
	load: function(options) {
		if (!this.isLoaded()){
			var that = this;
			this.renderReportTemplate();

			// collections needed
			this.categoryList = new CategoryList(null,{scope: 1});
			this.occurrenceList = new TemporaryOccurrenceList();
			// map instance
			this.occurrencesMap = new TOcMapView({view: this});
			this.occurrenceList.view = this;

			// events
			this.categoryList.on('reset', this.fillSelectBox);
			this.occurrenceList.on('reset', this.renderOccurrenceList, this);
			this.occurrenceList.on('add', this.renderOccurrenceList, this);
			this.occurrenceList.on('remove', this.renderOccurrenceList, this);

			// sorting
			this.occurrenceList.comparator = function(occurrence){
				return occurrence.get('geo')['start'].distance;
			}

			// let's get the collection data from backend
			this.categoryList.fetch({reset:true});
			this.occurrenceList.fetch({
				reset: true, 
				success: function(model, resp){
							if (model.view.options.oid != undefined){
								model.view.loadOccurrence(model.view.options.oid);
							}
						}
			});

			this.sortByDistance = true;

			/*$('#occurrence_pane').show();
			if (this.options)
			this.occurrencesMap = new TOcMapView({view: this});
			this.occurrencesListView = new TOccurrenceListView({	el: $('#'+this.id+' .middle-west'), 
																	oid: options.oid,
																	view: this});
			*/
		}
		this.loaded = true;
	},

	/**
	 *
	 * Renders the skeleton template, it appends it to page div
	 *
	 **/
	renderReportTemplate: function() {
		var page = _.template($("#report-page-template").html());
		$("#page").append(page);

		var formTemplate = _.template($("#new-occurrence-form").html());
		$("#form-container").html(formTemplate);
		//$(".category_list").select2();

		var that = this;
		
		$("#new_occurrence_btn").on('click', function(evt) {
			that.createNewOccurrence(evt);
		});

		/*$(".sort_n").on('click', function(evt) {
			that.sortCollection(evt);
		});*/
	},

	/**
	 *
	 * Callback function triggered when we select a report from the list
	 * just loads the occurrence
	 *
	 **/
	onSelectedReport: function(evt) {
		this.loadOccurrence(evt.target.rel);
		evt.preventDefault();
	},

	/**
	 *
	 * Adds the dynammically categories list to
	 * select option
	 *
	 **/
	fillSelectBox: function() {
		var elm = $('#chzn_new_occurrence');
		elm.html('');
		var cur_id = this.options.id;

		this.categoryList.each(function(cat){
			var id = cat.get('_id')['$oid'];
			elm.append('<option value="'+id+'" '+((id==cur_id)?'selected':'')+'>'+cat.get('name')+'</option>');
		});

		elm.select2();
	},

	/**
	 *
	 * renders a single occurrence item, called by 
	 * renderOccurrenceList
	 *
	 **/
	addOne: function(obj) {
		var that = this;
		var domID = _.uniqueId('occ_item_');
		var tmpl = _.template($('#occurrences_item').html(),{
																id:obj.get('_id')['$oid'],
																name:obj.get('name'),
																domID: domID
															});
		$("#ocurrence-box-list").append(tmpl);

		
		$("#" + domID).on('click', function(evt) {
			that.onSelectedReport(evt);
		});
		
	},

	/**
	 *
	 * renders a the dinammicaly fetched occurrenceList
	 *
	 **/
	renderOccurrenceList: function() {
		console.log("[ReportView] rendering occurrence list");
		$("#ocurrence-box-list").html('');
		this.occurrenceList.each(this.addOne, this);
	},

	/**
	 *
	 * this function is a callback function triggered
	 * by the click event of new occurrence button
	 *
	 **/
	createNewOccurrence: function(evt){
		console.log("[ReportView] creating new occurrence");
		var category = $('#chzn_new_occurrence').val();
		
		// for now, get the center of the map in the screen
		var startCoordinate = this.occurrencesMap.mapObj.center;
		var newCoordinates = startCoordinate.transform(	this.occurrencesMap.mapObj.getProjectionObject() , this.occurrencesMap.projection);
		
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
										BarNotification.init({message: 'New Temporary Report created', type: 'success'});

								},
									silent: true
								});
			
			// actualizar a lista de ocorrencias
			//this.occurrenceList.fetch();
		}
		return false;
	},

	loadOccurrence: function(oid){
		app.log('loading '+oid);

		if(this.currentOccurrence != null) {
			this.cleanView(this.currentOccurrence);
		}

		if (oid.length > 1){
			
			this.currentOccurrence = new ReportFormView({	model_id: oid,//obj[0], 
															el: $('#edit-box'), 
															collection: this.occurrenceList,
															view: this
														});
			app.log('changing map occurrence');
			//this.options.view.occurrencesMap.changeOccurrence(obj[0]);
		}
	},
	
	cleanView: function(element) {
		element.undelegateEvents();
		element.unbind();
	},

	render: function() {
		//creates the form template skeleton
		

		//this.renderOccurrenceList();

		//fill the select box with categories
		//this.fillSelectBox();

	},

	/* --- HELPERS --- */
	hide: function() {
		$("#report-page").hide();
	},
	
	show: function() {
		$("#report-page").show();
	},

	initHook: function() {
		console.log('[ReportView] Initting ReportView');
		var that = this;

		if(!this.isLoaded) {
			this.load();
		}

	},

	exitHook: function() {
		this.options.app.log('[ReportView] Exiting ReportView');
	},

	unload: function() {
		this.loaded = false;
	},
	
	isLoaded: function() {
		return this.loaded;
	},
	/* -- -- */

});


/*
|--------------------------------------------------------------------------
| ReportFormView
|--------------------------------------------------------------------------
| This view generates the form element for the specific type of element
| It's a subview of ReportView created when loading an object
| 
*/
var ReportFormView = Backbone.View.extend({

	events: {
		'click .confirm_occurrence': 'confirmOccurrence',
		'click .delete_occurrence': 'deleteOccurrence',
		'click .edit_geometry': 'editGeometry',
		'click .associate_shape': 'associateShape',
		'click .cancel_association': 'cancelAssociation',
		'click .cancel_edit': 'cancelEdit',
		'click .button-control' : 'toggleControl'
	},
	
	initialize: function(){
		_.bindAll(this, 'render', 'confirmOccurrence', 'deleteOccurrence' , 'isConfirmed', 'associateShape', 'editGeometry', 'cancelAssociation', 'toggleAssociation', 'cancelEdit', 'toggleEdit', 'onCategoryChange', 'setMode');
		
		$.fn.editable.defaults.mode = 'popup';


		this.model = new TemporaryOccurrence({_id: {"$oid": this.options.model_id }});
		this.model.on('change', this.isConfirmed);
		this.model.on('updateSchema', this.render);
		
		this.model.collection = this.options.collection;
		this.view = this.options.view;
		
		this.model.view = this;
		
		this.model.fetchWithSchema({
			success: function(model, resp){
				//console.log(model);;
				//console.log(model);
				model.elementModel.view.view.occurrencesMap.changeOccurrence(model.elementModel);
			},
			error: function(model, resp){
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

	setMode: function(state){
		if (state>0){
			$(this.el).append('<div id="occurrences_view_disabled" class="disabled_view"></div>');
			$(this.el).css('overflow', 'hidden');
		} else {
			$(this.el).find('#occurrences_view_disabled').remove();
			$(this.el).css('overflow-y', 'auto');
		}
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
			//this.view.setMode(1);  // set in associate Mode
			$('.associate_shape').html('<i class="icon-minus"></i> <span>Save the segment</span>');
			$('.occurrence_operations .button').hide();
			$('.associate_shape').show();
			$('.cancel_association').show();
		} else {
			//this.view.setMode(0); // set in normal Mode
			$('.associate_shape').html('<i class="icon-minus"></i> <span>Associate a segment</span>');
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
			//this.view.setMode(2);
			$('.edit_geometry').html('<i class="icon-pencil"></i> <span>Save geometry</span>');
			$('.occurrence_operations .button').hide();
			$('.edit_geometry').show();
			$('.cancel_edit').show();
		} else {
			
			$(this.el).append('<div id="occurrences_view_disabled" class="disabled_view"></div>');
			$(this.el).css('overflow', 'hidden');
			//this.view.setMode(0);
			$('.edit_geometry').html('<i class="icon-pencil"></i> <span>Draw Geometry</span>');
			$('.occurrence_operations .button').show();
			$('.cancel_button').hide();
			$('.cancel_edit').hide();
		}
	},
	
	editGeometry: function(evt){
		this.editMode = !this.editMode;
		if (this.editMode){
			BarNotification.init({message: 'You are on Map edit mode. Use Map controls buttons.', type: 'info'});
			this.model.trigger('startEditGeo');
			this.toggleEdit(true);
		} else {
			this.model.trigger('endEditGeo');
			this.toggleEdit(false);
		}
		
		evt.preventDefault();
	},

	toggleControl: function(evt) {
		console.log(evt.target.rel);
		this.model.trigger('toggleControl', {'type' : evt.target.rel});
		evt.preventDefault();
	},

	deleteOccurrence: function(evt){
		if(!this.editMode){
			var oid = evt.target.rel;
			var that = this;

			this.model.destroy({success: function(model, resp){
				var obj = model.collection.filter(function(occ){
					return occ.get('_id')['$oid'] == model.get('_id')['$oid'];
				});
				model.collection.remove(obj);
				model.destroyHook();
				BarNotification.init({message: 'Temporary Report Deleted', type: 'alert'});
				// manually trigger change
				//model.change();
				console.log("[ReportView] Elemento eliminado");
				$("#edit-box").html('');

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
				model.destroyHook();

				BarNotification.init({message: "Your report was confirmed. It's now listed in the Search tab", type: 'success'});
				$("#edit-box").html('');
				// manually trigger change
				//model.change();

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

		var tmpl = _.template($('#occurrence_editor').html(),{id: this.model.get('_id')['$oid']});
		$(this.el).html(tmpl);

		var table = $("#selected-occurrence-table");


		if (this.model.schema) {

			/* attributes object properties - name, readable, type */
			var r = 0;

			for (attr_key in this.model.schema.attributes) {

				var attr = this.model.schema.get(attr_key);
				var attr_val = this.model.get(attr_key);
				attr_val = attr_val == null ? '' : attr_val;

				console.log(attr);

				if (attr_key[0] == '_') {
					continue;
				}

				if (attr.type == 'array#photo') {
					var _photos = attr_val;
					var divid = _.uniqueId('thumbs_');
					var gtemplate = _.template($("#new-photos-gallery").html(), {
						photos: _photos, divid : divid
					});

					$("#occ_related_photos").html(gtemplate);
					$("#thumbs a").undelegate();
					// initialize touchTouch()
					$("." + divid + " a").touchTouch();
					
				} else {
					table.append('<tr><td width="15%">' + attr.readable + '</td><td width="50%"><a href="#" class="editable" id="' + attr.readable + '" name="' + attr.name + '" data-type="text">' + attr_val + '</a></td><td width="35%"><span class="muted">' + attr.type + '</span></td></tr>');
				}
			}
		}

		// initialize x-editable()
		$('.editable').editable();

		//automatically show next editable
		$('.editable').on('save', function(){
		    var that = this;
		    setTimeout(function() {
		        $(that).closest('tr').next().find('.editable').editable('show');
		    }, 200);
		});



		//$(this.el).html($('#occurences_east_template').jqote({id: this.model.get('_id')['$oid']}));	
		
		
		//this.inspector = new InspectorTableView({el: $('.inspector_placeholder', this.el), edit: true, model: this.model, temporary: true });
		
		/*
		this.category_changer = new OccurrenceCategoryChange({	el: $('#category_change', this.el), 
																category_id: this.model.get('category')['$oid'],
																model_id: this.model.get('_id')['$oid']
															});
		this.category_changer.bind('changed', this.onCategoryChange);
		*/
		
		$('.cancel_association').hide();
		$('.cancel_edit').hide();
	}
});