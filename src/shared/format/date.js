'use strict';

/**********************************
 * format date using moment-timezone js
 * parse,format,timezone
 * Reference link : http://momentjs.com and http://momentjs.com/timezone/
 * ******************************* */

var moment = require('moment-timezone');
//var moment = require('moment');

// Set locale as per client machine
var loadLocale = function () {
    if (typeof (window) !== 'undefined') {
        setTimeout(function () {            
            let locale = (window.navigator.userLanguage || window.navigator.language);
            if (locale)
                moment.locale(locale);
            else
                moment.locale("en-AU");
        }, 200);
    }
}

// Get UTC offset value to convert date in UTC format
var offset = moment().utcOffset();
// var offset1 = moment().tz('Australia/Sydney').utcOffset();

var dtFormat = {
    ShortDateFormat: "DD-MM-YYYY",
    DateTimeFormat: "DD-MM-YYYY hh:mm A",
    DateTimeSecondFormat: "DD-MM-YYYY hh:mm:ss A",
    YYYYMMDDFormat: "YYYY-MM-DD"
}

// Get current date time
var currentDateTime = function () {
    return {
        DateTimeFormat: moment(),
        ValueOf: moment().valueOf(),
        ShortDate: dateTime(moment()).ShortDate,
        DateTime: dateTime(moment()).DateTime,
        DateTimeSecond: dateTime(moment()).DateTimeSecond,
        YYYYMMDDFormat: dateTime(moment()).YYYYMMDDFormat
    };
}

// Display date in proper format
var dateTime = function (val) {
    return {
        DateTimeFormat: moment(val),
        ValueOf: moment(val).valueOf(),
        ShortDate: moment(val).format(dtFormat.ShortDateFormat),
        DateTime: moment(val).format(dtFormat.DateTimeFormat),
        DateTimeSecond: moment(val).format(dtFormat.DateTimeSecondFormat),
        YYYYMMDDFormat: moment(val).format(dtFormat.YYYYMMDDFormat)
    };
}

// Convert date to UTC format
var localtoUTC = function (val, format) {    
    if (format && moment(val, format).isValid()) {
        return moment(val, format).utc().format();
    }
    else if (moment(val, dtFormat.DateTimeSecondFormat).isValid()) {
        return moment(val, dtFormat.DateTimeSecondFormat).utc().format();
    }
    else {
        return moment(val).utc().format();
    }
}

// Convert UTC date to local date format
var utcToLocal = function (val) {
    var offsetVal = moment(val).utcOffset(offset);
    return {
        ShortDate: offsetVal.format(dtFormat.ShortDateFormat),
        DateTime: offsetVal.format(dtFormat.DateTimeFormat),
        DateTimeSecond: offsetVal.format(dtFormat.DateTimeSecondFormat)
    }
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

loadLocale();

module.exports = { loadLocale, dtFormat, currentDateTime, dateTime, localtoUTC, utcToLocal, isValid, isBetween, moment }

/**********************************
 * Example.... 
 * function test() {
        var date = new Date();
        var UTCDate = localtoUTC(date);
        var localDate = utcToLocal(UTCDate).DateTimeSecond;
        var dtString = dateTime(date).DateTimeSecond;
        var UTCdtString = localtoUTC(dtString);

        console.log('JS Date: ' + date);
        console.log('UTCDate : ' + UTCDate);
        console.log('localDate: ' + localDate);
        console.log('dtString : ' + dtString);
        console.log('UTCdtString : ' + UTCdtString);
    }
**********************************/