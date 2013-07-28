var UploadDialog = Backbone.View.extend({
	id: 'uploadDialog',
	tagName: 'div',
	
	events: {
		'submit #upload_dialog': 'onSubmit'
	},
	
	initialize: function(options){
		_.bindAll(this, 'render', 'onSubmit');
		
		this.field_name = options.field_name;
		this.isTemporary = (options.isTemporary===undefined?false:options.isTemporary);
		
		this.render();
	},
	
	onSubmit: function(evt){
		$(".ui-dialog-titlebar-close", $(this.el).parent()).hide();
		this.loading.show();

		var that = this;
		$("#upload_dialog").ajaxSubmit({
			success: function(){
				that.loading.hide();
				$(".ui-dialog-titlebar-close", $(this.el).parent()).show();
				that.model.fetchWithSchema();
				that.remove();
				delete that;
			}
		});
		evt.preventDefault();
	},
	
	render: function(){
		
		$(this.el).html($('#photo_upload_template').jqote({	
															project_id: window.app.project ,
															model_id: this.model.get('_id')['$oid'],
															field_name: this.options.field_name,
															temporary: this.isTemporary?'1':'0'
														}));
		
		$("#photo_upload", this.el).append('<div style="display:none"><input type="hidden" name="csrfmiddlewaretoken" value="' + getCookie('csrftoken') + '" /></div>')
		$(this.el).dialog({ position: 'center', 
							modal: true,
							resizable: false,
							closeOnEscape: false,
							title: 'Adicionar Imagem' , 
						});
		
		$('#photo_upload', $(this.el)).MultiFile({
													list: '#photo_upload_list',
													accept: 'gif|jpg|png|bmp'
												});
		
		this.loading = $('#loading_photo_upload')
		this.loading.hide();
		return this;
	}
});