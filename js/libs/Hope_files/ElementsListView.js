/*
|--------------------------------------------------------------------------
| ElementsListView
|--------------------------------------------------------------------------
|
| This view creates the table with all elements or 
| result elements from a specific search.
| It renders the result table to be used in 
| table view mode. 
|
*/
var ElementsListView = Backbone.View.extend({
	events: {
		'click #search_button': 'search',
		'submit form': 'search',
		'click #next_page': 'nextPage',
		'click #prev_page': 'previousPage',
		'click #matrix_export': 'exportToMatrix',
		'click .add_restriction': 'generateRestriction',
		'click .submit_query' : 'search',
		'click .remove_restriction' : 'removeRestriction'
	},

	initialize: function() {
		_.bindAll(this, 'unload', 'addOne', 'addAll', 'onSelectRow', 'render', 'search', 'nextPage', 'previousPage', 'exportToMatrix', 'colorChooser', 'showColorChooser');

		this.elementsList = new ElementsList(null, {
			categoryId: this.options.schema.get('_id')
		});

		this.elementsList.on('all', this.render);

		this.page_size = 10;
		this.page = 0;
		this.pages = 0;
		this.query = "*";
		this.current_restriction = 1;

		this.filters = [];

		this.map_options = {
			colorize: true,

			parameter: 'C_EST',
			color_from: [0, 255, 0],
			color_to: [255, 0, 0],

			color_from_hex: "#00FF00",
			color_to_hex: "#FF0000"
		};

		this.startup = true;
		this.render();
	},

	removeRestriction: function(evt) {
		console.log("removing restriction");
		console.log(evt.target);
		//this.updateRestrictions(evt);
	},

	updateRestrictions: function(evt) {
		if (evt) {
			evt.preventDefault();
		}

		var filter_with = $(".restrictions tr", this.el);

		console.log(filter_with);

		this.filters = []

		for (var row = 0; row < filter_with.length; row++) {
			var field = $(".restriction_field", filter_with[row]);
			var restriction = $(".restriction_type", filter_with[row]);

			var value = $(".restriction_value", filter_with[row]);
			console.log("Restriction data")
			console.log(filter_with[row])

			console.log(restriction[0]);

			var label = field[0][field[0].selectedIndex].label
			var restriction_type = restriction[0][restriction[0].selectedIndex].value

			var restriction_value = value.val()

			console.log("Restriction " + row + ": " + label + " " + restriction_type + " " + restriction_value);

			this.filters.push({
				'field': label,
				'type': restriction_type,
				'value': restriction_value
			});
		}

		console.log("Number of restrictions: " + filter_with.length)
		console.log("updated filters")
		console.log(this.filters)
	},

	generateRestriction: function(evt, apply) {
		var that = this;
		var template_html = _.template($("#restriction_item_template").html());
		var new_restriction = document.createElement("tr")
		$(new_restriction).html(template_html);

		//console.log(template_html)

		//console.log(new_restriction)

		$(".restrictions", this.el).append(new_restriction);

		console.log("Making restrictions for cat:");
		console.log(this.options.schema)

		var field = $(".restriction_field", new_restriction);

		for (a in this.options.schema.attributes) {
			var option = $("<option/>");
			option.attr("value", a)
			option.text(a)

			field.append(option)
		}

		field.change(function(data) {
			var target = data.target;

			var field_name = target[target.selectedIndex].label;

			var field = that.options.schema.get(field_name);

			$(".restriction_type", new_restriction).empty();

			if (field.type == "int" || field.type == "real") {
				$(".restriction_type", new_restriction).append($("<option/>").attr("value", "gt").text(">"));
				$(".restriction_type", new_restriction).append($("<option/>").attr("value", "gte").text(">="));
				$(".restriction_type", new_restriction).append($("<option/>").attr("value", "lt").text("<"));
				$(".restriction_type", new_restriction).append($("<option/>").attr("value", "lte").text("<="));
				$(".restriction_type", new_restriction).val("gt")

			} else {
				$(".restriction_type", new_restriction).append($("<option/>").attr("value", "match").text("Matches"));
				$(".restriction_type", new_restriction).val("match");
			}

			if (apply) {
				$(".restriction_type", new_restriction).val(apply.type)
			}

			$(".restriction_type", new_restriction).change(function(data) {
				that.updateRestrictions();
			});

			that.updateRestrictions();

			console.log(that.options.schema.get(field_name));
		});

		if (apply) {
			field.val(apply.field)
			$(".restriction_value", new_restriction).val(apply.value)
		}

		field.change()


		$(".restriction_value", new_restriction).change(function() {
			that.updateRestrictions();
		});

		this.updateRestrictions();

		$(".restriction_number", new_restriction).text(this.current_restriction++);

		if (evt) {
			evt.preventDefault();
		}

		//$(".restriction_field").select2();

	},

	exportToMatrix: function(evt) {
		var txt = 'Please enter the problem name:<br /><input type="text" id="problemName" name="problemName" value="Imported Problem" />'
		var that = this;
		$.prompt(txt, {
			buttons: {
				Ok: true,
				Cancel: false
			},
			callback: function(e, v, m, f) {
				if (!v)
					return;

				var problemName = "Imported Problem";
				if (v != undefined) {
					problemName = f.problemName;
				}

				var elementsData = that.elementsList.toJSON();
				for (var i = 0; i < elementsData.length; i++) {
					for (key in elementsData[i]) {
						if (key.startsWith('_') || key == 'geo') {
							delete elementsData[i][key];
						}
					}
				}

				var jsonData = JSON.stringify(elementsData);

				$.post('/matrix/import/', {
					'problemName': problemName,
					data: jsonData
				}, function(data) {
					window.location = '/matrix/';
					/* log layer erro */
					//alert("Success exporting layer");
					//new Notice({message: 'Layer exportada com sucesso'});
				});
			}
		});

		evt.preventDefault();
	},

	nextPage: function(evt) {
		evt.preventDefault();
		console.log("nextPage");
		if (this.page + 1 < this.pages) {
			this.page++;
			this.search(evt);
		}
		return false;
	},

	previousPage: function(evt) {
		evt.preventDefault();
		console.log("prevPage");
		if (this.page > 0) {
			this.page--;
			this.search(evt);
		}
		return false;
	},

	search: function(evt) {
		var that = this;
		this.query = $('#query', this.el).val();
		this.page_size = parseInt($('#res_per_page', this.el).val());

		querydata = {
			query: {
				filtered: {
					query: {
						query_string: {
							query: $('#query', this.el).val()
						}
					},

					filter: {
						and: [{
								term: {
									category: this.options.schema.get('_id')
								}
							},
						]
					}
				}
			},

			size: this.page_size,
			from: this.page * this.page_size,
		}
		//TODO - for each in that.filters

		console.log("before filters");
		console.log(querydata);

		for (var i = 0; i < this.filters.length; i++) {
			var filter = this.filters[i];

			var field = this.options.schema.get(filter.field);

			var query_filters = querydata['query']['filtered']['filter']['and'];

			if (field.type == 'int' || field.type == 'real') {
				var range_query = {}
				range_query['range'] = {}
				range_query['range'][filter.field] = {}
				range_query['range'][filter.field][filter.type] = filter.value;

				query_filters.push(range_query)
			} else {
				var range_query = {}
				range_query['term'] = {}
				range_query['term'][filter.field] = {}
				range_query['term'][filter.field] = filter.value;

				query_filters.push(range_query)

				//TODO - Assume something other than match
				//query_filters.push( {['term'][filter['field']]: filter['value'] });
				//querydata['query']['filtered']['query']['term'] // TODO - This is for strings, except match (I think), this is more expensive than filtering and affects ordering
			}

		}

		console.log("After filters");
		console.log(querydata);

		querydata = {
			data: JSON.stringify(querydata)
		}

		$.getJSON("search/", querydata, function(data) {
			if ("hits" in data) {
				var newElementsList = new SearchElementsList();

				that.pages = Math.ceil(data['hits']['total'] / that.page_size);

				for (i = 0; i < data['hits']['hits'].length; i++) {
					result = new Element(data['hits']['hits'][i]['_source']);
					result.set({
						'_id': {
							'$oid': result.get('_id')
						}
					});
					newElementsList.add(result);
					var table_index = i + 1;
				}
				that.elementsList = newElementsList;
			}
			that.render();
		});

		app.currentView.mapHandler.clearMap();

		if (evt)
			evt.preventDefault();
	},

	unload: function() {
		// descarregar lista anterior;
	},

	addOne: function(obj) {
		var data = {};
		data['_id'] = obj.get('_id')['$oid'];
		data['name'] = obj.get('name');

		for (attr in obj.attributes) {
			if (attr == '_id') continue;
			if (attr == 'name') continue;

			data[attr] = obj.get(attr);
		}
		$(this.tableData).addRowData('last', data);
	},

	addAll: function() {
		$("#loading").show();

		var that = this;
		var first = true;
		var idx = 0;

		var max = 0;
		var min = 0;

		this.elementsList.each(function(element) {
			var toAdd = element.clone();

			var table_index = idx + 1;
			toAdd.bind("map_selected", function() {
				that.tableData.setSelection(table_index);
			});

			if (that.map_options.colorize) {
				var value = toAdd.get(that.map_options.parameter);
				if (i == 0) {
					max = value;
					min = value;
				} else {
					if (value > max) {
						max = value;
					}
					if (value < min) {
						min = value;
					}
				}
			}
			if (first) {
				first = false;
				app.currentView.mapHandler.renderResultsShapes(toAdd, {
					reset: true
				});
			} else {
				app.currentView.mapHandler.renderResultsShapes(toAdd);
			}
			idx++;
			that.addOne(element);
		});

		this.elementsList.each(function(result) {
			var value = result.get(that.map_options.parameter);

			value = 1.0 * (value - min) / (max - min);
			//var options = {};
			if (i == 0) {
				var options = {
					reset: true,
					colorize: true,
					value: value,
					color_from: that.map_options.color_from,
					color_to: that.map_options.color_to
				}
				// commented just for testing
				app.currentView.mapHandler.renderResultsShapes(result, options);
			} else {
				var options = {
					colorize: true,
					value: value,
					color_from: that.map_options.color_from,
					color_to: that.map_options.color_to
				}
				// commented just for testing
				app.currentView.mapHandler.renderResultsShapes(result, options);
			}
		})

		$("#loading").hide();
	},

	buildCollumnModel: function(schema) {
		var colModel = [];
		var colNames = []
		colModel.push({
			name: '_id',
			index: '_id',
			hidedlg: true,
			hidden: true
		});
		colNames.push('_id');
		colModel.push({
			name: 'name',
			index: 'name'
		});
		colNames.push('Name');

		console.log(schema.attributes)
		for (var attr in schema.attributes) {
			if (attr != 'name' && attr != '_id' && schema.attributes[attr].type != 'array#photo') {
				colModel.push({
					name: attr,
					index: attr
				});
				colNames.push(schema.attributes[attr]['readable']);
			}
		}

		return [colNames, colModel];
	},

	onSelectRow: function(id) {
		dispatcher.trigger("loadObject", this.tableData.getRowData(id)._id);
	},

	colorChooser: function() {
		var color_chooser = $(_.template($("#color_chooser_template").html()));
		//var color_chooser = $( $("#color_chooser_template").jqote() );

		return color_chooser;
	},

	showColorChooser: function() {
		console.log("showing popover");
		var that = this;

		$("#map_color1").val(this.map_options.color_from_hex);
		$("#map_color2").val(this.map_options.color_to_hex);


		for (var attr in this.options.schema.attributes) {
			if (attr != 'name' && attr != '_id' && this.options.schema.attributes[attr].type != 'array#photo' && this.options.schema.attributes[attr].type != 'string' && !this.options.schema.attributes[attr].type.startsWith("reference")) {
				$("#field_selection").append($('<option></option>').attr("value", attr).text(attr));
			}
		}

		$("#field_selection").val(this.map_options.parameter);

		$("#field_selection").change(function() {
			that.map_options.parameter = $("#field_selection").val();
		})

		$("#map_color1").miniColors({
			letterCase: 'uppercase',
			change: function(hex, rgb) {
				that.map_options.color_from = [rgb.r, rgb.g, rgb.b];
				that.map_options.color_from_hex = hex;
			}
		});

		$("#map_color2").miniColors({
			letterCase: 'uppercase',
			change: function(hex, rgb) {
				that.map_options.color_to = [rgb.r, rgb.g, rgb.b];
				that.map_options.color_to_hex = hex;
			}
		});
	},

	render: function() {
		$(this.el).html(_.template($("#elements_list_template").html()));

		$("#choose_colors").popover({
			title: "Estilo de cor no mapa",
			content: this.colorChooser,
			placement: "left",

		}).click(this.showColorChooser)

		$("#next_page", this.el).removeAttr('disabled');
		$("#prev_page", this.el).removeAttr('disabled');

		if (this.page + 1 >= this.pages) {
			$("#next_page", this.el).attr('disabled', 'disabled');
		}

		if (this.page == 0) {
			$("#prev_page", this.el).attr('disabled', 'disabled');
		}

		$('#query', this.el).val(this.query)
		$('#res_per_page', this.el).val(this.page_size)
		$('#page_indicator', this.el).text((this.page + 1) + '/' + this.pages)

		//TODO - Put the previous restrictions in place
		var existing_filters = this.filters.slice(0);
		this.current_restriction = 1;

		for (var i = 0; i < existing_filters.length; i++) {
			this.generateRestriction(null, existing_filters[i]);
		}

		var colData = this.buildCollumnModel(this.options.schema);


		var options = {
			datatype: "local",
			colNames: colData[0],
			colModel: colData[1],
			height: 'auto',
			width: $("#results_container").width(), // parent element width to fit
			multiselect: false,
			onSelectRow: this.onSelectRow,
			gridview: true,
			rowNum: this.page_size
		};

		this.tableData = $(this.el).find('.grid').jqGrid(options);

		this.addAll();

		this.tableData.trigger("reloadGrid");

		if (this.startup) {
			this.search()
			this.startup = false;
		}

		return this;
	}
});
