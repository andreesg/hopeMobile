// Schema Collection
// ===================

// Includes file dependencies
define([ "jquery","backbone","models/SchemaModel" ], function($, Backbone, SchemaModel) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend( {
        model: SchemaModel,
        url: rootUrl + "mobile/schemas/"

    });
    // Returns the Model class
    return Collection;

});
