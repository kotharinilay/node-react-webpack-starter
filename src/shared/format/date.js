'use strict';

/**********************************
 * format date using moment-timezone js
 * parse,format,timezone
 * Reference link : http://momentjs.com and http://momentjs.com/timezone/
 * ******************************* */

var moment = require('moment-timezone');

// Set locale as per client machine and preference
var loadCulture = function () {
    if (typeof (window) !== 'undefined') {

        let preference = null;
        if (typeof (Storage) !== 'undefined') {
            if (localStorage.getItem('lang') != null) {
                let lang = localStorage.getItem('lang');
                if (lang.indexOf('zh') > -1) {
                    preference = "zh-CN";
                }
            }
        }
        let locale = preference || (window.navigator.userLanguage || window.navigator.language);
        moment.locale(locale);
    }
}

// Get UTC offset value to convert date in UTC format
var offset = moment().utcOffset();
//var offset1 = moment().tz('Australia/Sydney').utcOffset();

var dtFormat = {
    ShortDateFormat: "DD-MM-YYYY",
    DateTimeFormat: "DD-MM-YYYY hh:mm A",
    DateTimeSecondFormat: "DD-MM-YYYY hh:mm:ss A",
    YYYYMMDDFormat: "YYYY-MM-DD",
    MMMYYYY: "MMM-YYYY",
    HHMMSS: "hh:mm:ss",
    YYYYMMDD_HHMM: "YYYY-MM-DD hh:mm",
    YYYY: 'YYYY',
    YYYYMMDDHHMM: 'YYYYMMDDhhmm',
    ReportDateFormat: "DD/MM/YYYY"
}

// Get current date time
var currentDateTime = function () {
    var m = moment();
    return {
        DateTimeMoment: m,
        ValueOf: m.valueOf(),
        ShortDate: formatDateTime(m).ShortDate,
        DateTime: formatDateTime(m).DateTime,
        DateTimeSecond: formatDateTime(m).DateTimeSecond,
        YYYYMMDDFormat: formatDateTime(m).YYYYMMDDFormat,
        HHMMSSFormat: formatDateTime(m).HHMMSS,
        YYYYMMDD_HHMM: formatDateTime(m).YYYYMMDD_HHMM,
        YYYY: formatDateTime(m).YYYY,
        YYYYMMDDHHMM: formatDateTime(m).YYYYMMDDHHMM
    };
}

// Display datetime in proper format
var formatDateTime = function (val) {
    var m = moment(val);

    return {
        DateTimeMoment: m,
        ValueOf: m.valueOf(),
        ShortDate: m.format(dtFormat.ShortDateFormat),
        DateTime: m.format(dtFormat.DateTimeFormat),
        DateTimeSecond: m.format(dtFormat.DateTimeSecondFormat),
        YYYYMMDDFormat: m.format(dtFormat.YYYYMMDDFormat),
        MMMYYYY: m.format(dtFormat.MMMYYYY),
        HHMMSS: m.format(dtFormat.HHMMSS),
        YYYYMMDD_HHMM: m.format(dtFormat.YYYYMMDD_HHMM),
        YYYY: m.format(dtFormat.YYYY),
        YYYYMMDDHHMM: m.format(dtFormat.YYYYMMDDHHMM)
    };
}

// Convert date to UTC format
var localToUTC = function (val, inputFormat, outputFormat) {
    let utcDate = "";
    if (inputFormat && moment(val, inputFormat).isValid()) {
        utcDate = moment(val, inputFormat).utc();
    }
    else if (moment(val, dtFormat.DateTimeSecondFormat).isValid()) {
        utcDate = moment(val, dtFormat.DateTimeSecondFormat).utc();
    }
    else {
        utcDate = moment(val).utc();
    }

    if (outputFormat) {
        return utcDate.format(outputFormat);
    }
    else {
        return utcDate.format();
    }
}

// Convert UTC date to local date format
var utcToLocal = function (val) {
    if (val) {
        var offsetVal = moment(val).utcOffset(offset);
        return {
            ShortDate: offsetVal.format(dtFormat.ShortDateFormat),
            DateTime: offsetVal.format(dtFormat.DateTimeFormat),
            DateTimeSecond: offsetVal.format(dtFormat.DateTimeSecondFormat),
            ReportDate: offsetVal.format(dtFormat.ReportDateFormat)
        }
    }
    return { ShortDate: null, DateTime: null, DateTimeSecond: null, ReportDate: null }
}

// Check datetime isValid
var isValid = function (val, format) {
    if (format)
        return moment(val, format).isValid();
    else
        return moment(val).isValid();
}

// Check between date -- Format must be YYYY-MM-DD 
var isBetween = function (currentDate, minDate, maxDate) {
    return moment(currentDate).isBetween(minDate, maxDate);
}

// Check before date
var isBefore = function (currentDate, beforeDate) {
    return moment(currentDate).isBefore(beforeDate);
}

// Check after date
var isAfter = function (currentDate, afterDate) {
    return moment(currentDate).isAfter(afterDate);
}

var dateFromString = function (dateStr) {
    var datePart;
    if (dateStr.indexOf('/') != -1)
        datePart = dateStr.split('/');
    else
        datePart = dateStr.split('-');

    return new Date(datePart[2], datePart[1] - 1, datePart[0]).toJSON().slice(0, 10).replace(/-/g, '/');
}

// calculate age of livestock
var calculateAge = function (birthDate) {
    var dt = formatDateTime(birthDate).YYYYMMDDFormat;
    var years = moment().diff(dt, 'years');
    var months = moment().diff(dt, 'months');
    return years + '.' + (months - (years * 12));
}

// get name of month from number of month
var getMonthName = function (number) {
    return moment(number, 'MM').format('MMMM');
}

var dateDiffinDays = function (date) {
    if (!date) return 0;
    var dt = formatDateTime(date).YYYYMMDDFormat;
    var days = moment().diff(dt, 'days');
    return days;
}

module.exports = {
    loadCulture, dtFormat, currentDateTime, formatDateTime, localToUTC, utcToLocal,
    isValid, isBetween, isBefore, isAfter, moment, dateFromString, calculateAge, getMonthName, dateDiffinDays
}

/**********************************
 * Example.... 
 * function test() {
        var date = new Date();
        var UTCDate = localtoUTC(date);
        var localDate = utcToLocal(UTCDate).DateTimeSecond;
        var dtString = formatDateTime(date).DateTimeSecond;
        var UTCdtString = localtoUTC(dtString);

        console.log('JS Date: ' + date);
        console.log('UTCDate : ' + UTCDate);
        console.log('localDate: ' + localDate);
        console.log('dtString : ' + dtString);
        console.log('UTCdtString : ' + UTCdtString);
    }
**********************************/