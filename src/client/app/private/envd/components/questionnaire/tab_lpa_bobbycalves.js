'use strict';

/**************************
 * tab component of BobbyCalves Questionnaire
 * **************************** */

import React, { Component } from 'react';
import { includes as _includes } from 'lodash';

import RadioButton from '../../../../../lib/core-components/RadioButton';
import Button from '../../../../../lib/core-components/Button';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import Input from '../../../../../lib/core-components/Input';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';

class TabLPABobbyCalves extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.state = {
            val750LP: [Math.random()],
            val810LP: [Math.random()],
            val860LP: [Math.random()]
        };

        this.getValues = this.getValues.bind(this);
        this.renderQuestionnaire = this.renderQuestionnaire.bind(this);

        this.render750LP = this.render750LP.bind(this);
        this.render810LP = this.render810LP.bind(this);
        this.render860LP = this.render860LP.bind(this);

        this.answerYesNo = [{ Value: 'Yes', Text: this.strings.ANS_YES }, { Value: 'No', Text: this.strings.ANS_NO }];
        this.answerMonth = [{ Value: 'Less1week', Text: this.strings.ANS_SUB_LESS1WEEK },
        { Value: 'More1week', Text: this.strings.ANS_SUB_MORE1WEEK }];

        this.schema = ['700_1', '710_2', '720_3', '740_4', '780_5', '790_6', '750_7', '910_8', '930_9'];
    }

    componentWillMount() {
        this.dataObj = {};
        let key = '';
        let Q3Count = 0, Q3Row = [...this.state.val750LP], Q4Count = 0, Q4Row = [...this.state.val810LP],
            Q5Count = 0, Q5Row = [...this.state.val860LP], stateObj = {};
        if (this.props.editData.length > 0) {
            this.props.editData.forEach(function (element) {
                key = element.DataId + (element.Loop ? `_${element.Loop}_${element.SortOrder}` : '');
                this.dataObj[key] = element.Value;

                if (element.DataId == '700' && element.Value == 'Yes') {
                    this.schema.push(...['710_1', '720_1']);
                    stateObj.val700 = 'Yes';
                }
                if (element.DataId == '730' && element.Value == 'Yes') {
                    this.schema.push('740_2');
                    stateObj.val730 = 'Yes';
                }
                if (element.DataId == '910' && element.Value == 'Yes') {
                    this.schema.push('920_6');
                    stateObj.val910 = 'Yes';
                }

                if (element.DataId == '760') {
                    Q3Count++;
                    if (Q3Count > 1) {
                        let random = Math.random();
                        this.schema.push(...["760_3_" + random, "770_3_" + random, "780_3_" + random,
                        "790_3_" + random, "800_3_" + random]);
                        Q3Row.push(random);
                    }
                }
                if (element.DataId == '820') {
                    Q4Count++;
                    if (Q4Count > 1) {
                        let random = Math.random();
                        this.schema.push(...["820_4_" + random, "830_4_" + random, "840_4_" + random,
                        "850_4_" + random]);
                        Q4Row.push(random);
                    }
                }
                if (element.DataId == '870') {
                    Q5Count++;
                    if (Q5Count > 1) {
                        let random = Math.random();
                        this.schema.push(...["870_5_" + random, "880_5_" + random, "890_5_" + random,
                        "900_5_" + random]);
                        Q5Row.push(random);
                    }
                }
            }, this);
            stateObj.val750LP = Q3Row
            stateObj.val810LP = Q4Row
            stateObj.val860LP = Q5Row
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
        let obj = getForm(this.schema, this.refs);

        let finalObj = [];
        let _this = this;
        Object.keys(obj).forEach(function (key, index) {
            let dataId = key.substr(0, 3);
            let questionNo = key.substr(4, 1);

            if (key.length > 5) {
                let loop = null;
                let index = null;
                if (questionNo == "3") {
                    loop = 'L40';
                    index = _this.state.val750LP.findIndex(x => x == key.substr(6));
                }
                else if (questionNo == "4") {
                    loop = 'L50';
                    index = _this.state.val810LP.findIndex(x => x == key.substr(6));
                }
                else if (questionNo == "5") {
                    loop = 'L60';
                    index = _this.state.val860LP.findIndex(x => x == key.substr(6));
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
                let newObj = {
                    QuestionNo: questionNo,
                    DataId: dataId,
                    Loop: null,
                    SortOrder: null,
                    Value: obj[key]
                }
                finalObj.push(newObj);
            }
        });

        return finalObj;
    }

    render750LP() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;
        return (this.state.val750LP.map((d, i) => {
            if (this.state.val750 == 'Yes')
                this.schema.push(...["760_3_" + d, "770_3_" + d, "780_3_" + d, "790_3_" + d, "800_3_" + d]);
            return (<div key={d}>
                <div className="col-md-2">
                    <Input inputProps={{
                        name: '760_3_' + d,
                        hintText: strings.CHEMICAL_PRODUCT,
                        floatingLabelText: strings.CHEMICAL_PRODUCT,
                        disabled: this.state.val750 != 'Yes' || this.props.disableAll
                    }}
                        eReq={strings.CHEMICAL_PRODUCT_REQ_MESSAGE}
                        maxLength={200} initialValue={this.dataObj[`760_L40_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"760_3_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '770_3_' + d,
                        placeholder: strings.DATE_APPLIED,
                        label: strings.DATE_APPLIED,
                        disabled: this.state.val750 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`770_L40_${i + 1}`] ? new Date(this.dataObj[`770_L40_${i + 1}`]) : undefined}
                        eReq={strings.DATE_APPLIED_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"770_3_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '780_3_' + d,
                        hintText: strings.GRAZING_WHP,
                        floatingLabelText: strings.GRAZING_WHP,
                        disabled: this.state.val750 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={100} initialValue={this.dataObj[`780_L40_${i + 1}`] || ''}
                        eReq={strings.GRAZING_WHP_REQ_MESSAGE}
                        isClicked={isClicked} ref={"780_3_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '790_3_' + d,
                        placeholder: strings.DATE_FIRST_FED_GRAZED,
                        label: strings.DATE_FIRST_FED_GRAZED,
                        disabled: this.state.val750 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`790_L40_${i + 1}`] ? new Date(this.dataObj[`790_L40_${i + 1}`]) : undefined}
                        eReq={strings.DATE_FIRST_FED_GRAZED_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"790_3_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '800_3_' + d,
                        placeholder: strings.DATE_FEEDING_GRAZING_CEASED,
                        label: strings.DATE_FEEDING_GRAZING_CEASED,
                        disabled: this.state.val750 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`800_L40_${i + 1}`] ? new Date(this.dataObj[`800_L40_${i + 1}`]) : undefined}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"800_3_" + d} />
                </div>
                <div className="col-md-2">
                    <Button
                        inputProps={{
                            name: 'btnDelete_' + d,
                            label: strings.DELETE_BUTTON,
                            className: 'button3Style button30Style mt10',
                            disabled: this.state.val750 != 'Yes' || this.props.disableAll
                        }}
                        onClick={() => {
                            let val = [...this.state.val750LP];
                            if (val.length > 1) {
                                let index = val.findIndex(x => x == d);
                                if (index != -1)
                                    val.splice(index, 1);
                                this.setState({ val750LP: val });
                            }
                            else
                                this.setState({ val750LP: [Math.random()] });
                        }}></Button>
                </div>
                <div className="clearfix" />
            </div >)
        }));
    }

    render810LP() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;
        return (this.state.val810LP.map((d, i) => {
            if (this.state.val810 == 'Yes')
                this.schema.push(...["820_4_" + d, "830_4_" + d, "840_4_" + d, "850_4_" + d]);
            return (<div key={d}>
                <div className="col-md-3">
                    <Input inputProps={{
                        name: '820_4_' + d,
                        hintText: strings.VETERINARY_DRUG_CHEMICAL_PRODUCT,
                        floatingLabelText: strings.VETERINARY_DRUG_CHEMICAL_PRODUCT,
                        disabled: this.state.val810 != 'Yes' || this.props.disableAll
                    }}
                        eReq={strings.VETERINARY_DRUG_CHEMICAL_PRODUCT_REQ_MESSAGE}
                        maxLength={100} initialValue={this.dataObj[`820_L50_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"820_4_" + d} />
                </div>
                <div className="col-md-3">
                    <DateTimePicker inputProps={{
                        name: '830_4_' + d,
                        placeholder: strings.TREATMENT_DATE,
                        label: strings.TREATMENT_DATE,
                        disabled: this.state.val810 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`830_L50_${i + 1}`] ? new Date(this.dataObj[`830_L50_${i + 1}`]) : undefined}
                        eReq={strings.TREATMENT_DATE_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"830_4_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '840_4_' + d,
                        hintText: strings.WHP,
                        floatingLabelText: strings.WHP,
                        disabled: this.state.val810 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={3} initialValue={this.dataObj[`840_L50_${i + 1}`] || ''}
                        eReq={strings.WHP_REQ_MESSAGE}
                        isClicked={isClicked} ref={"840_4_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '850_4_' + d,
                        hintText: strings.ESI,
                        floatingLabelText: strings.ESI,
                        disabled: this.state.val810 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={3} initialValue={this.dataObj[`850_L50_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"850_4_" + d} />
                </div>
                <div className="col-md-2">
                    <Button
                        inputProps={{
                            name: 'btnDelete_' + d,
                            label: strings.DELETE_BUTTON,
                            className: 'button3Style button30Style mt10',
                            disabled: this.state.val810 != 'Yes' || this.props.disableAll
                        }}
                        onClick={() => {
                            let val = [...this.state.val810LP];
                            if (val.length > 1) {
                                let index = val.findIndex(x => x == d);
                                if (index != -1)
                                    val.splice(index, 1);
                                this.setState({ val810LP: val });
                            }
                            else
                                this.setState({ val810LP: [Math.random()] });
                        }}></Button>
                </div>
                <div className="clearfix" />
            </div >)
        }));
    }

    render860LP() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;
        return (this.state.val860LP.map((d, i) => {
            if (this.state.val860 == 'Yes')
                this.schema.push(...["870_5_" + d, "880_5_" + d, "890_5_" + d, "900_5_" + d]);
            return (<div key={d}>
                <div className="col-md-3">
                    <Input inputProps={{
                        name: '870_5_' + d,
                        hintText: strings.VETERINARY_DRUG_CHEMICAL_PRODUCT,
                        floatingLabelText: strings.VETERINARY_DRUG_CHEMICAL_PRODUCT,
                        disabled: this.state.val860 != 'Yes' || this.props.disableAll
                    }}
                        eReq={strings.VETERINARY_DRUG_CHEMICAL_PRODUCT_REQ_MESSAGE}
                        maxLength={100} initialValue={this.dataObj[`870_L60_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"870_5_" + d} />
                </div>
                <div className="col-md-3">
                    <DateTimePicker inputProps={{
                        name: '880_5_' + d,
                        placeholder: strings.TREATMENT_DATE,
                        label: strings.TREATMENT_DATE,
                        disabled: this.state.val860 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`880_L60_${i + 1}`] ? new Date(this.dataObj[`880_L60_${i + 1}`]) : undefined}
                        eReq={strings.TREATMENT_DATE_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"880_5_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '890_5_' + d,
                        hintText: strings.WHP,
                        floatingLabelText: strings.WHP,
                        disabled: this.state.val860 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={3} initialValue={this.dataObj[`890_L60_${i + 1}`] || ''}
                        eReq={strings.WHP_REQ_MESSAGE}
                        isClicked={isClicked} ref={"890_5_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '900_5_' + d,
                        hintText: strings.ESI,
                        floatingLabelText: strings.ESI,
                        disabled: this.state.val860 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={3} initialValue={this.dataObj[`900_L60_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"900_5_" + d} />
                </div>
                <div className="col-md-2">
                    <Button
                        inputProps={{
                            name: 'btnDelete_' + d,
                            label: strings.DELETE_BUTTON,
                            className: 'button3Style button30Style mt10',
                            disabled: this.state.val860 != 'Yes' || this.props.disableAll
                        }}
                        onClick={() => {
                            let val = [...this.state.val860LP];
                            if (val.length > 1) {
                                let index = val.findIndex(x => x == d);
                                if (index != -1)
                                    val.splice(index, 1);
                                this.setState({ val860LP: val });
                            }
                            else
                                this.setState({ val860LP: [Math.random()] });
                        }}></Button>
                </div>
                <div className="clearfix" />
            </div >)
        }));
    }

    renderQuestionnaire() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;

        this.schema = ['700_1', '730_2', '750_3', '810_4', '860_5', '910_6', '930_7'];

        if (this.state.val700 == 'Yes')
            this.schema.push(...['710_1', '720_1']);
        if (this.state.val730 == 'Yes')
            this.schema.push('740_2');
        if (this.state.val910 == 'Yes')
            this.schema.push('920_6');

        return (
            <div>
                <div className="que-box">
                    <div className="que-numb">1)</div>
                    <div className="que-text-box">
                        {strings.QUE_1} <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '700_1', defaultSelected: this.dataObj['700'] }}
                                disabled={this.props.disableAll}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val700: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="700_1" />
                        </div>
                        <div className="clearfix mt10" />
                        {strings.QUE_1_SUB}
                        {this.state.val700 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                        <div className="que-text-ans" key={this.state.val700}>
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: '710_1',
                                    hintText: strings.PROGRAM_NAME,
                                    floatingLabelText: strings.PROGRAM_NAME,
                                    disabled: this.state.val700 != 'Yes' || this.props.disableAll
                                }}
                                    eReq={this.state.val700 == 'Yes' ? this.strings.PROGRAM_NAME_REQ_MESSAGE : null}
                                    maxLength={300} initialValue={this.dataObj['710'] || ''}
                                    isClicked={isClicked} ref="710_1" />
                            </div>
                            <div className="col-md-6">
                                <Input inputProps={{
                                    name: '720_1',
                                    hintText: strings.ACCRED_LICENSE_NO,
                                    floatingLabelText: strings.ACCRED_LICENSE_NO,
                                    disabled: this.state.val700 != 'Yes' || this.props.disableAll
                                }}
                                    eReq={this.state.val700 == 'Yes' ? this.strings.ACCRED_LICENSE_NO_REQ_MESSAGE : null}
                                    maxLength={100} initialValue={this.dataObj['720'] || ''}
                                    isClicked={isClicked} ref="720_1" />
                            </div>
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">2)</div>
                    <div className="que-text-box">
                        {strings.QUE_2} <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '730_2', defaultSelected: this.dataObj['730'] }}
                                disabled={this.props.disableAll}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val730: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="730_2" />
                        </div>
                        <div className="clearfix mt10" />
                        {strings.QUE_2_SUB} {this.state.val730 == 'No' ? <span className="mandatory-star">*</span> : null}
                        <div className="que-text-ans" key={this.state.val730}>
                            <RadioButton inputGroupProps={{ name: '740_2', defaultSelected: this.dataObj['740'] }}
                                disabled={this.props.disableAll}
                                eReq={this.state.val730 == 'No' ? this.strings.COMMON.RADIO_BUTTON_REQ : null}
                                disabled={this.state.val730 != 'No'}
                                dataSource={this.answerMonth}
                                horizontalAlign={true}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="740_2" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">3)</div>
                    <div className="que-text-box">
                        {strings.QUE_3} <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '750_3', defaultSelected: this.dataObj['750'] }}
                                disabled={this.props.disableAll}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => {
                                    if (this.state.val750 != value)
                                        this.setState({ val750: value, val750LP: [Math.random()] });
                                }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="750_3" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            {strings.QUE_3_SUB} {this.state.val750 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val750}>
                                {this.render750LP()}
                                <div className="clearfix mt5" />
                                <div className="col-md-12">
                                    <Button
                                        inputProps={{
                                            name: 'btnAdd',
                                            label: strings.ADD_BUTTON,
                                            className: 'button2Style button30Style mt10',
                                            disabled: this.state.val750 != 'Yes' || this.props.disableAll
                                        }}
                                        onClick={() => {
                                            let val = [...this.state.val750LP];
                                            val.push(Math.random());
                                            this.setState({ val750LP: val });
                                        }}></Button>
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
                        {strings.QUE_4} <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '810_4', defaultSelected: this.dataObj['810'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => {
                                    if (this.state.val810 != value)
                                        this.setState({ val810: value, val810LP: [Math.random()] });
                                }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="810_4" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            {strings.QUE_4_SUB} {this.state.val810 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val810}>
                                {this.render810LP()}
                                <div className="clearfix mt5" />
                                <div className="col-md-12">
                                    <Button
                                        inputProps={{
                                            name: 'btnAdd',
                                            label: strings.ADD_BUTTON,
                                            className: 'button2Style button30Style mt10',
                                            disabled: this.state.val810 != 'Yes' || this.props.disableAll
                                        }}
                                        onClick={() => {
                                            let val = [...this.state.val810LP];
                                            val.push(Math.random());
                                            this.setState({ val810LP: val });
                                        }}></Button>
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
                        {strings.QUE_5} <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '860_5', defaultSelected: this.dataObj['860'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => {
                                    if (this.state.val860 != value)
                                        this.setState({ val860: value, val860LP: [Math.random()] });
                                }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="860_5" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            {strings.QUE_5_SUB} {this.state.val860 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val860}>
                                {this.render860LP()}
                                <div className="clearfix mt5" />
                                <div className="col-md-12">
                                    <Button
                                        inputProps={{
                                            name: 'btnAdd',
                                            label: strings.ADD_BUTTON,
                                            className: 'button2Style button30Style mt10',
                                            disabled: this.state.val860 != 'Yes' || this.props.disableAll
                                        }}
                                        onClick={() => {
                                            let val = [...this.state.val860LP];
                                            val.push(Math.random());
                                            this.setState({ val860LP: val });
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
                        {strings.QUE_6} <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '910_6', defaultSelected: this.dataObj['910'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val910: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="910_6" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            {strings.QUE_6_SUB} {this.state.val910 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="que-text-ans" key={this.state.val910}>
                                <Input inputProps={{
                                    name: '920_6',
                                    hintText: strings.QUE_6_SUB_INPUT_LABEL,
                                    floatingLabelText: strings.QUE_6_SUB_INPUT_LABEL,
                                    disabled: this.state.val910 != 'Yes' || this.props.disableAll
                                }}
                                    eReq={strings.QUE_6_SUB_INPUT_REQ_MESSAGE}
                                    maxLength={300} initialValue={this.dataObj['920'] || ''}
                                    isClicked={isClicked} ref="920_6" />
                            </div>
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">7)</div>
                    <div className="que-text-box">
                        {strings.QUE_7}
                        <div className="que-text-ans">
                            <Input inputProps={{
                                name: '930_7',
                                hintText: strings.ADDITIONAL_INFO,
                                floatingLabelText: strings.ADDITIONAL_INFO,
                                disabled: this.props.disableAll
                            }}
                                maxLength={300} initialValue={this.dataObj['930'] || ''}
                                isClicked={isClicked} ref="930_7" />
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

export default TabLPABobbyCalves;