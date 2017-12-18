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
    MMMYYYY: "MMM-YYYY"
}

// Get current date time
var currentDateTime = function () {
    return {
        DateTimeMoment: moment(),
        ValueOf: moment().valueOf(),
        ShortDate: formatDateTime(moment()).ShortDate,
        DateTime: formatDateTime(moment()).DateTime,
        DateTimeSecond: formatDateTime(moment()).DateTimeSecond,
        YYYYMMDDFormat: formatDateTime(moment()).YYYYMMDDFormat
    };
}



// Display datetime in proper format
var formatDateTime = function (val) {
    return {
        DateTimeMoment: moment(val),
        ValueOf: moment(val).valueOf(),
        ShortDate: moment(val).format(dtFormat.ShortDateFormat),
        DateTime: moment(val).format(dtFormat.DateTimeFormat),
        DateTimeSecond: moment(val).format(dtFormat.DateTimeSecondFormat),
        YYYYMMDDFormat: moment(val).format(dtFormat.YYYYMMDDFormat),
        MMMYYYY: moment(val).format(dtFormat.MMMYYYY)
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

// Check before date
var isBefore = function (currentDate, beforeDate) {
    return moment(currentDate).isBefore(beforeDate);
}

// Check after date
var isAfter = function (currentDate, afterDate) {
    return moment(currentDate).isAfter(afterDate);
}

module.exports = { loadCulture, dtFormat, currentDateTime, formatDateTime, localToUTC, utcToLocal, isValid, isBetween, isBefore, isAfter, moment }

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