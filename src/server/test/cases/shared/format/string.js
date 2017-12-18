'use strict';

/*************************************
 * format string test cases
 * Make sure all parameter value in string
 * *************************************/

var {data, expect} = require('../../../lib/server');
var {contains, isDate, isEmpty, isEmail, isJSON, isNumeric, isUUID, isURL,
    trim, toBoolean, escape, unescape, toEmptyStr,
    getFirstChar, getLastChar} = require('../../../../../shared/format/string');

describe('format string test cases', function () {

    let objContains = data.formatString.contains;
    it('expect string "' + objContains.str1 + '" is contains seed "' + objContains.seed1 + '"', function (done) {
        let res = contains(objContains.str1, objContains.seed1);
        expect(res).to.be.true;
        done();
    });
    it('string "' + objContains.str1 + '" is not contains seed "' + objContains.seed2 + '"', function (done) {
        let res = contains(objContains.str1, objContains.seed2);
        expect(res).to.be.false;
        done();
    });


    let objDate = data.formatString.isDate;
    let currentDate = new Date().toString();
    it('expect string is a date "' + currentDate + '"', function (done) {
        let res = isDate(currentDate);
        expect(res).to.be.true;
        done();
    });
    it('string is not a date "' + objDate.dt1 + '"', function (done) {
        let res = isDate(objDate.dt1);
        expect(res).to.be.false;
        done();
    });


    let objEmail = data.formatString.isEmail;
    it('expect valid email address "' + objEmail.email1 + '"', function (done) {
        let res = isEmail(objEmail.email1);
        expect(res).to.be.true;
        done();
    });
    it('expect valid email address "' + objEmail.email2 + '"', function (done) {
        let res = isEmail(objEmail.email2);
        expect(res).to.be.true;
        done();
    });
    it('invalid email address "' + objEmail.invalidEmail1 + '"', function (done) {
        let res = isEmail(objEmail.invalidEmail1);
        expect(res).to.be.false;
        done();
    });
    it('invalid email address "' + objEmail.invalidEmail2 + '"', function (done) {
        let res = isEmail(objEmail.invalidEmail2);
        expect(res).to.be.false;
        done();
    });
    it('invalid email address "' + objEmail.invalidEmail3 + '"', function (done) {
        let res = isEmail(objEmail.invalidEmail3);
        expect(res).to.be.false;
        done();
    });


    let objEmpty = data.formatString.isEmpty;
    it('expect empty string', function (done) {
        let res = isEmpty(objEmpty.emptyStr);
        expect(res).to.be.true;
        done();
    });
    it('string is not empty because value is undefine', function (done) {
        expect(function () {
            isEmpty()
        }).to.throw(TypeError);
        done();
    });
    it('string is not empty because of white space', function (done) {
        let res = isEmpty(objEmpty.whiteSpace);
        expect(res).to.be.false;
        done();
    });
    it('string is not empty "' + objEmpty.str1 + '"', function (done) {
        let res = isEmpty(objEmpty.str1);
        expect(res).to.be.false;
        done();
    });



    let objJson = data.formatString.isJSON;
    it('expect valid json format', function (done) {
        let res = isJSON(objJson.json1);
        //console.log(JSON.parse(objJson.json1));
        expect(res).to.be.true;
        done();
    });
    it('invalid json format', function (done) {
        let res = isJSON(objJson.invalidJSON);
        expect(res).to.be.false;
        done();
    });



    let objNumeric = data.formatString.isNumeric;
    it('expect valid numeric value', function (done) {
        let res = isNumeric(objNumeric.num1);
        expect(res).to.be.true;
        done();
    });
    it('invalid numeric value "' + objNumeric.num2 + '"', function (done) {
        let res = isNumeric(objNumeric.num2);
        expect(res).to.be.false;
        done();
    });
    it('invalid numeric value because of empty', function (done) {
        let res = isNumeric(objNumeric.numEmpty);
        expect(res).to.be.false;
        done();
    });


    let objUuid = data.formatString.isUUID;
    it('expect valid UUID', function (done) {
        let res = isUUID(objUuid.uuid1);
        expect(res).to.be.true;
        done();
    });
    it('UUID is invalid "' + objUuid.uuid2 + '"', function (done) {
        let res = isUUID(objUuid.uuid2);
        expect(res).to.be.false;
        done();
    });
    it('UUID is invalid "' + objUuid.uuid3 + '"', function (done) {
        let res = isUUID(objUuid.uuid3);
        expect(res).to.be.false;
        done();
    });
    it('UUID is invalid because of empty value', function (done) {
        let res = isUUID(objUuid.uuidEmpty);
        expect(res).to.be.false;
        done();
    });



    let objUrl = data.formatString.isURL;
    it('expect valid URL "' + objUrl.url1 + '"', function (done) {
        let res = isURL(objUrl.url1);
        expect(res).to.be.true;
        done();
    });
    it('expect valid URL "' + objUrl.url2 + '"', function (done) {
        let res = isURL(objUrl.url2);
        expect(res).to.be.true;
        done();
    });
    it('expect valid URL "' + objUrl.url3 + '"', function (done) {
        let res = isURL(objUrl.url3);
        expect(res).to.be.true;
        done();
    });
    it('invalid url "' + objUrl.url4 + '"', function (done) {
        let res = isURL(objUrl.url4);
        expect(res).to.be.false;
        done();
    });
    it('invalid url "' + objUrl.url5 + '"', function (done) {
        let res = isURL(objUrl.url5);
        expect(res).to.be.false;
        done();
    });


    let objTrim = data.formatString.trim;
    it('expect output "' + trim(objTrim.str1) + '" for "' + objTrim.str1 + '"', function (done) {
        let len = objTrim.str1.length;
        let res = trim(objTrim.str1);
        expect(res.length).to.not.equal(len);
        done();
    });
    it('expect output "' + trim(objTrim.str2) + '" for "' + objTrim.str2 + '"', function (done) {
        let len = objTrim.str2.length;
        let res = trim(objTrim.str2);
        expect(res.length).to.not.equal(len);
        done();
    });
    it('expect output "' + trim(objTrim.str3) + '" for "' + objTrim.str3 + '"', function (done) {
        let len = objTrim.str3.length;
        let res = trim(objTrim.str3);
        expect(res.length).to.not.equal(len);
        done();
    });
    it('expect output "' + trim(objTrim.str4) + '" for "' + objTrim.str4 + '"', function (done) {
        let len = objTrim.str4.length;
        let res = trim(objTrim.str4);
        expect(res.length).to.equal(len);
        done();
    });
    it('expect output "' + trim(objTrim.str5) + '" for "' + objTrim.str5 + '"', function (done) {
        let len = objTrim.str5.length;
        let res = trim(objTrim.str5);
        expect(res.length).to.equal(len);
        done();
    });


    let objEscape = data.formatString.escape;
    it('expect output "' + escape(objEscape.str1) + '" for "' + objEscape.str1 + '"', function (done) {
        let res = escape(objEscape.str1);
        done();
    });
    it('expect output "' + escape(objEscape.str2) + '" for "' + objEscape.str2 + '"', function (done) {
        let res = escape(objEscape.str2);
        //console.log(res);
        done();
    });



    let objUnescape = data.formatString.unescape;
    it('expect output "' + unescape(objUnescape.str1) + '" for "' + objUnescape.str1 + '"', function (done) {
        let res = unescape(objUnescape.str1);
        done();
    });
    it('expect output "' + unescape(objUnescape.str2) + '" for "' + objUnescape.str2 + '"', function (done) {
        let res = unescape(objUnescape.str2);
        //console.log(res);
        done();
    });



    let objEmptyStr = data.formatString.toEmptyStr;
    it('expect output "' + objEmptyStr.str1 + '" for "' + objEmptyStr.str1 + '"', function (done) {
        let res = toEmptyStr(objEmptyStr.str1);
        //console.log(res);
        expect(res).to.equal(objEmptyStr.str1);
        done();
    });

    it('expect output "" for "' + objEmptyStr.str2 + '"', function (done) {
        let res = toEmptyStr(objEmptyStr.str2);
        //console.log(res);
        expect(res).to.be.empty;
        done();
    });
    it('expect output "' + objEmptyStr.param2 + '" for "' + objEmptyStr.str2 + '"', function (done) {
        let res = toEmptyStr(objEmptyStr.str2, objEmptyStr.param2);
        //console.log(res);
        expect(res).to.equal(objEmptyStr.param2);
        done();
    });
    it('expect output "' + objEmptyStr.param2 + '" for "' + objEmptyStr.str3 + '"', function (done) {
        let res = toEmptyStr(objEmptyStr.str3, objEmptyStr.param2);
        //console.log(res);
        expect(res).to.equal(objEmptyStr.param2);
        done();
    });
    it('expect output "" for no params', function (done) {
        let res = toEmptyStr();
        //console.log(res);
        expect(res).to.be.empty;
        done();
    });


    let objFirstChar = data.formatString.getFirstChar;
    it('expect output "' + getFirstChar(objFirstChar.str1) + '" for "' + objFirstChar.str1 + '")', function (done) {
        let res = getFirstChar(objFirstChar.str1);
        // console.log(res);
        done();
    });
    it('expect output "' + getFirstChar(objFirstChar.str2) + '" for "' + objFirstChar.str2 + '")', function (done) {
        let res = getFirstChar(objFirstChar.str2);
        // console.log(res);
        done();
    });
    it('expect output "' + getFirstChar(objFirstChar.str3) + '" for "' + objFirstChar.str3 + '"', function (done) {
        let res = getFirstChar(objFirstChar.str3);
        // console.log(res);
        done();
    });
    it('expect "" for no param', function (done) {
        let res = getFirstChar();
        //console.log(res);
        done();
    });


    let objLastChar = data.formatString.getLastChar;
    it('expect output "' + getLastChar(objLastChar.str1) + '" for "' + objLastChar.str1 + '"', function (done) {
        let res = getLastChar(objLastChar.str1);
        // console.log(res);
        done();
    });
    it('expect output "' + getLastChar(objLastChar.str2) + '" for "' + objLastChar.str2 + '"', function (done) {
        let res = getLastChar(objLastChar.str2);
        // console.log(res);
        done();
    });
    it('expect output "' + getLastChar(objLastChar.str3) + '" for "' + objLastChar.str3 + '"', function (done) {
        let res = getLastChar(objLastChar.str3);
        // console.log(res);
        done();
    });
    it('expect "" for no param', function (done) {
        let res = getLastChar();
        // console.log(res);
        done();
    });

});