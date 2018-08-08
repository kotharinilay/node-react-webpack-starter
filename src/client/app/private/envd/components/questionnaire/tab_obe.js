'use strict';

/**************************
 * tab component of OBE
 * **************************** */

import React, { Component } from 'react';

import CheckBox from '../../../../../lib/core-components/CheckBox';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';
import { nvdAccredQue } from '../../../../../../shared/constants';

class TabOBE extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.getValues = this.getValues.bind(this);
        this.obeSchema = [nvdAccredQue.obeOrganic];
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
        let isValid = isValidForm(this.obeSchema, this.refs);
        if (!isValid) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let obj = getForm(this.obeSchema, this.refs);

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
                <div className="que-numb"></div>
                <div className="que-text-box">
                    <div className="que-text-ans">
                        <CheckBox inputProps={{
                            name: nvdAccredQue.obeOrganic,
                            label: strings.OBE_ORGANIC,
                            defaultChecked: this.dataObj[nvdAccredQue.obeOrganic] == 1 ? true : false,
                            disabled: this.props.disableAll
                        }}
                            isClicked={isClicked} ref={nvdAccredQue.obeOrganic} />
                    </div>
                </div>
                <i><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" /></i>
            </div>
            <div className="clearfix" />
        </div>);
    }
}
export default TabOBE;