'use strict';

/**************************
 * tab component of Cattle Questionnaire
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
import { bufferToUUID } from '../../../../../../shared/uuid';

class TabLPACattle extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.state = {
            val800LP: [Math.random()],
            val850LP: [Math.random()]
        };

        this.getValues = this.getValues.bind(this);
        this.renderQuestionnaire = this.renderQuestionnaire.bind(this);

        this.render800LP = this.render800LP.bind(this);
        this.render850LP = this.render850LP.bind(this);

        this.answerYesNo = [{ Value: 'Yes', Text: this.strings.ANS_YES }, { Value: 'No', Text: this.strings.ANS_NO }];
        this.answerMonth = [{ Value: 'Less2months', Text: this.strings.ANS_SUB_LESS2MONTHS },
        { Value: '2to6months', Text: this.strings.ANS_SUB_2TO6MONTHS },
        { Value: '6to12months', Text: this.strings.ANS_SUB_6TO12MONTHS },
        { Value: 'More12months', Text: this.strings.ANS_SUB_MORE12MONTHS }];

        this.schema = ['700_1', '710_2', '720_3', '740_4', '780_5', '800_6', '850_7', '910_8', '930_9'];
        this.docFile = {
            FileId: null,
            FileName: '',
            MimeType: '',
            FilePath: ''
        }
    }

    componentWillMount() {
        this.dataObj = {};
        let key = '';
        let Q6Count = 0, Q6Row = [...this.state.val800LP], Q7Count = 0, Q7Row = [...this.state.val850LP],
            stateObj = {};
        if (this.props.editData.length > 0) {
            this.props.editData.forEach(function (element) {
                key = element.DataId + (element.Loop ? `_${element.Loop}_${element.SortOrder}` : '');
                this.dataObj[key] = element.Value;

                if (element.DataId == '720' && element.Value == 'No') {
                    this.schema.push('730_3');
                    stateObj.val720 = 'No';
                }
                if (element.DataId == '740' && element.Value == 'Yes') {
                    this.schema.push(...['750_4', '760_4']);
                    stateObj.val740 = 'Yes';
                }
                if (element.DataId == '780' && element.Value == 'Yes') {
                    this.schema.push('790_5');
                    stateObj.val780 = 'Yes';
                }
                if (element.DataId == '910' && element.Value == 'Yes') {
                    this.schema.push('920_8');
                    stateObj.val910 = 'Yes';
                }

                if (element.AgliveFileId) {
                    this.docFile = {
                        FileId: bufferToUUID(element.AgliveFileId),
                        FileName: element.LPAFileName,
                        MimeType: element.MimeType,
                        FilePath: element.LPAFilePath
                    }
                }
                if (element.DataId == '810') {
                    Q6Count++;
                    if (Q6Count > 1) {
                        let random = Math.random();
                        this.schema.push(...["810_6_" + random, "820_6_" + random, "830_6_" + random, "840_6_" + random]);
                        Q6Row.push(random);
                    }
                }
                if (element.DataId == '860') {
                    Q7Count++;
                    if (Q7Count > 1) {
                        let random = Math.random();
                        this.schema.push(...["860_7_" + random, "870_7_" + random, "880_7_" + random, "890_7_" + random, "900_7_" + random]);
                        Q7Row.push(random);
                    }
                }
            }, this);
            stateObj.val800LP = Q6Row;
            stateObj.val850LP = Q7Row;
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
        if (!docFile.file && this.state.val740 == 'Yes') {
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
                if (questionNo == "6") {
                    loop = 'L50';
                    index = _this.state.val800LP.findIndex(x => x == key.substr(6));
                }
                else if (questionNo == "7") {
                    loop = 'L60';
                    index = _this.state.val850LP.findIndex(x => x == key.substr(6));
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
                if (questionNo == "4" && _includes(['750', '760'], dataId)) {
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
        if (this.state.val740 == 'Yes') {
            let newObj = {
                QuestionNo: "4",
                DataId: "770",
                Loop: 'L40',
                SortOrder: 1,
                Value: null,
                AgliveFile: docFile
            }
            finalObj.push(newObj);
        }

        return finalObj;
    }

    render800LP() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;
        return (this.state.val800LP.map((d, i) => {
            if (this.state.val800 == 'Yes')
                this.schema.push(...["810_6_" + d, "820_6_" + d, "830_6_" + d, "840_6_" + d]);
            return (<div key={d}>
                <div className="col-md-3">
                    <Input inputProps={{
                        name: '810_6_' + d,
                        hintText: strings.CHEMICAL_PRODUCT,
                        floatingLabelText: strings.CHEMICAL_PRODUCT,
                        disabled: this.state.val800 != 'Yes' || this.props.disableAll
                    }}
                        eReq={strings.CHEMICAL_PRODUCT_REQ_MESSAGE}
                        maxLength={200} initialValue={this.dataObj[`810_L50_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"810_6_" + d} />
                </div>
                <div className="col-md-3">
                    <DateTimePicker inputProps={{
                        name: '820_6_' + d,
                        placeholder: strings.TREATMENT_DATE,
                        label: strings.TREATMENT_DATE,
                        disabled: this.state.val800 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`820_L50_${i + 1}`] ? new Date(this.dataObj[`820_L50_${i + 1}`]) : undefined}
                        eReq={strings.TREATMENT_DATE_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"820_6_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '830_6_' + d,
                        hintText: strings.WHP,
                        floatingLabelText: strings.WHP,
                        disabled: this.state.val800 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={10} initialValue={this.dataObj[`830_L50_${i + 1}`] || ''}
                        eReq={strings.WHP_REQ_MESSAGE}
                        isClicked={isClicked} ref={"830_6_" + d} />
                </div>
                <div className="col-md-3">
                    <NumberInput inputProps={{
                        name: '840_6_' + d,
                        hintText: strings.ESI,
                        floatingLabelText: strings.ESI,
                        disabled: this.state.val800 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={10} initialValue={this.dataObj[`840_L50_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"840_6_" + d} />
                </div>
                <div className="col-md-1">
                    <a className="del-icon mt20" onClick={() => {
                        let val = [...this.state.val800LP];
                        if (val.length > 1) {
                            let index = val.findIndex(x => x == d);
                            if (index != -1)
                                val.splice(index, 1);
                            this.setState({ val800LP: val });
                        }
                        else
                            this.setState({ val800LP: [Math.random()] });
                    }}></a>
                </div>
                <div className="clearfix" />
            </div >)
        }));
    }

    render850LP() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;
        return (this.state.val850LP.map((d, i) => {
            if (this.state.val850 == 'Yes')
                this.schema.push(...["860_7_" + d, "870_7_" + d, "880_7_" + d, "890_7_" + d, "900_7_" + d]);
            return (<div key={d}>
                <div className="col-md-2">
                    <Input inputProps={{
                        name: '860_7_' + d,
                        hintText: strings.CHEMICAL_PRODUCT,
                        floatingLabelText: strings.CHEMICAL_PRODUCT,
                        disabled: this.state.val850 != 'Yes' || this.props.disableAll
                    }}
                        eReq={strings.CHEMICAL_PRODUCT_REQ_MESSAGE}
                        maxLength={200} initialValue={this.dataObj[`860_L60_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"860_7_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '870_7_' + d,
                        placeholder: strings.DATE_APPLIED,
                        label: strings.DATE_APPLIED,
                        disabled: this.state.val850 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`870_L60_${i + 1}`] ? new Date(this.dataObj[`870_L60_${i + 1}`]) : undefined}
                        eReq={strings.DATE_APPLIED_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"870_7_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '880_7_' + d,
                        hintText: strings.GRAZING_WHP,
                        floatingLabelText: strings.GRAZING_WHP,
                        disabled: this.state.val850 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={100} initialValue={this.dataObj[`880_L60_${i + 1}`] || ''}
                        eReq={strings.GRAZING_WHP_REQ_MESSAGE}
                        isClicked={isClicked} ref={"880_7_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '890_7_' + d,
                        placeholder: strings.DATE_FIRST_FED_GRAZED,
                        label: strings.DATE_FIRST_FED_GRAZED,
                        disabled: this.state.val850 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`890_L60_${i + 1}`] ? new Date(this.dataObj[`890_L60_${i + 1}`]) : undefined}
                        eReq={strings.DATE_FIRST_FED_GRAZED_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"890_7_" + d} />
                </div>
                <div className="col-md-3">
                    <DateTimePicker inputProps={{
                        name: '900_7_' + d,
                        placeholder: strings.DATE_FEEDING_GRAZING_CEASED,
                        label: strings.DATE_FEEDING_GRAZING_CEASED,
                        disabled: this.state.val850 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`900_L60_${i + 1}`] ? new Date(this.dataObj[`900_L60_${i + 1}`]) : undefined}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"900_7_" + d} />
                </div>
                <div className="col-md-1">
                    <a className="del-icon mt20" onClick={() => {
                        let val = [...this.state.val850LP];
                        if (val.length > 1) {
                            let index = val.findIndex(x => x == d);
                            if (index != -1)
                                val.splice(index, 1);
                            this.setState({ val850LP: val });
                        }
                        else
                            this.setState({ val850LP: [Math.random()] });
                    }}></a>
                </div>
                <div className="clearfix" />
            </div >)
        }));
    }

    renderQuestionnaire() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;

        this.schema = ['700_1', '710_2', '720_3', '740_4', '780_5', '800_6', '850_7', '910_8', '930_9'];

        if (this.state.val720 == 'No')
            this.schema.push('730_3');
        if (this.state.val740 == 'Yes')
            this.schema.push(...['750_4', '760_4']);
        if (this.state.val780 == 'Yes')
            this.schema.push('790_5');
        if (this.state.val910 == 'Yes')
            this.schema.push('920_8');
        
        return (
            <div>
                <div className="que-box">
                    <div className="que-numb">1)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_CTL_1}</span> <span className="mandatory-star">*</span>
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
                        <span>{strings.QUE_CTL_2}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '710_2', defaultSelected: this.dataObj['710'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="710_2" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">3)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_CTL_3}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '720_3', defaultSelected: this.dataObj['720'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val720: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="720_3" />
                        </div>
                        <div className="clearfix mt10" />
                        <span>{strings.QUE_CTL_3_SUB}</span>
                        {this.state.val720 == 'No' ? <span className="mandatory-star">*</span> : null}<br />
                        <div className="mt5">{strings.QUE_CTL_3_SUB_1}</div>
                        <div className="que-text-ans" key={this.state.val720}>
                            <RadioButton inputGroupProps={{ name: '730_3', defaultSelected: this.dataObj['730'] }}
                                eReq={this.state.val720 == 'No' ? this.strings.COMMON.RADIO_BUTTON_REQ : null}
                                disabled={this.state.val720 != 'No' || this.props.disableAll}
                                dataSource={this.answerMonth}
                                horizontalAlign={true}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="730_3" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">4)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_CTL_4}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '740_4', defaultSelected: this.dataObj['740'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val740: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="740_4" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_CTL_4_SUB}</span> {this.state.val740 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val740}>
                                <div className="col-md-4">
                                    <Input inputProps={{
                                        name: '750_4',
                                        hintText: strings.BY_PRODUCT_NAME,
                                        floatingLabelText: strings.BY_PRODUCT_NAME,
                                        disabled: this.state.val740 != 'Yes' || this.props.disableAll
                                    }}
                                        eReq={strings.BY_PRODUCT_NAME_REQ_MESSAGE}
                                        maxLength={100} initialValue={this.dataObj['750_L40_1'] || ''}
                                        isClicked={isClicked} ref="750_4" />
                                </div>
                                <div className="col-md-4">
                                    <DateTimePicker inputProps={{
                                        name: '760_4',
                                        placeholder: strings.BY_PRODUCT_LAST_FED_DATE,
                                        label: strings.BY_PRODUCT_LAST_FED_DATE,
                                        disabled: this.state.val740 != 'Yes' || this.props.disableAll
                                    }}
                                        dateFormat='DD/MM/YYYY' timeFormat={false}
                                        eReq={strings.BY_PRODUCT_LAST_FED_DATE_REQ_MESSAGE}
                                        defaultValue={this.dataObj['760_L40_1'] ? new Date(this.dataObj['760_L40_1']) : undefined}
                                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                                        isClicked={isClicked} ref="760_4" />
                                </div>
                                <div className="col-md-4">
                                    <DocumentUpload
                                        disabled={this.state.val740 != 'Yes' || this.props.disableAll}
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
                    <div className="que-numb">5)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_CTL_5}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '780_5', defaultSelected: this.dataObj['780'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val780: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="780_5" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_CTL_5_SUB}</span> {this.state.val780 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="que-text-ans" key={this.state.val780}>
                                <Input inputProps={{
                                    name: '790_5',
                                    hintText: strings.QUE_CTL_5_SUB_INPUT_LABEL,
                                    floatingLabelText: strings.QUE_CTL_5_SUB_INPUT_LABEL,
                                    disabled: this.state.val780 != 'Yes' || this.props.disableAll
                                }}
                                    eReq={strings.QUE_CTL_5_SUB_INPUT_REQ_MESSAGE}
                                    maxLength={500} initialValue={this.dataObj['790'] || ''}
                                    isClicked={isClicked} ref="790_5" />
                            </div>
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">6)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_CTL_6}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '800_6', defaultSelected: this.dataObj['800'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => {
                                    if (this.state.val800 != value)
                                        this.setState({ val800: value, val800LP: [Math.random()] });
                                }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="800_6" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_CTL_6_SUB}</span> {this.state.val800 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val800}>
                                {this.render800LP()}
                                <div className="clearfix mt5" />
                                <div className="col-md-12">
                                    <Button
                                        inputProps={{
                                            name: 'btnAdd',
                                            label: strings.ADD_BUTTON,
                                            className: 'button2Style button30Style mt10',
                                            disabled: this.state.val800 != 'Yes' || this.props.disableAll
                                        }}
                                        onClick={() => {
                                            let val = [...this.state.val800LP];
                                            val.push(Math.random());
                                            this.setState({ val800LP: val });
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
                        <span>{strings.QUE_CTL_7}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '850_7', defaultSelected: this.dataObj['850'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => {
                                    if (this.state.val850 != value)
                                        this.setState({ val850: value, val850LP: [Math.random()] });
                                }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="850_7" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_CTL_7_SUB}</span> {this.state.val850 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val850}>
                                {this.render850LP()}
                                <div className="clearfix mt5" />
                                <div className="col-md-12">
                                    <Button
                                        inputProps={{
                                            name: 'btnAdd',
                                            label: strings.ADD_BUTTON,
                                            className: 'button2Style button30Style mt10',
                                            disabled: this.state.val850 != 'Yes' || this.props.disableAll
                                        }}
                                        onClick={() => {
                                            let val = [...this.state.val850LP];
                                            val.push(Math.random());
                                            this.setState({ val850LP: val });
                                        }}></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">8)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_CTL_8}</span><br />
                        <div className="mt5">{strings.QUE_CTL_8_1}</div>
                        <div className="mt5">{strings.QUE_CTL_8_2}<span className="mandatory-star">*</span></div>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '910_8', defaultSelected: this.dataObj['910'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val910: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="910_8" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_CTL_8_SUB}</span> {this.state.val910 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="que-text-ans" key={this.state.val910}>
                                <DateTimePicker inputProps={{
                                    name: '920_8',
                                    placeholder: strings.DATE_SPRAYED,
                                    label: strings.DATE_SPRAYED,
                                    disabled: this.state.val910 != 'Yes' || this.props.disableAll
                                }}
                                    dateFormat='DD/MM/YYYY' timeFormat={false}
                                    eReq={strings.DATE_SPRAYED_REQ_MESSAGE}
                                    defaultValue={this.dataObj['920'] ? new Date(this.dataObj['920']) : undefined}
                                    dateFilter={{ isBefore: true, isIncludeToday: true }}
                                    isClicked={isClicked} ref="920_8" />
                            </div>
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">9)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_CTL_9}</span>
                        <div className="que-text-ans">
                            <Input inputProps={{
                                name: '930_9',
                                hintText: strings.ADDITIONAL_INFO,
                                floatingLabelText: strings.ADDITIONAL_INFO,
                                disabled: this.props.disableAll
                            }}
                                maxLength={300} initialValue={this.dataObj['930'] || ''}
                                isClicked={isClicked} ref="930_9" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
            </div>
        );
    }

    render() {
        return (<div>
            {this.renderQuestionnaire()}
        </div>);
    }
}

export default TabLPACattle;