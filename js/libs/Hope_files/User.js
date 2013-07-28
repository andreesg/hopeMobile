var User = Backbone.Model.extend({
	name: 'user',
	
	defaults: {
		anonymous: 1
	},
	
	url: function() {
		return '/account';
	},
	
	validate: function(attrs) {
		if (!attrs.anonymous) {
		}
	},
	
	checkIfLoggedIn: function() {
		$.ajax({
			url: '/test/',
			dataType: 'json',
			success: function(resp, status){
				if (resp.success){
					app.user.set({username:resp.user, id:resp.id, anonymous: false});
				}
			}
		})
	}
	
	
})