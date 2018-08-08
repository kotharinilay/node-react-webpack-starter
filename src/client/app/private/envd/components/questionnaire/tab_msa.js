'use strict';

/**************************
 * tab component of MSA
 * **************************** */

import React, { Component } from 'react';

import Input from '../../../../../lib/core-components/Input';
import RadioButton from '../../../../../lib/core-components/RadioButton';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';
import { nvdAccredQue } from '../../../../../../shared/constants';

class TabMSA extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.state = { valBRD: null }

        this.getValues = this.getValues.bind(this);
        this.answerYesNo = [{ Value: 'Yes', Text: this.strings.ANS_YES }, { Value: 'No', Text: this.strings.ANS_NO }];
        this.highestTropicalBreed = [
            { Value: 'Zero', Text: this.strings.ZERO },
            { Value: 'Less13', Text: this.strings.LESS13 },
            { Value: 'Less20', Text: this.strings.LESS20 },
            { Value: 'Less26', Text: this.strings.LESS26 },
            { Value: 'Less39', Text: this.strings.LESS39 },
            { Value: 'Less51', Text: this.strings.LESS51 },
            { Value: 'Less76', Text: this.strings.LESS76 },
            { Value: 'Upto100', Text: this.strings.UPTO100 },
        ];

        this.msaSchema = [nvdAccredQue.msaMilkFedVealers, nvdAccredQue.msaSoldThroughMSAAccredited,
        nvdAccredQue.msaHighestTropicalBreed, nvdAccredQue.msaComment];
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
        let isValid = isValidForm(this.msaSchema, this.refs);
        if (!isValid) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.msaSchema, this.refs);

        let finalObj = [];
        let _this = this;
        Object.keys(obj).forEach(function (key, index) {
            let newObj = {
                AccreditationProgramId: _this.props.accreditationProgramId,
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

        return (<div>
            <div className="que-box">
                <div className="que-numb">1)</div>
                <div className="que-text-box">
                    {strings.QUE_1} {/*<span className="mandatory-star">*</span>*/}<br />
                    <div className="mt5">{strings.QUE_1_SUB}</div>
                    <div className="que-text-ans">
                        <RadioButton inputGroupProps={{
                            name: nvdAccredQue.msaMilkFedVealers,
                            defaultSelected: this.dataObj[nvdAccredQue.msaMilkFedVealers]
                        }}
                            disabled={this.props.disableAll}
                            // eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                            dataSource={this.answerYesNo}
                            horizontalAlign={true}
                            textField="Text" valueField="Value"
                            isClicked={isClicked} ref={nvdAccredQue.msaMilkFedVealers} />
                    </div>
                </div>
                <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
            </div>
            <div className="clearfix" />
            <div className="que-box">
                <div className="que-numb">2)</div>
                <div className="que-text-box">
                    {strings.QUE_2} {/*<span className="mandatory-star">*</span>*/}
                    <div className="que-text-ans">
                        <RadioButton inputGroupProps={{
                            name: nvdAccredQue.msaSoldThroughMSAAccredited,
                            defaultSelected: this.dataObj[nvdAccredQue.msaSoldThroughMSAAccredited]
                        }}
                            disabled={this.props.disableAll}
                            // eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                            dataSource={this.answerYesNo}
                            horizontalAlign={true}
                            textField="Text" valueField="Value"
                            isClicked={isClicked} ref={nvdAccredQue.msaSoldThroughMSAAccredited} />
                    </div>
                </div>
                <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
            </div>
            <div className="clearfix" />
            <div className="que-box">
                <div className="que-numb">3)</div>
                <div className="que-text-box">
                    {strings.QUE_3} {/*<span className="mandatory-star">*</span>*/}
                    <div className="que-text-ans">
                        <RadioButton inputGroupProps={{
                            name: nvdAccredQue.msaHighestTropicalBreed,
                            defaultSelected: this.dataObj[nvdAccredQue.msaHighestTropicalBreed]
                        }}
                            disabled={this.props.disableAll}
                            // eReq={this.strings.COMMON.RADIO_BUTTON_REQ}
                            dataSource={this.highestTropicalBreed}
                            horizontalAlign={true}
                            textField="Text" valueField="Value"
                            isClicked={isClicked} ref={nvdAccredQue.msaHighestTropicalBreed} />
                    </div>
                </div>
                <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
            </div>
            <div className="clearfix" />
            <div className="que-box">
                <div className="que-numb"></div>
                <div className="que-text-box">
                    <div className="que-text-ans">
                        <Input inputProps={{
                            name: nvdAccredQue.msaComment,
                            hintText: strings.COMMENT,
                            floatingLabelText: strings.COMMENT,
                            disabled: this.props.disableAll
                        }}
                            multiLine={true}
                            initialValue={this.dataObj[nvdAccredQue.msaComment] || ''}
                            isClicked={isClicked} ref={nvdAccredQue.msaComment} />
                    </div>
                </div>
            </div>
        </div>);
    }
}
export default TabMSA;