var ArrayInspectorView = Backbone.View.extend({
	tagName: 'div',

	events: {
		'click .remove': 'removeElement',
		'click .view': 'viewElement',
		'click .add_new': 'addNewElement'
	},

	initialize: function(options){
		_.bindAll(this, "render", "removeElement", "viewElement", "addNewElement")

		//This view needs a parent item to save to
		this.name = options.name;
		this.spec = options.spec;
		this.value = options.value;

		if(this.value.length == 0){
			this.spec.type = "array#reference";
			this.value = [0, 2, 4, 6];
		}

		this.render();
	},

	removeElement: function(evt){
		evt.preventDefault();
	},

	viewElement: function(evt){
		evt.preventDefault();
	},

	addNewElement: function(evt){
		evt.preventDefault();
	},

	renderSingle: function(root_type, value){
		var view;
		switch(root_type){
			case 'int':
			view = new IntegerView({edit: false, data: {name: this.name, spec: attr, value: value}});
			break;
			case 'real':
			view = new RealView({edit: false, data: {name: this.name, spec: attr, value: value}});
			break;
			case 'reference':
			view = new ReferenceView({edit: true, data: {name: this.name, spec: attr, value: value}});
			break;
			case 'array':
			view = new ArrayView({edit: false, data: {name: this.name, spec: attr, value: value}});
			break;
			default:
			view = new StringView({edit: false, data: {name: this.name, spec: attr, value: value}});
			break;
		}

		return view;
	},

	render: function(){
		var second_type = this.spec.type.split("#")[1];
		$(this.el).html($("#list_inspector_template").jqote());

		console.log("loading array with type "+second_type);
		var i;

		for(i = 0; i < this.value.length; i++){
			$("#items", this.el).append(this.renderSingle(second_type, this.value[i]).render().el);
		}

		console.log("finished loading array with "+this.value.length+" items");

		return this;
	}
});