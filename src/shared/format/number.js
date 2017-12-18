'use strict';

/**********************************
 * format number using numeral.js
 * parse,format,currency etc
 * ******************************* */

var numeral = require('numeral');

// Numbers can be formatted to two digit decimal value
var digitDecimal = function (val, format = '0.00') {
    return numeral(val).format(format);
}

module.exports = {
    digitDecimal
};