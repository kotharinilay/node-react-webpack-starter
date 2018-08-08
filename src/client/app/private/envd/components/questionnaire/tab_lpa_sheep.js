'use strict';

/**************************
 * tab component of Sheep Questionnaire
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

class TabLPASheep extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.state = {
            valAnsAB: null,
            val760LP: [Math.random()],
            val810LP: [Math.random()]
        };

        this.getValues = this.getValues.bind(this);
        this.renderQuestionnaire = this.renderQuestionnaire.bind(this);

        this.render760LP = this.render760LP.bind(this);
        this.render810LP = this.render810LP.bind(this);

        this.answerYesNo = [{ Value: 'Yes', Text: this.strings.ANS_YES }, { Value: 'No', Text: this.strings.ANS_NO }];
        this.answerMonth = [{ Value: 'Less2months', Text: this.strings.ANS_SUB_LESS2MONTHS },
        { Value: '2to6months', Text: this.strings.ANS_SUB_2TO6MONTHS },
        { Value: '6to12months', Text: this.strings.ANS_SUB_6TO12MONTHS },
        { Value: 'More12months', Text: this.strings.ANS_SUB_MORE12MONTHS }];

        this.schema = ['630_A', '640_B', '650_C', '700_1', '730_2', '740_3', '760_4', '810_5', '870_6', '880_7'];
    }

    componentWillMount() {
        this.dataObj = {};
        let key = '', stateObj = {};
        let Q4Count = 0, Q4Row = [...this.state.val760LP], Q5Count = 0, Q5Row = [...this.state.val810LP];
        if (this.props.editData.length > 0) {
            this.props.editData.forEach(function (element) {
                key = element.DataId + (element.Loop ? `_${element.Loop}_${element.SortOrder}` : '');
                this.dataObj[key] = element.Value;

                if (element.DataId == '700' && element.Value == 'Yes') {
                    this.schema.push(...['710_1', '720_1']);
                    stateObj.val700 = 'Yes';
                }
                if (element.DataId == '740' && element.Value == 'No') {
                    this.schema.push('750_3');
                    stateObj.val740 = 'No';
                }

                if (element.DataId == '770') {
                    Q4Count++;
                    if (Q4Count > 1) {
                        let random = Math.random();
                        this.schema.push(...["770_4_" + random, "780_4_" + random, "790_4_" + random,
                        "800_4_" + random]);
                        Q4Row.push(random);
                    }
                }
                if (element.DataId == '820') {
                    Q5Count++;
                    if (Q5Count > 1) {
                        let random = Math.random();
                        this.schema.push(...["820_5_" + random, "830_5_" + random, "840_5_" + random,
                        "850_5_" + random, "860_5_" + random]);
                        Q5Row.push(random);
                    }
                }
            }, this);
            stateObj.val760LP = Q4Row;
            stateObj.val810LP = Q5Row;
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
                if (questionNo == "4") {
                    loop = 'L40';
                    index = _this.state.val760LP.findIndex(x => x == key.substr(6));
                }
                else if (questionNo == "5") {
                    loop = 'L50';
                    index = _this.state.val810LP.findIndex(x => x == key.substr(6));
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

    render760LP() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;
        return (this.state.val760LP.map((d, i) => {
            if (this.state.val760 == 'Yes')
                this.schema.push(...["770_4_" + d, "780_4_" + d, "790_4_" + d, "800_4_" + d]);
            return (<div key={d}>
                <div className="col-md-3">
                    <Input inputProps={{
                        name: '770_4_' + d,
                        hintText: strings.CHEMICAL_PRODUCT,
                        floatingLabelText: strings.CHEMICAL_PRODUCT,
                        disabled: this.state.val760 != 'Yes' || this.props.disableAll
                    }}
                        eReq={strings.CHEMICAL_PRODUCT_REQ_MESSAGE}
                        maxLength={200} initialValue={this.dataObj[`770_L40_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"770_4_" + d} />
                </div>
                <div className="col-md-3">
                    <DateTimePicker inputProps={{
                        name: '780_4_' + d,
                        placeholder: strings.TREATMENT_DATE,
                        label: strings.TREATMENT_DATE,
                        disabled: this.state.val760 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`780_L40_${i + 1}`] ? new Date(this.dataObj[`780_L40_${i + 1}`]) : undefined}
                        eReq={strings.TREATMENT_DATE_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"780_4_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '790_4_' + d,
                        hintText: strings.WHP,
                        floatingLabelText: strings.WHP,
                        disabled: this.state.val760 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={10} initialValue={this.dataObj[`790_L40_${i + 1}`] || ''}
                        eReq={strings.WHP_REQ_MESSAGE}
                        isClicked={isClicked} ref={"790_4_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '800_4_' + d,
                        hintText: strings.ESI,
                        floatingLabelText: strings.ESI,
                        disabled: this.state.val760 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={10} initialValue={this.dataObj[`800_L40_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"800_4_" + d} />
                </div>
                <div className="col-md-2">
                    <a className="del-icon mt20" onClick={() => {
                        let val = [...this.state.val760LP];
                        if (val.length > 1) {
                            let index = val.findIndex(x => x == d);
                            if (index != -1)
                                val.splice(index, 1);
                            this.setState({ val760LP: val });
                        }
                        else
                            this.setState({ val760LP: [Math.random()] });
                    }}></a>
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
                this.schema.push(...["820_5_" + d, "830_5_" + d, "840_5_" + d, "850_5_" + d, "860_5_" + d]);
            return (<div key={d}>
                <div className="col-md-2">
                    <Input inputProps={{
                        name: '820_5_' + d,
                        hintText: strings.CHEMICAL_PRODUCT,
                        floatingLabelText: strings.CHEMICAL_PRODUCT,
                        disabled: this.state.val810 != 'Yes' || this.props.disableAll
                    }}
                        eReq={strings.CHEMICAL_PRODUCT_REQ_MESSAGE}
                        maxLength={200} initialValue={this.dataObj[`820_L50_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"820_5_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '830_5_' + d,
                        placeholder: strings.DATE_APPLIED,
                        label: strings.DATE_APPLIED,
                        disabled: this.state.val810 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`830_L50_${i + 1}`] ? new Date(this.dataObj[`830_L50_${i + 1}`]) : undefined}
                        eReq={strings.DATE_APPLIED_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"830_5_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '840_5_' + d,
                        hintText: strings.GRAZING_WHP,
                        floatingLabelText: strings.GRAZING_WHP,
                        disabled: this.state.val810 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={100} initialValue={this.dataObj[`840_L50_${i + 1}`] || ''}
                        eReq={strings.GRAZING_WHP_REQ_MESSAGE}
                        isClicked={isClicked} ref={"840_5_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '850_5_' + d,
                        placeholder: strings.DATE_FIRST_FED_GRAZED,
                        label: strings.DATE_FIRST_FED_GRAZED,
                        disabled: this.state.val810 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`850_L50_${i + 1}`] ? new Date(this.dataObj[`850_L50_${i + 1}`]) : undefined}
                        eReq={strings.DATE_FIRST_FED_GRAZED_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"850_5_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '860_5_' + d,
                        placeholder: strings.DATE_FEEDING_GRAZING_CEASED,
                        label: strings.DATE_FEEDING_GRAZING_CEASED,
                        disabled: this.state.val810 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`860_L50_${i + 1}`] ? new Date(this.dataObj[`860_L50_${i + 1}`]) : undefined}
                        eReq={strings.DATE_FEEDING_GRAZING_CEASED_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"860_5_" + d} />
                </div>
                <div className="col-md-2">
                    <a className="del-icon mt20" onClick={() => {
                        let val = [...this.state.val810LP];
                        if (val.length > 1) {
                            let index = val.findIndex(x => x == d);
                            if (index != -1)
                                val.splice(index, 1);
                            this.setState({ val810LP: val });
                        }
                        else
                            this.setState({ val810LP: [Math.random()] });
                    }}></a>
                </div>
                <div className="clearfix" />
            </div >)
        }));
    }

    renderQuestionnaire() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;

        this.schema = ['630_A', '640_B', '650_C', '700_1', '730_2', '740_3', '760_4', '810_5', '870_6', '880_7'];

        if (this.state.val700 == 'Yes')
            this.schema.push(...['710_1', '720_1']);
        if (this.state.val740 == 'No')
            this.schema.push('750_3');

        return (
            <div>
                <div className="que-box">
                    <div className="que-numb">A)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_SHEEP_A}</span> {this.state.valAnsAB == null ? <span className="mandatory-star">*</span> : null}
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '630_A', defaultSelected: this.dataObj['630'] }}
                                eReq={this.state.valAnsAB == null ? this.strings.COMMON.RADIO_BUTTON_REQ : null}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ valAnsAB: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="630_A" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">B)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_SHEEP_B}</span> {this.state.valAnsAB == null ? <span className="mandatory-star">*</span> : null}
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '640_B', defaultSelected: this.dataObj['640'] }}
                                eReq={this.state.valAnsAB == null ? this.strings.COMMON.RADIO_BUTTON_REQ : null}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ valAnsAB: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="640_B" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">C)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_SHEEP_C}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <NumberInput inputProps={{
                                name: '650_C',
                                hintText: strings.HOURS_OFF_FEED_WATER,
                                floatingLabelText: strings.HOURS_OFF_FEED_WATER,
                                disabled: this.props.disableAll
                            }}
                                maxLength={2} initialValue={this.dataObj['650'] || ''}
                                eReq={strings.HOURS_OFF_FEED_WATER_REQ_MESSAGE}
                                isClicked={isClicked} ref="650_C" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />

                <div className="que-box">
                    <div className="que-numb">1)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_SHEEP_1}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '700_1', defaultSelected: this.dataObj['700'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val700: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="700_1" />
                        </div>
                        <div className="clearfix mt10" />
                        <span>{strings.QUE_SHEEP_1_SUB}</span>
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
                                    maxLength={100} initialValue={this.dataObj['710'] || ''}
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
                                    maxLength={50} initialValue={this.dataObj['720'] || ''}
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
                        <span>{strings.QUE_SHEEP_2}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '730_2', defaultSelected: this.dataObj['730'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="730_2" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">3)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_SHEEP_3}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '740_3', defaultSelected: this.dataObj['740'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => { this.setState({ val740: value }); }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="740_3" />
                        </div>
                        <div className="clearfix mt10" />
                        <span>{strings.QUE_SHEEP_3_SUB}</span>
                        {this.state.val740 == 'No' ? <span className="mandatory-star">*</span> : null}
                        <div className="que-text-ans" key={this.state.val740}>
                            <RadioButton inputGroupProps={{ name: '750_3', defaultSelected: this.dataObj['750'] }}
                                eReq={this.state.val740 == 'No' ? this.strings.COMMON.RADIO_BUTTON_REQ : null}
                                disabled={this.state.val740 != 'No' || this.props.disableAll}
                                dataSource={this.answerMonth}
                                horizontalAlign={true}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="750_3" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">4)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_SHEEP_4}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '760_4', defaultSelected: this.dataObj['760'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => {
                                    if (this.state.val760 != value)
                                        this.setState({ val760: value, val760LP: [Math.random()] });
                                }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="760_4" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_SHEEP_4_SUB}</span> {this.state.val760 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val760}>
                                {this.render760LP()}
                                <div className="clearfix mt5" />
                                <div className="col-md-12">
                                    <Button
                                        inputProps={{
                                            name: 'btnAdd',
                                            label: strings.ADD_BUTTON,
                                            className: 'button2Style button30Style mt10',
                                            disabled: this.state.val760 != 'Yes' || this.props.disableAll
                                        }}
                                        onClick={() => {
                                            let val = [...this.state.val760LP];
                                            val.push(Math.random());
                                            this.setState({ val760LP: val });
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
                        <span>{strings.QUE_SHEEP_5}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '810_5', defaultSelected: this.dataObj['810'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => {
                                    if (this.state.val810 != value)
                                        this.setState({ val810: value, val810LP: [Math.random()] });
                                }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="810_5" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_SHEEP_5_SUB}</span> {this.state.val810 == 'Yes' ? <span className="mandatory-star">*</span> : null}
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
                    <div className="que-numb">6)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_SHEEP_6}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '870_6', defaultSelected: this.dataObj['870'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="870_6" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">7)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_SHEEP_7}</span><br />
                        <div className="que-text-ans">
                            <Input inputProps={{
                                name: '880_7',
                                hintText: strings.ADDITIONAL_INFO,
                                floatingLabelText: strings.ADDITIONAL_INFO,
                                disabled: this.props.disableAll
                            }}
                                maxLength={300} initialValue={this.dataObj['880'] || ''}
                                isClicked={isClicked} ref="880_7" />
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

export default TabLPASheep;