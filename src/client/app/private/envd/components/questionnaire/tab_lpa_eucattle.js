'use strict';

/**************************
 * tab component of EUCattle Questionnaire
 * **************************** */

import React, { Component } from 'react';
import { includes as _includes } from 'lodash';

import RadioButton from '../../../../../lib/core-components/RadioButton';
import Button from '../../../../../lib/core-components/Button';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import Input from '../../../../../lib/core-components/Input';
import DocumentUpload from '../../../../../lib/wrapper-components/DocumentUpload';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';
import { bufferToUUID } from '../../../../../../shared/uuid/index';

class TabLPAEUCattle extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.state = {
            val790LP: [Math.random()],
            val840LP: [Math.random()]
        };

        this.getValues = this.getValues.bind(this);
        this.renderQuestionnaire = this.renderQuestionnaire.bind(this);

        this.render790LP = this.render790LP.bind(this);
        this.render840LP = this.render840LP.bind(this);

        this.answerYesNo = [{ Value: 'Yes', Text: this.strings.ANS_YES }, { Value: 'No', Text: this.strings.ANS_NO }];
        this.answerMonth = [{ Value: 'Less2months', Text: this.strings.ANS_SUB_LESS2MONTHS },
        { Value: '2to6months', Text: this.strings.ANS_SUB_2TO6MONTHS },
        { Value: '6to12months', Text: this.strings.ANS_SUB_6TO12MONTHS },
        { Value: 'More12months', Text: this.strings.ANS_SUB_MORE12MONTHS }];

        this.schema = ['700_1', '710_2', '730_3', '770_4', '790_5', '840_6', '900_7', '920_8'];
        this.docFile = {
            FileId: null,
            FileName: '',
            MimeType: '',
            FilePath: ''
        }
    }

    componentWillMount() {
        if (this.state.val710 == 'No')
            this.schema.push('720_2');
        if (this.state.val730 == 'Yes')
            this.schema.push(...['740_3', '750_3']);
        if (this.state.val770 == 'Yes')
            this.schema.push('780_4');
        if (this.state.val900 == 'Yes')
            this.schema.push('910_7');

        this.dataObj = {};
        let key = '', stateObj = {};
        let Q5Count = 0, Q5Row = [...this.state.val790LP], Q6Count = 0, Q6Row = [...this.state.val840LP];
        if (this.props.editData.length > 0) {
            this.props.editData.forEach(function (element) {
                key = element.DataId + (element.Loop ? `_${element.Loop}_${element.SortOrder}` : '');
                this.dataObj[key] = element.Value;

                if (element.DataId == '710' && element.Value == 'No') {
                    this.schema.push('720_2');
                    stateObj.val710 = 'No';
                }
                if (element.DataId == '730' && element.Value == 'Yes') {
                    this.schema.push(...['740_3', '750_3']);
                    stateObj.val730 = 'Yes';
                }
                if (element.DataId == '770' && element.Value == 'Yes') {
                    this.schema.push('780_4');
                    stateObj.val770 = 'Yes';
                }
                if (element.DataId == '900' && element.Value == 'Yes') {
                    this.schema.push('910_7');
                    stateObj.val900 = 'Yes';
                }

                if (element.AgliveFileId) {
                    this.docFile = {
                        FileId: bufferToUUID(element.AgliveFileId),
                        FileName: element.LPAFileName,
                        MimeType: element.MimeType,
                        FilePath: element.LPAFilePath
                    }
                }
                if (element.DataId == '800') {
                    Q5Count++;
                    if (Q5Count > 1) {
                        let random = Math.random();
                        this.schema.push(...["800_5_" + random, "810_5_" + random, "820_5_" + random,
                        "830_5_" + random]);
                        Q5Row.push(random);
                    }
                }
                if (element.DataId == '850') {
                    Q6Count++;
                    if (Q6Count > 1) {
                        let random = Math.random();
                        this.schema.push(...["850_6_" + random, "860_6_" + random, "870_6_" + random,
                        "880_6_" + random, "890_6_" + random]);
                        Q6Row.push(random);
                    }
                }
            }, this);
            stateObj.val790LP = Q5Row;
            stateObj.val840LP = Q6Row;
            this.setState(stateObj);
        }
    }

    componentDidMount() {
        this.dataObj = {};
    }

    getValues() {
        let isValid = isValidForm(this.schema, this.refs);
        if (!isValid) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let docFile = this.refs.docFile.getValues();
        if (!docFile.file && this.state.val730 == 'Yes') {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.schema, this.refs);

        let finalObj = [];
        let _this = this;
        Object.keys(obj).forEach(function (key, index) {
            let dataId = key.substr(0, 3);
            let questionNo = key.substr(4, 1);

            if (key.length > 5) {
                let loop = null;
                let index = null;
                if (questionNo == "5") {
                    loop = 'L50';
                    index = _this.state.val790LP.findIndex(x => x == key.substr(6));
                }
                else if (questionNo == "6") {
                    loop = 'L60';
                    index = _this.state.val840LP.findIndex(x => x == key.substr(6));
                }

                let newObj = {
                    QuestionNo: questionNo,
                    DataId: dataId,
                    Loop: loop,
                    SortOrder: index != null ? index + 1 : null,
                    Value: obj[key]
                }
                finalObj.push(newObj);
            }
            else {
                let loop = null;
                let sortOrder = null;
                if (questionNo == "3" && _includes(['740', '750'], dataId)) {
                    loop = 'L40';
                    sortOrder = 1;
                }

                let newObj = {
                    QuestionNo: questionNo,
                    DataId: dataId,
                    Loop: loop,
                    SortOrder: sortOrder,
                    Value: obj[key]
                }
                finalObj.push(newObj);
            }
        });

        // Object for document upload
        if (this.state.val730 == 'Yes') {
            let newObj = {
                QuestionNo: "3",
                DataId: "760",
                Loop: 'L40',
                SortOrder: 1,
                Value: null,
                AgliveFile: docFile
            }
            finalObj.push(newObj);
        }

        return finalObj;
    }

    render790LP() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;
        return (this.state.val790LP.map((d, i) => {
            if (this.state.val790 == 'Yes')
                this.schema.push(...["800_5_" + d, "810_5_" + d, "820_5_" + d, "830_5_" + d]);
            return (<div key={d}>
                <div className="col-md-3">
                    <Input inputProps={{
                        name: '800_5_' + d,
                        hintText: strings.CHEMICAL_PRODUCT,
                        floatingLabelText: strings.CHEMICAL_PRODUCT,
                        disabled: this.state.val790 != 'Yes' || this.props.disableAll
                    }}
                        eReq={strings.CHEMICAL_PRODUCT_REQ_MESSAGE}
                        maxLength={200} initialValue={this.dataObj[`800_L50_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"800_5_" + d} />
                </div>
                <div className="col-md-3">
                    <DateTimePicker inputProps={{
                        name: '810_5_' + d,
                        placeholder: strings.TREATMENT_DATE,
                        label: strings.TREATMENT_DATE,
                        disabled: this.state.val790 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`810_L50_${i + 1}`] ? new Date(this.dataObj[`810_L50_${i + 1}`]) : undefined}
                        eReq={strings.TREATMENT_DATE_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"810_5_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '820_5_' + d,
                        hintText: strings.WHP,
                        floatingLabelText: strings.WHP,
                        disabled: this.state.val790 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={10} initialValue={this.dataObj[`820_L50_${i + 1}`] || ''}
                        eReq={strings.WHP_REQ_MESSAGE}
                        isClicked={isClicked} ref={"820_5_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '830_5_' + d,
                        hintText: strings.ESI,
                        floatingLabelText: strings.ESI,
                        disabled: this.state.val790 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={10} initialValue={this.dataObj[`830_L50_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"830_5_" + d} />
                </div>
                <div className="col-md-2">
                    <a className="del-icon mt20" onClick={() => {
                        let val = [...this.state.val790LP];
                        if (val.length > 1) {
                            let index = val.findIndex(x => x == d);
                            if (index != -1)
                                val.splice(index, 1);
                            this.setState({ val790LP: val });
                        }
                        else
                            this.setState({ val790LP: [Math.random()] });
                    }}></a>
                </div>
                <div className="clearfix" />
            </div >)
        }));
    }

    render840LP() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;
        return (this.state.val840LP.map((d, i) => {
            if (this.state.val840 == 'Yes')
                this.schema.push(...["850_6_" + d, "860_6_" + d, "870_6_" + d, "880_6_" + d, "890_6_" + d]);
            return (<div key={d}>
                <div className="col-md-2">
                    <Input inputProps={{
                        name: '850_6_' + d,
                        hintText: strings.CHEMICAL_PRODUCT,
                        floatingLabelText: strings.CHEMICAL_PRODUCT,
                        disabled: this.state.val840 != 'Yes' || this.props.disableAll
                    }}
                        eReq={strings.CHEMICAL_PRODUCT_REQ_MESSAGE}
                        maxLength={200} initialValue={this.dataObj[`850_L60_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"850_6_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '860_6_' + d,
                        placeholder: strings.DATE_APPLIED,
                        label: strings.DATE_APPLIED,
                        disabled: this.state.val840 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`860_L60_${i + 1}`] ? new Date(this.dataObj[`860_L60_${i + 1}`]) : undefined}
                        eReq={strings.DATE_APPLIED_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"860_6_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '870_6_' + d,
                        hintText: strings.GRAZING_WHP,
                        floatingLabelText: strings.GRAZING_WHP,
                        disabled: this.state.val840 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={100} initialValue={this.dataObj[`870_L60_${i + 1}`] || ''}
                        eReq={strings.GRAZING_WHP_REQ_MESSAGE}
                        isClicked={isClicked} ref={"870_6_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '880_6_' + d,
                        placeholder: strings.DATE_FIRST_FED_GRAZED,
                        label: strings.DATE_FIRST_FED_GRAZED,
                        disabled: this.state.val840 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`880_L60_${i + 1}`] ? new Date(this.dataObj[`880_L60_${i + 1}`]) : undefined}
                        eReq={strings.DATE_FIRST_FED_GRAZED_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"880_6_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '890_6_' + d,
                        placeholder: strings.DATE_FEEDING_GRAZING_CEASED,
                        label: strings.DATE_FEEDING_GRAZING_CEASED,
                        disabled: this.state.val840 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`890_L60_${i + 1}`] ? new Date(this.dataObj[`890_L60_${i + 1}`]) : undefined}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"890_6_" + d} />
                </div>
                <div className="col-md-2">
                    <a className="del-icon mt20" onClick={() => {
                        let val = [...this.state.val840LP];
                        if (val.length > 1) {
                            let index = val.findIndex(x => x == d);
                            if (index != -1)
                                val.splice(index, 1);
                            this.setState({ val840LP: val });
                        }
                        else
                            this.setState({ val840LP: [Math.random()] });
                    }}></a>
                </div>
                <div className="clearfix" />
            </div >)
        }));
    }

    renderQuestionnaire() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;

        this.schema = ['700_1', '710_2', '730_3', '770_4', '790_5', '840_6', '900_7', '920_8'];

        if (this.state.val710 == 'No')
            this.schema.push('720_2');
        if (this.state.val730 == 'Yes')
            this.schema.push(...['740_3', '750_3']);
        if (this.state.val770 == 'Yes')
            this.schema.push('780_4');
        if (this.state.val900 == 'Yes')
            this.schema.push('910_7');

        return (
            <div>
                <div className="que-box">
                    <div className="que-numb">1)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_1}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '700_1', defaultSelected: this.dataObj['700'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="700_1" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">2)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_2}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '710_2', defaultSelected: this.dataObj['710'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val710: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="710_2" />
                        </div>
                        <div className="clearfix mt10" />
                        <span>{strings.QUE_2_SUB}</span>
                        {this.state.val710 == 'No' ? <span className="mandatory-star">*</span> : null}<br />
                        <div className="mt5">{strings.QUE_2_SUB_1}</div>
                        <div className="que-text-ans" key={this.state.val710}>
                            <RadioButton inputGroupProps={{ name: '720_2', defaultSelected: this.dataObj['720'] }}
                                eReq={this.state.val710 == 'No' ? this.strings.COMMON.RADIO_BUTTON_REQ : null}
                                disabled={this.state.val710 != 'No' || this.props.disableAll}
                                dataSource={this.answerMonth}
                                horizontalAlign={true}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="720_2" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">3)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_3}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '730_3', defaultSelected: this.dataObj['730'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val730: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="730_3" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_3_SUB}</span> {this.state.val730 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val730}>
                                <div className="col-md-4">
                                    <Input inputProps={{
                                        name: '740_3',
                                        hintText: strings.BY_PRODUCT_NAME,
                                        floatingLabelText: strings.BY_PRODUCT_NAME,
                                        disabled: this.state.val730 != 'Yes' || this.props.disableAll
                                    }}
                                        eReq={strings.BY_PRODUCT_NAME_REQ_MESSAGE}
                                        maxLength={100} initialValue={this.dataObj['740_L40_1'] || ''}
                                        isClicked={isClicked} ref="740_3" />
                                </div>
                                <div className="col-md-4">
                                    <DateTimePicker inputProps={{
                                        name: '750_3',
                                        placeholder: strings.BY_PRODUCT_LAST_FED_DATE,
                                        label: strings.BY_PRODUCT_LAST_FED_DATE,
                                        disabled: this.state.val730 != 'Yes' || this.props.disableAll
                                    }}
                                        dateFormat='DD/MM/YYYY' timeFormat={false}
                                        defaultValue={this.dataObj['750_L40_1'] ? new Date(this.dataObj['750_L40_1']) : undefined}
                                        eReq={strings.BY_PRODUCT_LAST_FED_DATE_REQ_MESSAGE}
                                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                                        isClicked={isClicked} ref="750_3" />
                                </div>
                                <div className="col-md-4">
                                    <DocumentUpload
                                        disabled={this.state.val730 != 'Yes' || this.props.disableAll}
                                        strings={strings.COMMON}
                                        notifyToaster={this.notifyToaster}
                                        label={strings.BY_PRODUCT_STATEMENT}
                                        data={this.docFile} ref="docFile" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">4)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_4}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '770_4', defaultSelected: this.dataObj['770'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val770: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="770_4" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_4_SUB}</span> {this.state.val770 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="que-text-ans" key={this.state.val770}>
                                <Input inputProps={{
                                    name: '780_4',
                                    hintText: strings.QUE_4_SUB_INPUT_LABEL,
                                    floatingLabelText: strings.QUE_4_SUB_INPUT_LABEL,
                                    disabled: this.state.val770 != 'Yes' || this.props.disableAll
                                }}
                                    eReq={strings.QUE_4_SUB_INPUT_REQ_MESSAGE}
                                    maxLength={500} initialValue={this.dataObj['780'] || ''}
                                    isClicked={isClicked} ref="780_4" />
                            </div>
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">5)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_5}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '790_5', defaultSelected: this.dataObj['790'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => {
                                    if (this.state.val790 != value)
                                        this.setState({ val790: value, val790LP: [Math.random()] });
                                }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="790_5" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_5_SUB}</span> {this.state.val790 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val790}>
                                {this.render790LP()}
                                <div className="clearfix mt5" />
                                <div className="col-md-12">
                                    <Button
                                        inputProps={{
                                            name: 'btnAdd',
                                            label: strings.ADD_BUTTON,
                                            className: 'button2Style button30Style mt10',
                                            disabled: this.state.val790 != 'Yes' || this.props.disableAll
                                        }}
                                        onClick={() => {
                                            let val = [...this.state.val790LP];
                                            val.push(Math.random());
                                            this.setState({ val790LP: val });
                                        }}></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">6)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_6}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '840_6', defaultSelected: this.dataObj['840'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => {
                                    if (this.state.val840 != value)
                                        this.setState({ val840: value, val840LP: [Math.random()] });
                                }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="840_6" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_6_SUB}</span> {this.state.val840 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val840}>
                                {this.render840LP()}
                                <div className="clearfix mt5" />
                                <div className="col-md-12">
                                    <Button
                                        inputProps={{
                                            name: 'btnAdd',
                                            label: strings.ADD_BUTTON,
                                            className: 'button2Style button30Style mt10',
                                            disabled: this.state.val840 != 'Yes' || this.props.disableAll
                                        }}
                                        onClick={() => {
                                            let val = [...this.state.val840LP];
                                            val.push(Math.random());
                                            this.setState({ val840LP: val });
                                        }}></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">7)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_7}</span><br />
                        <div className="mt5">{strings.QUE_7_1}<span className="mandatory-star">*</span></div>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '900_7', defaultSelected: this.dataObj['900'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val900: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="900_7" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_7_SUB}</span> {this.state.val900 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="que-text-ans" key={this.state.val900}>
                                <DateTimePicker inputProps={{
                                    name: '910_7',
                                    placeholder: strings.DATE_SPRAYED,
                                    label: strings.DATE_SPRAYED,
                                    disabled: this.state.val900 != 'Yes' || this.props.disableAll
                                }}
                                    dateFormat='DD/MM/YYYY' timeFormat={false}
                                    defaultValue={this.dataObj['910'] ? new Date(this.dataObj['910']) : undefined}
                                    eReq={strings.DATE_SPRAYED_REQ_MESSAGE}
                                    dateFilter={{ isBefore: true, isIncludeToday: true }}
                                    isClicked={isClicked} ref="910_7" />
                            </div>
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">8)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_8}</span>
                        <div className="que-text-ans">
                            <Input inputProps={{
                                name: '920_8',
                                hintText: strings.ADDITIONAL_INFO,
                                floatingLabelText: strings.ADDITIONAL_INFO,
                                disabled: this.props.disableAll
                            }}
                                maxLength={300} initialValue={this.dataObj['920'] || ''}
                                isClicked={isClicked} ref="920_8" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
            </div >
        );
    }

    render() {
        return (<div>
            {this.renderQuestionnaire()}
        </div>);
    }
}

export default TabLPAEUCattle;