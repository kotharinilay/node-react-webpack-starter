'use strict';

/**************************
 * tab component of Goat Questionnaire
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

class TabLPAGoat extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.state = {
            val730LP: [Math.random()],
            val780LP: [Math.random()]
        };

        this.getValues = this.getValues.bind(this);
        this.renderQuestionnaire = this.renderQuestionnaire.bind(this);

        this.render730LP = this.render730LP.bind(this);
        this.render780LP = this.render780LP.bind(this);

        this.answerYesNo = [{ Value: 'Yes', Text: this.strings.ANS_YES }, { Value: 'No', Text: this.strings.ANS_NO }];
        this.answerMonth = [{ Value: 'Less2months', Text: this.strings.ANS_SUB_LESS2MONTHS },
        { Value: '2to6months', Text: this.strings.ANS_SUB_2TO6MONTHS },
        { Value: '6to12months', Text: this.strings.ANS_SUB_6TO12MONTHS },
        { Value: 'More12months', Text: this.strings.ANS_SUB_MORE12MONTHS }];

        this.schema = ['700_1', '720_2', '730_3', '780_4', '840_5', '850_6'];
    }

    componentWillMount() {
        this.dataObj = {};
        let key = '', stateObj = {};
        let Q3Count = 0, Q3Row = [...this.state.val730LP], Q4Count = 0, Q4Row = [...this.state.val780LP];
        if (this.props.editData.length > 0) {
            this.props.editData.forEach(function (element) {
                key = element.DataId + (element.Loop ? `_${element.Loop}_${element.SortOrder}` : '');
                this.dataObj[key] = element.Value;

                if (element.DataId == '700' && element.Value == 'No') {
                    this.schema.push('710_1');
                    stateObj.val700 = 'No';
                }

                if (element.DataId == '740') {
                    Q3Count++;
                    if (Q3Count > 1) {
                        let random = Math.random();
                        this.schema.push(...["740_3_" + random, "750_3_" + random, "760_3_" + random,
                        "770_3_" + random]);
                        Q3Row.push(random);
                    }
                }
                if (element.DataId == '790') {
                    Q4Count++;
                    if (Q4Count > 1) {
                        let random = Math.random();
                        this.schema.push(...["790_4_" + random, "800_4_" + random, "810_4_" + random,
                        "820_4_" + random, "830_4_" + random]);
                        Q4Row.push(random);
                    }
                }
            }, this);
            stateObj.val730LP = Q3Row;
            stateObj.val780LP = Q4Row;
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
                    index = _this.state.val730LP.findIndex(x => x == key.substr(6));
                }
                else if (questionNo == "4") {
                    loop = 'L50';
                    index = _this.state.val780LP.findIndex(x => x == key.substr(6));
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

    render730LP() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;
        return (this.state.val730LP.map((d, i) => {
            if (this.state.val730 == 'Yes')
                this.schema.push(...["740_3_" + d, "750_3_" + d, "760_3_" + d, "770_3_" + d]);
            return (<div key={d}>
                <div className="col-md-3">
                    <Input inputProps={{
                        name: '740_3_' + d,
                        hintText: strings.CHEMICAL_PRODUCT,
                        floatingLabelText: strings.CHEMICAL_PRODUCT,
                        disabled: this.state.val730 != 'Yes' || this.props.disableAll
                    }}
                        eReq={strings.CHEMICAL_PRODUCT_REQ_MESSAGE}
                        maxLength={200} initialValue={this.dataObj[`740_L40_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"740_3_" + d} />
                </div>
                <div className="col-md-3">
                    <DateTimePicker inputProps={{
                        name: '750_3_' + d,
                        placeholder: strings.TREATMENT_DATE,
                        label: strings.TREATMENT_DATE,
                        disabled: this.state.val730 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`750_L40_${i + 1}`] ? new Date(this.dataObj[`750_L40_${i + 1}`]) : undefined}
                        eReq={strings.TREATMENT_DATE_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"750_3_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '760_3_' + d,
                        hintText: strings.WHP,
                        floatingLabelText: strings.WHP,
                        disabled: this.state.val730 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={10} initialValue={this.dataObj[`760_L40_${i + 1}`] || ''}
                        eReq={strings.WHP_REQ_MESSAGE}
                        isClicked={isClicked} ref={"760_3_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '770_3_' + d,
                        hintText: strings.ESI,
                        floatingLabelText: strings.ESI,
                        disabled: this.state.val730 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={10} initialValue={this.dataObj[`770_L40_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"770_3_" + d} />
                </div>
                <div className="col-md-2">
                    <a className="del-icon mt20" onClick={() => {
                        let val = [...this.state.val730LP];
                        if (val.length > 1) {
                            let index = val.findIndex(x => x == d);
                            if (index != -1)
                                val.splice(index, 1);
                            this.setState({ val730LP: val });
                        }
                        else
                            this.setState({ val730LP: [Math.random()] });
                    }}></a>
                </div>
                <div className="clearfix" />
            </div >)
        }));
    }

    render780LP() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;
        return (this.state.val780LP.map((d, i) => {
            if (this.state.val780 == 'Yes')
                this.schema.push(...["790_4_" + d, "800_4_" + d, "810_4_" + d, "820_4_" + d, "830_4_" + d]);
            return (<div key={d}>
                <div className="col-md-2">
                    <Input inputProps={{
                        name: '790_4_' + d,
                        hintText: strings.CHEMICAL_PRODUCT,
                        floatingLabelText: strings.CHEMICAL_PRODUCT,
                        disabled: this.state.val780 != 'Yes' || this.props.disableAll
                    }}
                        eReq={strings.CHEMICAL_PRODUCT_REQ_MESSAGE}
                        maxLength={200} initialValue={this.dataObj[`790_L50_${i + 1}`] || ''}
                        isClicked={isClicked} ref={"790_4_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '800_4_' + d,
                        placeholder: strings.DATE_APPLIED,
                        label: strings.DATE_APPLIED,
                        disabled: this.state.val780 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`800_L50_${i + 1}`] ? new Date(this.dataObj[`800_L50_${i + 1}`]) : undefined}
                        eReq={strings.DATE_APPLIED_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"800_4_" + d} />
                </div>
                <div className="col-md-2">
                    <NumberInput inputProps={{
                        name: '810_4_' + d,
                        hintText: strings.GRAZING_WHP,
                        floatingLabelText: strings.GRAZING_WHP,
                        disabled: this.state.val780 != 'Yes' || this.props.disableAll
                    }}
                        maxLength={100} initialValue={this.dataObj[`810_L50_${i + 1}`] || ''}
                        eReq={strings.GRAZING_WHP_REQ_MESSAGE}
                        isClicked={isClicked} ref={"810_4_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '820_4_' + d,
                        placeholder: strings.DATE_FIRST_FED_GRAZED,
                        label: strings.DATE_FIRST_FED_GRAZED,
                        disabled: this.state.val780 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`820_L50_${i + 1}`] ? new Date(this.dataObj[`820_L50_${i + 1}`]) : undefined}
                        eReq={strings.DATE_FIRST_FED_GRAZED_REQ_MESSAGE}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"820_4_" + d} />
                </div>
                <div className="col-md-2">
                    <DateTimePicker inputProps={{
                        name: '830_4_' + d,
                        placeholder: strings.DATE_FEEDING_GRAZING_CEASED,
                        label: strings.DATE_FEEDING_GRAZING_CEASED,
                        disabled: this.state.val780 != 'Yes' || this.props.disableAll
                    }}
                        dateFormat='DD/MM/YYYY' timeFormat={false}
                        defaultValue={this.dataObj[`830_L50_${i + 1}`] ? new Date(this.dataObj[`830_L50_${i + 1}`]) : undefined}
                        dateFilter={{ isBefore: true, isIncludeToday: true }}
                        isClicked={isClicked} ref={"830_4_" + d} />
                </div>
                <div className="col-md-2">
                    <a className="del-icon mt20" onClick={() => {
                        let val = [...this.state.val780LP];
                        if (val.length > 1) {
                            let index = val.findIndex(x => x == d);
                            if (index != -1)
                                val.splice(index, 1);
                            this.setState({ val780LP: val });
                        }
                        else
                            this.setState({ val780LP: [Math.random()] });
                    }}></a>
                </div>
                <div className="clearfix" />
            </div >)
        }));
    }

    renderQuestionnaire() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;

        this.schema = ['630_A', '640_B', '700_1', '720_2', '730_3', '780_4', '840_5', '850_6'];

        if (this.state.val700 == 'No')
            this.schema.push('710_1');

        return (
            <div>

                <div className="que-box">
                    <div className="que-numb">A)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_GOAT_A}</span> {this.state.valAnsAB == null ? <span className="mandatory-star">*</span> : null}
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
                        <span>{strings.QUE_GOAT_B}</span> {this.state.valAnsAB == null ? <span className="mandatory-star">*</span> : null}
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
                    <div className="que-numb">1)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_GOAT_1}</span> <span className="mandatory-star">*</span>
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
                        <span>{strings.QUE_GOAT_1_SUB}</span>
                        {this.state.val700 == 'No' ? <span className="mandatory-star">*</span> : null}
                        <div className="que-text-ans" key={this.state.val700}>
                            <RadioButton inputGroupProps={{ name: '710_1', defaultSelected: this.dataObj['710'] }}
                                eReq={this.state.val700 == 'No' ? this.strings.COMMON.RADIO_BUTTON_REQ : null}
                                disabled={this.state.val700 != 'No' || this.props.disableAll}
                                dataSource={this.answerMonth}
                                horizontalAlign={true}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="710_1" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">2)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_GOAT_2}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '720_2', defaultSelected: this.dataObj['720'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
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
                        <span>{strings.QUE_GOAT_3}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '730_3', defaultSelected: this.dataObj['730'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => {
                                    if (this.state.val730 != value)
                                        this.setState({ val730: value, val730LP: [Math.random()] });
                                }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="730_3" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_GOAT_3_SUB}</span> {this.state.val730 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val730}>
                                {this.render730LP()}
                                <div className="clearfix mt5" />
                                <div className="col-md-12">
                                    <Button
                                        inputProps={{
                                            name: 'btnAdd',
                                            label: strings.ADD_BUTTON,
                                            className: 'button2Style button30Style mt10',
                                            disabled: this.state.val730 != 'Yes' || this.props.disableAll
                                        }}
                                        onClick={() => {
                                            let val = [...this.state.val730LP];
                                            val.push(Math.random());
                                            this.setState({ val730LP: val });
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
                        <span>{strings.QUE_GOAT_4}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '780_4', defaultSelected: this.dataObj['780'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                onChange={(value) => {
                                    if (this.state.val780 != value)
                                        this.setState({ val780: value, val780LP: [Math.random()] });
                                }}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="780_4" />
                        </div>
                        <div>
                            <div className="clearfix mt10" />
                            <span>{strings.QUE_GOAT_4_SUB}</span> {this.state.val780 == 'Yes' ? <span className="mandatory-star">*</span> : null}
                            <div className="row que-text-ans" key={this.state.val780}>
                                {this.render780LP()}
                                <div className="clearfix mt5" />
                                <div className="col-md-12">
                                    <Button
                                        inputProps={{
                                            name: 'btnAdd',
                                            label: strings.ADD_BUTTON,
                                            className: 'button2Style button30Style mt10',
                                            disabled: this.state.val780 != 'Yes' || this.props.disableAll
                                        }}
                                        onClick={() => {
                                            let val = [...this.state.val780LP];
                                            val.push(Math.random());
                                            this.setState({ val780LP: val });
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
                        <span>{strings.QUE_GOAT_5}</span> <span className="mandatory-star">*</span>
                        <div className="que-text-ans">
                            <RadioButton inputGroupProps={{ name: '840_5', defaultSelected: this.dataObj['840'] }}
                                eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                                disabled={this.props.disableAll}
                                dataSource={this.answerYesNo}
                                horizontalAlign={true}
                                textField="Text" valueField="Value"
                                isClicked={isClicked} ref="840_5" />
                        </div>
                    </div>
                    <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
                </div>
                <div className="clearfix" />
                <div className="que-box">
                    <div className="que-numb">6)</div>
                    <div className="que-text-box">
                        <span>{strings.QUE_GOAT_6}</span><br />
                        <div className="que-text-ans">
                            <Input inputProps={{
                                name: '850_6',
                                hintText: strings.ADDITIONAL_INFO,
                                floatingLabelText: strings.ADDITIONAL_INFO,
                                disabled: this.props.disableAll
                            }}
                                maxLength={300} initialValue={this.dataObj['850'] || ''}
                                isClicked={isClicked} ref="850_6" />
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

export default TabLPAGoat;