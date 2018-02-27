requirejs.config({

	baseUrl: '/js',

	paths: {

		jquery: 'jquery-1.11.2.min',

		bootstrap: 'bootstrap.min'

	}

});



var Sys = {

	parseQueryString: function() {

		var queryString = location.search.replace(/^\?/, '');

		var parameters = queryString.split(/\&/g);

		var result = {};

		for (var i = parameters.length; i-- > 0; ) {

			var array = parameters[i].split(/\=/);

			var name = decodeURIComponent(array[0]);

			var value = decodeURIComponent(array[1]).replace(/\+/g, ' ');

			result[name] = value;

		}

		return result;

	},



	renderTemplate: function(templateId, parameters) {

		var html = $('#' + templateId).html();

		for (var paramName in parameters) {

			var paramVal = parameters[paramName];

			var placeholder = '__' + paramName + '__';

			html = html.replace(new RegExp(placeholder, 'g'), paramVal);

		}

		return html;

	}

};