//----------------------------------------------------------
// 航班模块
//----------------------------------------------------------
define(function(require, exports, module) {
	var $ = require('jquery');
	var dateUtil = require('date-util');

	// 参数
	exports.param = Sys.parseQueryString();

	// 初始化
	exports.init = function() {
		var that = this;
		var param = that.param;
         
		var api = require('api-util');

		// 标题
		$('#header h1').html('机票预定');
		// 返回
		$('#back-button').attr('href', param.backUrl)
		// 详细信息
		$('#flight-info').html(Sys.renderTemplate('flight-info', param));

		// 返现标签
		if (param.cr * 1) {
			$('.product-tags').prepend(Sys.wrapTag('返', param.cr + '元', '现金奖励将在机票使用后返回您在旅伴的账户'));
		}
		// 行程单标签
		if (param.it & 1) {
			$('.product-tags').prepend(Sys.wrapTag('<i class="fa fa-paperclip"></i>', '行程单', '提供全额行程单'));
		}
		// 发票标签
		if (param.it & 2) {
			$('.product-tags').prepend(Sys.wrapTag('<i class="fa fa-paperclip"></i>', '发票', '提供全额发票'));
		}

		// 套餐信息
		var pkgDiv = $('#packages');
		param.pkgs = eval('(' + param.pkg + ')');
		for (var pkgIndex in param.pkgs) {
			var pkg = param.pkgs[pkgIndex];
			pkgDiv.append(Sys.renderTemplate('package-template', pkg));
		}
		// 默认选中
		$('[name=package]').first().prop('checked', true);


		if (param.bf != undefined) {

		    // 基准价格
		    var bf = eval('(' + param.bf + ')');
		    var cabinFare = bf[param.l];
		    if (cabinFare == undefined || !cabinFare.ow) {
		        // 没有基准价格，不能出儿童票
		        $('[value=Child]').parent().addClass('notable').html('此航班属特价航班，无法购买儿童票');
		        param.childPrice = 0;
		    } else {
		        // 儿童价格
		        param.childPrice = calcChildPrice(cabinFare.ow);
		    }
		} else {
		    $('[value=Child]').parent().addClass('notable').html('此航班属特价航班，无法购买儿童票');
		    param.childPrice = 0;
		}

		// 添加和删除乘客
		var addPsgHandler = addPassenger.bind(that);
		var rmvPsgHandler = removeLastPassenger.bind(that);
		$('.add-passenger').on({
			'click': addPsgHandler,
			'tap': addPsgHandler
		});
		$('.remove-passenger').on({
			'click': rmvPsgHandler,
			'tap': rmvPsgHandler
		});
		// 第一位乘客
		addPsgHandler();
		$('#passenger_type1c').parent().remove();
		$('#name1').on('blur', function() {
			if ($('#cname').val().length != 0) {
				return;
			}
			$('#cname').val($(this).val());
		});

		// 输入检查
		var icHandler = inputCheck.bind(that);
		$('.btn-next').on({
			'click': icHandler,
			'tap': icHandler
		});

		// 超时信息
		function timeoutAlert() {
			Sys.showModalDialog('信息已过期', '当前页面长时间未操作，航班价格可能变动，将为您重新查询。', function() {
				location.href = param.backUrl;
			});
		}
		if (!param.ts || isNaN(param.ts) || new Date().getTime() >= param.ts * 1 + Date.MILLIS_PER_MINUTE * 10) {
			timeoutAlert();
			return;
		}
		// 超时设置
		setTimeout(timeoutAlert, 10 * Date.MILLIS_PER_MINUTE);

		$.getJSON(api.toRNCPackageUrl(param.fn, param.fd, param.sc, param.pp), function (rncPkg) {
			pkgDiv.append(Sys.renderTemplate('package-template', rncPkg));
			param.pkgs.push(rncPkg);
		});
	};

	// 计算儿童价格
	function calcChildPrice(baseFare) {
		return Math.round((baseFare + 9.9) / 20) * 10;
	}

	// 添加乘客
	function addPassenger() {
		var that = this;
		var count = $('#passengers .passenger').length;
		if (count >= 9 || count > that.param.as) {
			return;
		}
		var index = $('#passengers .passenger').length + 1;
		$('#passengers')
			.append(Sys.renderTemplate('passenger-template', {pid: index}))
			.find('.passenger [name^=id]').last().on('blur', function() {
				var that = $(this);
				if (!$('#' + that.data('cardtype')).is(':checked')) {
					return;
				}
				var idCardNo = that.val();
				if (idCardNo == null || idCardNo.length <= 14) {
					return;
				}
				var birthdate = idCardNo.replace(/\d{6}(\d{4})(\d{2})(\d{2}).*/g, '$1-$2-$3');
				$('#' + that.data('birthdate')).val(birthdate);
			});
		that.showSummary();
	}

	// 删除乘客
	function removeLastPassenger() {
		if ($('#passengers .passenger').length <= 1) {
			return;
		}
		$('#passengers .passenger:last-child').remove();
		var that = this;
		that.showSummary();
	}

	// 生成订单信息
	exports.generateOrder = function() {
		var that = this;
		var param = that.param;
		var bs = require('bootstrap');

		var order = {
			Parameter: {
				DepCityCode: param.dcc,
				ArrCityCode: param.acc,
				FlightDate: param.fd
			},
			Flight: {
				fn: param.fn,
				dac: param.dac,
				ddt: param.ddt.replace(/ /g, 'T') + ':00',
				aac: param.aac,
				adt: param.adt.replace(/ /g, 'T') + ':00'
			},
			Cabin: {
				l: param.l,
				sc: param.sc
			},
			PolicyCode: param.pc,
			Product: {
				id: param.id,
				it: param.it,
				pc: param.pc,
				p: param.p,
				pp: param.pp,
				cr: param.cr,
				pr: param.pr
			},
			Passengers: [],
			Packages: [],
			ContactName: $('#cname').val(),
			ContactPhone: $('#cmobile').val(),
			Extras: {
				dan: param.dan,
				aan: param.aan
			}
		};
		if ($('[name=NeedDelivery]').is(':checked')) {
			order.Delivery = {};
			var attributes = ['Name', 'Phone', 'ZipCode', 'Address'];
			for (var attributeIndex in attributes) {
				var attributeName = attributes[attributeIndex];
				order.Delivery[attributeName] = $('#delivery' + attributeName).val()
			}
		}
		that.order = order;

		var psgDivs = $('#passengers .passenger');
		psgDivs.each(function() {
			var psgDiv = $(this);
			var psg = {
				Name: psgDiv.find('[name^=name]').val(),
				Type: psgDiv.find('[name^=passenger_type]:checked').val(),
				CardType: psgDiv.find('[name^=card_type]:checked').val(),
				CardNo: psgDiv.find('[name^=id]').val(),
				Birthdate: psgDiv.find('[name^=birthdate]').val()
			};
			order.Passengers.push(psg);
		});
		var pkgs = param.pkgs;
		$('#packages [name=package]').each(function(i) {
			if ($(this).is(':checked')) {
				order.Packages.push(pkgs[i]);
			}
		});
	};

	// 验证输入正确性
	function inputCheck() {
		var that = this;
		var api = require('api-util');

		that.generateOrder();
		that.showSummary();

		$('.err-msg').html('').addClass('hidden');

		var oicUrl = api.toOrderInputCheckUrl();
		$.ajax(oicUrl, { 
			method: 'post',
			data: JSON.stringify(that.order),
			contentType: 'application/json',
			success: function(result) {
				if (result.Status.Code != '0000') {
					showErrorMessage(result.ErrorField, result.Status.Message);
					return;
				}
				createOrder(Booking.order);
			},
			error: function(result) {
				if (result.status = 401) {
					Sys.showLoginPage();
				}
			}
		});
	}

	// 订单明细效果
	(function() {
		function showOrderSummaryPanel() {
			$($(this).data('toggle')).toggleClass('hidden');
			$(this).find('.dropdown,.dropup').toggleClass('dropup').toggleClass('dropdown');
			$('html, body').animate({ scrollTop: $(document).height() }, 900);
		}
		$('.order-summary-trigger').on({
			'click': showOrderSummaryPanel,
			'tap': showOrderSummaryPanel
		});
	})();
	// 显示错误信息
	function showErrorMessage(errField, errMsg) {
		Sys.showModalDialog("请重新检查", errMsg);
		var msgField = $('#' + errField + '-err').html(errMsg).removeClass('hidden');
		var formGroup = msgField.parent();
		$('html, body').animate({ scrollTop: formGroup.offset().top - $('header').height() - 20}, 900);
	}

	// 显示订单汇总信息
	exports.showSummary = function() {
		var that = this;
		var param = that.param;
		that.generateOrder();

		var summary = $('#summary').html('');
		var totalPrice = 0;

		// 成人机票
		var adultCount = $('#passengers [value=Adult]:checked').length;
		var adultAirportTax = 50;
		var adultFuelTax = 0;
		var adultPrice = param.p * 1;
		totalPrice += (adultPrice + adultAirportTax + adultFuelTax) * adultCount;

		summary.append(Sys.renderTemplate('summary-template-header', {rows: 3, section: '成人', name: '机票', unitPrice: adultPrice, qty: adultCount}));
		summary.append(Sys.renderTemplate('summary-template', {name: '民航发展基金', unitPrice: adultAirportTax, qty: adultCount}));
		summary.append(Sys.renderTemplate('summary-template', {name: '燃油税', unitPrice: adultFuelTax, qty: adultCount}));

		// 儿童机票
		var childCount = $('[value=Child]:checked').length;
		var childAirportTax = 0;
		var childFuelTax = 0;
		var childPrice = param.childPrice;
		totalPrice += (childPrice + childAirportTax + childFuelTax) * childCount;

		if (childCount) {
			summary.append(Sys.renderTemplate('summary-template-header', {rows: 3, section: '儿童', name: '机票', unitPrice: childPrice, qty: childCount}));
			summary.append(Sys.renderTemplate('summary-template', {name: '民航发展基金', unitPrice: childAirportTax, qty: childCount}));
			summary.append(Sys.renderTemplate('summary-template', {name: '燃油税', unitPrice: childFuelTax, qty: childCount}));
		}

		var count = adultCount + childCount;
		var pkgs = [];
		$('[name=package]:checked').each(function() {
			var pkgOption = $(this);
			var title = pkgOption.data('title');
			var price = pkgOption.data('price') * 1;
			totalPrice += price * count;

			pkgs.push({name: title, unitPrice: price, qty: count});
		});

		for (var pkgIndex in pkgs) {
			var pkg = pkgs[pkgIndex];
			var templateId = pkgIndex == 0 ? 'summary-template-header' : 'summary-template';
			var pkgParam = $.extend(pkg, {rows: pkgs.length, section: '套餐'});
			summary.append(Sys.renderTemplate(templateId, pkgParam));
		}

		if ($('[name=NeedDelivery]:checked').length) {
			var deliveryPrice = 10;
			totalPrice += deliveryPrice;
			summary.append(Sys.renderTemplate('summary-template-header', {rows: 1, section: '报销凭证', name: '快递费', unitPrice: deliveryPrice, qty: 1}));
		}

		$('.total-price').html(totalPrice);

		that.order.TotalPrice = totalPrice;
		that.order.AdultPrice = adultPrice;
		that.order.AdultAirportTax = adultAirportTax;
		that.order.AdultFuelTax = adultFuelTax;
		that.order.ChildPrice = childPrice;
		that.order.ChildAirportTax = childAirportTax;
		that.order.ChildFuelTax = childFuelTax;
	};

	function createOrder(order) {
		var api = require('api-util');
		var coUrl = api.toCreateOrderUrl();
		$.ajax(coUrl, { 
			method: 'post',
			data: JSON.stringify(Booking.order),
			contentType: 'application/json',
			success: function(result) {
				if (result.Status.Code != '0000') {
					showErrorMessage("", result.Status.Message);
					return;
				}
				location.href = result.RedirectUrl;
			},
			error: function(result) {
				if (result.status = 401) {
					Sys.showLoginPage();
				}
			}
		});
	}
});
