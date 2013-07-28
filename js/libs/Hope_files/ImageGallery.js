var ImageGalleryView = Backbone.View.extend({
	id: 'imageGalleryView',
	tagName: 'div',
	
	events: {
		'click #add_image': 'uploadDialog'
	},
	
	initialize: function(options){
		_.bindAll(this, 'render', 'renderImages', 'uploadDialog');
		
		if (this.options.fieldName === undefined || this.options.model === undefined) { return app.log('image gallery incorrectly initialized'); }
		
		this.fieldName = this.options.fieldName;
		this.model = this.options.model;
		
		if (this.photos == null) this.photos = [];
		
		this.isTemporary = (this.options.temporary==undefined?false:this.options.temporary);
		
		// se nao existir model, inicializa-o
		if (this.model == undefined){
			// TODO
		}
		
		this.model.bind('updateSchema', this.renderImages);
		
		this.render().renderImages();
			
	},
	
	uploadDialog: function(evt){
		new UploadDialog({model: this.model, field_name: this.fieldName, isTemporary: this.isTemporary });
		
		evt.preventDefault();
	},
	
	renderImages: function(){
		this.fancybox = null;
		this.photos = this.model.get(this.fieldName);
		
		var imgContainer = $('#image_list', this.el);
		imgContainer.html('');
		

		var lim = this.photos!=undefined?this.photos.length:0;
		for(var i=0;i<lim;i++)
		{
			imgContainer.append($('#single_image_template').jqote({ photo: this.photos[i] }));
		}
		
		this.fancybox = $("a[rel=group]", this.el).fancybox({
				'transitionIn'		: 'none',
				'transitionOut'		: 'none',
				'titlePosition' 	: 'none'
				});
	},
	
	render: function(){
		
		$(this.el).html($('#image_gallery_template').jqote());
		
		$(this.el).dialog({ position: 'center', 
							modal: true,
							resizable: true,
							closeOnEscape: false,
							title: 'Galeria' , 
						});
						
		return this;
	}
	
})