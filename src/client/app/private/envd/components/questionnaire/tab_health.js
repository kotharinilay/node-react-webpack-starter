'use strict';

/**************************
 * tab component of Health Statement
 * **************************** */

import React, { Component } from 'react';

import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import Input from '../../../../../lib/core-components/Input';
import RadioButton from '../../../../../lib/core-components/RadioButton';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';
import { nvdAccredQue } from '../../../../../../shared/constants';

class TabHealth extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.state = { valBRD: null }

        this.getValues = this.getValues.bind(this);
        this.answerYesNo = [{ Value: 'Yes', Text: this.strings.ANS_YES }, { Value: 'No', Text: this.strings.ANS_NO }];

        this.healthSchema = [nvdAccredQue.healthBRD];
    }

    componentWillMount() {
        this.dataObj = {};
        let key = '';
        if (this.props.editData.length > 0) {
            this.props.editData.forEach(function (element) {
                key = element.DataId + (element.Loop ? `_${element.Loop}_${element.SortOrder}` : '');
                this.dataObj[key] = element.Value;
            }, this);
        }
    }

    getValues() {
        let isValid = isValidForm(this.healthSchema, this.refs);
        if (!isValid) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.healthSchema, this.refs);

        let finalObj = [];
        let _this = this;
        Object.keys(obj).forEach(function (key, index) {
            let newObj = {
                AccreditationProgramId: null,
                DataId: key,
                Value: obj[key],
                AgliveFile: null,
                AgliveFileId: null
            }
            finalObj.push(newObj);
        });

        return finalObj;
    }

    render() {
        let strings = this.strings;
        let isClicked = this.props.isClicked;

        this.healthSchema = [nvdAccredQue.healthBRD];
        if (this.state.valBRD == 'Yes')
            this.healthSchema.push(...[nvdAccredQue.healthBottleId, nvdAccredQue.healthBatchNo, nvdAccredQue.healthExpiryDate]);

        return (<div>
            <div className="que-box">
                <div className="que-numb">1)</div>
                <div className="que-text-box">
                    {strings.QUE_1} {/*<span className="mandatory-star">*</span>*/}
                    <div className="que-text-ans">
                        <RadioButton inputGroupProps={{ name: nvdAccredQue.healthBRD, defaultSelected: this.dataObj[nvdAccredQue.healthBRD] }}
                            //eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                            disabled={this.props.disableAll}
                            dataSource={this.answerYesNo}
                            horizontalAlign={true}
                            onChange={(value) => { this.setState({ valBRD: value }); }}
                            textField="Text" valueField="Value"
                            isClicked={isClicked} ref={nvdAccredQue.healthBRD} />
                    </div>
                    <div>
                        <div className="clearfix mt10" />
                        {strings.QUE_1_SUB} {this.state.valBRD == 'Yes' ? <span className="mandatory-star">*</span> : null}
                        <div className="row que-text-ans" key={this.state.valBRD}>
                            <div className="col-md-4">
                                <Input inputProps={{
                                    name: nvdAccredQue.healthBottleId,
                                    hintText: strings.BOTTLE_ID,
                                    floatingLabelText: strings.BOTTLE_ID,
                                    disabled: this.state.valBRD != 'Yes' || this.props.disableAll
                                }}
                                    eReq={strings.BOTTLE_ID_REQ_MESSAGE}
                                    initialValue={this.dataObj[nvdAccredQue.healthBottleId] || ''}
                                    isClicked={isClicked} ref={nvdAccredQue.healthBottleId} />
                            </div>
                            <div className="col-md-4">
                                <Input inputProps={{
                                    name: nvdAccredQue.healthBatchNo,
                                    hintText: strings.BATCH_NO,
                                    floatingLabelText: strings.BATCH_NO,
                                    disabled: this.state.valBRD != 'Yes' || this.props.disableAll
                                }}
                                    eReq={strings.BATCH_NO_REQ_MESSAGE}
                                    initialValue={this.dataObj[nvdAccredQue.healthBatchNo] || ''}
                                    isClicked={isClicked} ref={nvdAccredQue.healthBatchNo} />
                            </div>
                            <div className="col-md-4">
                                <DateTimePicker inputProps={{
                                    name: nvdAccredQue.healthExpiryDate,
                                    placeholder: strings.EXPIRY_DATE,
                                    label: strings.EXPIRY_DATE,
                                    disabled: this.state.valBRD != 'Yes' || this.props.disableAll
                                }}
                                    dateFormat='DD/MM/YYYY' timeFormat={false}
                                    eReq={strings.EXPIRY_DATE_REQ_MESSAGE}
                                    defaultValue={this.dataObj[nvdAccredQue.healthExpiryDate] ?
                                        new Date(this.dataObj[nvdAccredQue.healthExpiryDate]) : undefined}
                                    isClicked={isClicked} ref={nvdAccredQue.healthExpiryDate} />
                            </div>
                        </div>
                    </div>
                </div>
                <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
            </div>
        </div>);
    }
}
export default TabHealth;