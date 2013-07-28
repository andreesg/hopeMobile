/*
This file containts views to be used anywhere we need to view or edit a certain field

The base implementation was made to be used inside the table on the Data tab on smartroads
*/

var StringView = Backbone.View.extend({
	events:{
		//'click' :'toggle',
		'change input': 'contentChanged',
	},

	initialize: function(options){
		this.edit = false;
		this.edit = options.edit;

		this.data = options.data;
		this.value = this.data.value;
		this.spec = options.spec;
	},

	render: function(){
		if(this.edit){
			$(this.el).html('<input class="edit" type="text" name="'+this.data.name+'" value="'+this.data.value+'" />');
		}else{
			$(this.el).html('<span>'+this.data.value+'</span>');
		}

		return this;
	},

	toggle: function(){
		//TODO - validate
		this.edit = !this.edit;

		this.render();
	},

	validate: function(){

	},

	contentChanged: function(evt){
		console.log("Changed "+this.data.name+"(string)");
	}
});

var IntegerView = Backbone.View.extend({
	events:{
		//'click' :'toggle',
		'change input': 'contentChanged',
	},

	initialize: function(options){
		this.edit = false;
		this.edit = options.edit;

		this.data = options.data;
		this.value = this.data.value;
		this.spec = options.spec;

	},

	render: function(){
		if(this.edit){
			$(this.el).html('<input class="edit" type="text" name="'+this.data.name+'" value="'+this.data.value+'" />');
		}else{
			$(this.el).html('<span>'+this.data.value+'</span>');
		}

		return this;
	},

	toggle: function(){
		//TODO - validate
		this.edit = !this.edit;

		this.render();
	},

	validate: function(){

	},

	contentChanged: function(evt){
		console.log("Changed "+this.data.name+"(integer)");
		this.validate();
	}
});

var RealView = Backbone.View.extend({
	events:{
		//'click' :'toggle',
		'change input': 'contentChanged',
	},

	initialize: function(options){
		this.edit = false;
		this.edit = options.edit;

		this.data = options.data;
		this.value = this.data.value;
		this.spec = options.spec;

	},

	render: function(){
		if(this.edit){
			$(this.el).html('<input class="edit" type="text" name="'+this.data.name+'" value="'+this.data.value+'" />');
		}else{
			$(this.el).html('<span>'+this.data.value+'</span>');
		}

		return this;
	},

	toggle: function(){
		//TODO - validate
		this.edit = !this.edit;

		this.render();
	},

	validate: function(){
		
	},

	contentChanged: function(evt){
		console.log("Changed "+this.data.name+"(real)");
		this.value = $("input", this.el).value();

		this.validate();
	}
});

var ArrayView = Backbone.View.extend({
	//TODO - This view must display a link that triggers a new list view with all the values
	events: {
		'click #link': 'loadList'
	},

	loadList: function(options){
		dispatcher.trigger("loadView", new ArrayInspectorView(this.data));
		console.log(this);
	},

	initialize: function(options){
		this.edit = options.edit;
		this.data = options.data;

		this.value = this.data.value;
		this.sped = options.sped;

		_.bindAll(this, "render", "loadList");

		console.log("Opening arrayView with data:");
		console.log(options);
	},

	render: function(){
		$(this.el).html("<span />");
		if(this.edit){
			$(this.el).append('<a id="link" ref="">See elements</a>');
		}else{
			$(this.el).append("Showing this array.");
		}

		return this;
	}
})

var ReferenceView = Backbone.View.extend({
	events:{
		'change input': 'contentChanged',
		'click #associate': 'associateObject',
		'click #link': 'loadLinkedObject',
		'click #peek': 'peekLinkedObject',
	},

	loadLinkedObject: function(evt){
		dispatcher.trigger("loadObject", this.value);

		evt.preventDefault();
	},

	peekLinkedObject: function(evt){
		console.log("Hello, this is peeking");

		var view = new ElementView({element_id: this.value});

		$("#peek", this.el).popover({title:"Detalhes de "+this.data.name, content: view.el});
		$("#peek", this.el).popover('toggle');
	},

	associateObject: function(evt){
		var that = this;
		var view = new SearchWidgetView({category: this.data.spec.ref['$oid'] });

		dispatcher.trigger("changed");

		$("#bottom_half").html('');
		$("#bottom_half").append(view.el);

		//TODO - Check if subviews can be used...this feels hackish
		dispatcher.unbind("associate_item");
		dispatcher.bind("associate_item", function(data){
				console.log(data);
				console.log(that.data);
				console.log(that.value);

				that.value = data.id;

				$("input", that.el).val(data.id);
		});
	},

	initialize: function(options){
		this.edit = false;
		this.edit = options.edit;

		this.data = options.data;
		this.value = this.data.value;
		this.spec = options.spec;
	},

	render: function(){
		if(this.edit){
			$(this.el).html('<span />')
			$(this.el).append('<input type="hidden" class="edit" name="'+this.data.name+'" value="'+this.value+'" />');
			$(this.el).append('<span><a id="link" href="">Ver</a> | <a id="peek" rel="popover" data-placement="left" data-trigger="manual" href="#data">Espreitar</a></span>');
			$(this.el).append('<a id="associate" class="button btn-small" rel="popover" data-trigger="manual" >alterar</a>')
		}else{
			$(this.el).html('<span>'+this.data.value+'</span>');
		}

		return this;
	},

	toggle: function(){
		//TODO - validate
		this.edit = !this.edit;

		this.render();
	},

	validate: function(){
		
	},

	contentChanged: function(evt){
		console.log("Changed "+this.data.name+"(reference)");
		this.validate();
	}
});
