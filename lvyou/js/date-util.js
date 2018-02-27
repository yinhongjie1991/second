//==============================================================================
// 日期工具类模块。
//==============================================================================

/** 每秒钟的毫秒数 */
Date.MILLIS_PER_SECOND = 1000;
/** 每分钟的毫秒数 */
Date.MILLIS_PER_MINUTE = 60 * Date.MILLIS_PER_SECOND;
/** 每小时的毫秒数 */
Date.MILLIS_PER_HOUR = 60 * Date.MILLIS_PER_MINUTE;
/** 每天的毫秒数 */
Date.MILLIS_PER_DAY = 24 * Date.MILLIS_PER_HOUR;
/** 每周的毫秒数 */
Date.MILLIS_PER_WEEK = 7 * Date.MILLIS_PER_DAY;

/**
 * 解析日期字符串并返回对应的日期对象。
 * 
 * @param expression
 *            日期字符串
 * @return 对应的日期对象，或者在格式错误时，返回null
 */
Date.parseToDate = function(expression) {
	var ms = Date.parse(expression);
	if (isNaN(ms)) {
		return null;
	}
	return new Date(ms);
};

/**
 * 解析日期字符串并返回对应的日期对象。
 * 
 * @param expression
 *            日期字符串
 * @return 对应的日期对象，或者在格式错误时，返回null
 */
Date.parseToDateGMT8 = function(expression) {
	var ms = Date.parse(expression + '+08:00');
	if (isNaN(ms)) {
		return null;
	}
	return new Date(ms);
};

/**
 * 格式化输出yyyy-MM-dd或yyyyMMdd。
 * 
 * @param omitHyphen
 *            是否省略中间的连字符
 * @return yyyy-MM-dd或yyyyMMdd格式的时间描述
 */
Date.prototype.toYMDString = function(omitHyphen) {
	var separator = omitHyphen ? '' : '-';
	return [ this.getFullYear(),
			((this.getMonth() + 1) + 100 + "").substring(1),
			(this.getDate() + 100 + "").substring(1) ].join(separator);
};

/**
 * 格式化输出HH:mm:ss或HHmmss。
 * 
 * @param omitColon
 *            是否省略中间的冒号
 * @return HH:mm:ss或HHmmss格式的时间描述
 */
Date.prototype.toHMSString = function(omitColon) {
	var separator = omitColon ? '' : ':';
	return [ (this.getHours() + 100 + "").substring(1),
			(this.getMinutes() + 100 + "").substring(1),
			(this.getSeconds() + 100 + "").substring(1) ].join(':');
};

/**
 * 格式化输出HH:mm或HHmm。
 * 
 * @param omitColon
 *            是否省略中间的冒号
 * @return HH:mm或HHmm格式的时间描述
 */
Date.prototype.toHMString = function(omitColon) {
	var separator = omitColon ? '' : ':';
	return [ (this.getHours() + 100 + "").substring(1),
			(this.getMinutes() + 100 + "").substring(1) ].join(':');
};

/**
 * 在现有日期基础上，增加或减少（如果参数是负数的话）相应的时间。
 * 
 * @param amount
 *            增加或减少的数值
 * @param timeUnit
 *            单个时间单位对应的毫秒数（默认1毫秒）
 * @return 增加或减少后的日期对象
 */
Date.prototype.plus = function(amount, timeUnit) {
	if (timeUnit == undefined) {
		timeUnit = 1;
	}
	return new Date(this.getTime() + amount * timeUnit);
};

/**
 * 在现有日期基础上，增加或减少（如果参数是负数的话）相应的周数。
 * 
 * @param weeks
 *            增加或减少的周数
 * @return 增加或减少后的日期对象
 */
Date.prototype.addWeeks = function(weeks) {
	return this.plus(weeks, Date.MILLIS_PER_WEEK);
};

/**
 * 在现有日期基础上，增加或减少（如果参数是负数的话）相应的天数。
 * 
 * @param days
 *            增加或减少的天数
 * @return 增加或减少后的日期对象
 */
Date.prototype.addDays = function(days) {
	return this.plus(days, Date.MILLIS_PER_DAY);
};

/**
 * 在现有日期基础上，增加或减少（如果参数是负数的话）相应的小时数。
 * 
 * @param hours
 *            增加或减少的小时
 * @return 增加或减少后的日期对象
 */
Date.prototype.addHours = function(hours) {
	return this.plus(days, Date.MILLIS_PER_HOUR);
};

/**
 * 在现有日期基础上，增加或减少（如果参数是负数的话）相应的分钟数。
 * 
 * @param minutes
 *            增加或减少的小时
 * @return 增加或减少后的日期对象
 */
Date.prototype.addMinutes = function(minutes) {
	return this.plus(days, Date.MILLIS_PER_MINUTES);
};

/**
 * 在现有日期基础上，增加或减少（如果参数是负数的话）相应的秒数。
 * 
 * @param seconds
 *            增加或减少的秒
 * @return 增加或减少后的日期对象
 */
Date.prototype.addSeconds = function(seconds) {
	return this.plus(days, Date.MILLIS_PER_SECOND);
};

/**
 * 返回以现有日期为基准，以参数时分秒代表的时间点的Redis的超时时间戳。
 * 
 * @param hours
 *            小时（默认0）
 * @param minutes
 *            分钟（默认0）
 * @param seconds
 *            秒（默认0）
 */
Date.prototype.getExpireSeconds = function(hours, minutes, seconds) {
	hours = (hours || 0) * 1;
	minutes = (minutes || 0) * 1;
	seconds = (seconds || 0) * 1;
	var expiration = new Date(this.getFullYear(), this.getMonth(), this
			.getDate(), hours, minutes, seconds);
	return expiration.getTime() / Date.MILLIS_PER_SECOND;
};

/**
 * 返回星期名称。
 *
 * @return 星期名称
 */
Date.prototype.getWeekdayName = function() {
	return '周' + ('日一二三四五六'.charAt(this.getDay()));
};

/**
 * 返回日期名称。
 *
 * @return 日期名称
 */
Date.prototype.getDateName = function() {
	return (this.getMonth() + 1) + '月' + (this.getDate()) + '日';
};
