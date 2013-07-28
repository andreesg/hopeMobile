var UsersController = Backbone.Router.extend(
{
	routes: {
		"login":  		"login",
		//"settings": 	"settings",
		"logout": 		"logout"
	},
	
	login: function(){
		if (app.user.isNew() || app.user.get('anonymous'))
			app.loginView = new LoginView();
	},
	
	logout: function(){
		$.ajax({
			url: '/logout',
			type: 'DELETE',
			complete: function() {
				$(window).bind('beforeunload', null);
				window.location = '/';
			}
		});
	},
	
});