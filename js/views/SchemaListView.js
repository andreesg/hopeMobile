// SchemaList View
// =============

// Includes file dependencies
define(["jquery", "backbone"], function($, Backbone) {

	var SchemaListView = Backbone.View.extend({
		events: {
			'change #listcategories': 'changedSelected'
		},

		initialize: function() {
			this.schemaModel = null;
			_.bindAll(this, "render");
			this.model.bind("reset", this.render, this);
			this.render();
		},

		changedSelected: function() {
				
			var schema = this.schemaModel.getByCid($("#listcategories :selected").val());

			var fields = schema.get('fields');

			var form = '<form id="input_form">';
			var fields = schema.get('fields');

			var has_photos = false;

			for (field in fields) {
				var name = field;
				if (fields[field]['type'] == 'array#photo') {
					has_photos = true;
					continue;
				}

				if ('readable' in fields[field]) {
					name = fields[field]['readable'];
				}

				if ('name' in fields[field]) {
					name = fields[field]['name']
				}
				form += "<input type='text' name='" + field + "' id='" + field + "' placeholder='" + name + "'>";
			}

			if (has_photos) {
				$("#takepicture").show();
				$("#selectpicture").show();
			} else {
				$("#takepicture").hide();
				$("#selectpicture").hide();
			}

			form += "</form>";
			$("#catdetails").html(form);
			$("#input_form").trigger('create');

			var that = this;

			$("#savebtn").click(function() {
				//alert("save click!");
				that.user = window.localStorage.getItem("user");
            	that.token = window.localStorage.getItem("auth_token");
			
				var options = new FileUploadOptions();
				options.fileKey = "file"
				options.fileName = "uploaded image"
				//options.mimeType = "multipart/form-data"
				options.chunkedMode = false

				var params = new Object();
				for (field in fields) {
					if (fields[field]['type'] == 'array#photo') {
						options.fileKey = field;
						continue;
					}

					params[field] = $("#" + field).val();
				}

				params['_categoryId'] = schema.get('_id')['$oid'];
				params.latitude = $('#_latfield').val();
				params.longitude = $('#_lngfield').val();
				params.token = that.token;
				params.user = that.user;
				params.save = true;

				options.params = params;

				//alert(JSON.stringify(options));
				var ft = new FileTransfer();
				ft.upload($("#camera_image").attr("src"), rootUrl + "mobile/save/", function() {
					alert("Saved successfully");
					$("#takepicture").hide();
					$("#selectpicture").hide();
					$("#camera_image").hide();
					$("#location_map").hide();
				}, function(error) {
					alert(JSON.stringify(error));
				}, options);

			});
		},

		render: function() {
			var that = this;
			this.schemaModel = this.model;
			var categories = "<select name='select-choice-1' id='listcategories'>"

			_.each(this.model.models, function(obj) {
				categories += '<option value="' + obj.cid + '">' + obj.get('name') + '</option>'
			});

			categories += "</select>"

			$(this.el).append($(categories));

			return this;
		}
	});
	return SchemaListView;
});