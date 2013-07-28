var SearchWidgetView = Backbone.View.extend({
	events: {
		'click #search_button': 'search_objects',
		'submit form': 'search_objects',
		'click .result_item': 'associate_object',
		'click #next_page': 'nextPage',
		'click #prev_page': 'previousPage',
		'click .well': 'itemSelected'
	},

	initialize: function(options){
		_.bindAll(this, 'render', 'search_objects', 'associate_object', 'nextPage', 'previousPage');

		this.category = options.category
		
		if( typeof(options.page) != 'undefined' ){
			this.page = options.page;
		}else{
			this.page = 0;
		}

		this.size = 10;
		this.pages = 0;
		this.currentPage = 1;

		

		this.render();
	},

	itemSelected: function(evt){
		$(".selected", this.el).removeClass("selected");
		$(".object_selected", this.el).addClass("selected");
		$(".object_selected", this.el).removeClass("object_selected");
	},

	nextPage: function(evt){
		if(this.page+1 < this.pages){
			this.page++;
			this.search_objects(evt);
		}
		
		evt.preventDefault();
	},

	previousPage: function(evt){
		if(this.page > 0){
			this.page--;
			this.search_objects(evt);
		}

		evt.preventDefault();
	},

	associate_object: function(evt){
			dispatcher.trigger("associate_item", {id: evt.target.id.split('_')[1]});
	},

	search_objects: function(evt){
		var that = this;

		query = $('#query').val()

		querydata = {
			query: {
				filtered:{
					query: {
						query_string: {
							query: $('#query').val()
						}
					},

					filter:{
							term: { category: this.category }
					}
				}
			},

			size: this.size,
			from: this.page * this.size,
		}

		querydata = {data: JSON.stringify(querydata)}

		//TODO - Put wating sign on before async request

		$.getJSON("search/", querydata, function(data){
			$("#results_panel", that.el).html('')
			console.log("Search results: "+data['hits']['total']);
			
			that.pages = Math.ceil(data['hits']['total'] / that.size);

			$("#next_page", that.el).removeAttr('disabled');
			$("#prev_page", that.el).removeAttr('disabled');

			if(that.page + 1 == that.pages){
				$("#next_page", that.el).attr('disabled','disabled');
			}

			if(that.page == 0){
				$("#prev_page", that.el).attr('disabled','disabled');
			}

			$("#page_indicator", that.el).text(''+(that.page+1)+"/"+that.pages);

			if("hits" in data){
				var results = [];
				var max = 0;
				var min = 0;

				for(i = 0; i < data['hits']['hits'].length; i++){
					var result = new Element(data['hits']['hits'][i]['_source'])
					$("#results_panel", that.el).append(new SearchItemView({
							model: result
					}).el);

					if(i==0){
						app.currentView.mapHandler.renderResultsShapes(result, {reset:true});
					}else{
						app.currentView.mapHandler.renderResultsShapes(result);
					}

					results.push(result);

					result.bind("map_selected", function(){
						that.itemSelected();
					})
				}
			}		
		});

		evt.preventDefault();
	},

	render: function(){
		$(this.el).html($("#inspector_search").jqote());
		return this;
	}
});
