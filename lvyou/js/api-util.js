define(function() {
	var api = {
		base: '/api/',
		toApiUrl: function(path) {
			if (path.indexOf(this.base) == 0) {
				return path;
			}
			return this.base + path;
		},
		toFlightQueryUrl: function(depCityCode, arrCityCode, date) {
			var path = 'flights/' + depCityCode + '-' + arrCityCode + '/' + date;
			return this.toApiUrl(path);
		},
		toLPQueryUrl: function (depCityCode, arrCityCode, date) {
			var path = 'lp/' + depCityCode + '-' + arrCityCode + '/' + date;
			return this.toApiUrl(path);
		},
		toStopQueryUrl: function(flightNo, date) {
			var path = 'stops/' + flightNo + '/' + date;
			return this.toApiUrl(path);
		},
		toRNCQueryUrl: function(flightNo, date, cabin) {
			var path = 'rnc/' + flightNo + '-' + cabin + '/' + date;
			return this.toApiUrl(path);
		},
		toRNCPackageUrl: function (flightNo, date, cabin, printPrice) {
			var path = 'rnc-product/' + flightNo + '-' + cabin + '/' + date + '/' + printPrice;
			return this.toApiUrl(path);
		},
		toBookingUrl: function(param) {
			var path = '/booking/';
			return path + '?' + $.param(param);
		},
		toOrderInputCheckUrl: function() {
			var path = 'order/check';
			return this.toApiUrl(path)
		},
		toCreateOrderUrl: function() {
			var path = 'order/';
			return this.toApiUrl(path)
		},
		toReadOrderUrl: function(orderNo) {
			var path = 'order/' + orderNo;
			return this.toApiUrl(path)
		},
		toReadRecentOrdersUrl: function() {
			var path = 'recent-orders';
			return this.toApiUrl(path)
		},
		toDownLoadOrdersUrl: function () {
		    var path = 'recent-downloadOrders';
		    return this.toApiUrl(path)
		},
		toRefundApplyUrl: function () {
			var path = 'order/refund';
			return this.toApiUrl(path);
		}
	};
	return api;
});