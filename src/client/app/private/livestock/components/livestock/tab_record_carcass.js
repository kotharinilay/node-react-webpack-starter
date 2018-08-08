'use strict';

/**************************
 * tab component livestock carcass
 * **************************** */

import React, { Component } from 'react';

import Input from '../../../../../lib/core-components/Input';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import Button from '../../../../../lib/core-components/Button';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import DatetimePicker from '../../../../../lib/core-components/DatetimePicker';
import RadioButton from '../../../../../lib/core-components/RadioButton';
import BusyButton from '../../../../../lib/wrapper-components/BusyButton';
import GPS_Coordinate from '../../../../../lib/wrapper-components/GPSCoordiante/GPS_Coordinate';
import PICAutoComplete from '../../../../../lib/wrapper-components/PICAutoComplete';

import { getCarcassDDLData } from '../../../../../services/private/livestock';

import { NOTIFY_ERROR, NOTIFY_SUCCESS, NOTIFY_WARNING } from '../../../../common/actiontypes';
import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';

class TabRecordCarcass extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;
        
        this.isMob = this.props.livestock.IsMob;
        this.state = {
            dentition: [],
            dentitionReady: false,
            carcasscategory: [],
            carcasscategoryReady: false,
            buttshape: [],
            buttshapeReady: false,
            boninggroup: [],
            boninggroupReady: false,
            msagrader: [],
            msagraderReady: false,
            hangmethod: [],
            hangmethodReady: false,
            meatcolour: [],
            meatcolourReady: false,
            fatcolour: [],
            fatcolourReady: false,
            gradecode: [],
            gradecodeReady: false
        }

        // this.ProcessedPropertyId = null;

        this.carcassSchema = ['chainnumber', 'frombodynumber', 'operatornumber', 'lotnumber', 'fatthickness',
            'ribfatness', 'rumpfatthickness', 'dentition', 'livecarcassweight', 'hotstandardcarcassweight',
            'bruisescore', 'carcasscategory', 'buttshape', 'eqsreference', 'humpheight', 'feedtype', 'disease',
            'carcassweight', 'producerlicensenumber', 'msastartcode', 'boninggroup', 'msagrader',
            'gradedate', 'leftsidescantime', 'rightsidescantime', 'hangmethod', 'hgp', 'leftsidehscw',
            'rightsidehscw', 'brand', 'pricekg', 'dest', 'versionofmsamodel', 'ismsasaleyard', 'dressingpercentage',
            'gradecode', 'processeddate', 'processedtime', 'tropicalbreedcontent', 'humpcold', 'eyemusclearea',
            'ossification', 'ausmarbling', 'msamarbling', 'meatcolour', 'fatmuscle', 'fatcolour', 'fatdepth',
            'pH', 'lointemperature', 'cost', 'ismilkfedvealer', 'isrinse', 'isrib', 'retailproductyield', 'isgrassseed', 'isarthritis',
        ];

        this.isMob == 1 ? this.carcassSchema.push('livestockcount') : null;

        this.selectPIC = this.selectPIC.bind(this);
        this.setToBodyNumber = this.setToBodyNumber.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getCarcassDDLData(this.props.topPIC).then(function (res) {
            if (res.success) {
                _this.stateSet({
                    dentition: res.data.dentition,
                    dentitionReady: true,
                    carcasscategory: res.data.carcasscategory,
                    carcasscategoryReady: true,
                    buttshape: res.data.buttshape,
                    buttshapeReady: true,
                    boninggroup: res.data.boninggroup,
                    boninggroupReady: true,
                    msagrader: res.data.msagrader,
                    msagraderReady: true,
                    hangmethod: res.data.hangmethod,
                    hangmethodReady: true,
                    meatcolour: res.data.meatcolour,
                    meatcolourReady: true,
                    fatcolour: res.data.fatcolour,
                    fatcolourReady: true,
                    gradecode: res.data.gradecode,
                    gradecodeReady: true
                });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // make scan on pic selected from PICAutoComplete component
    selectPIC(payload) {
        if (payload != null) {
            this.ProcessedPIC = payload.PIC;
            this.ProcessedPICId = payload.Id;
        }
        else {
            this.ProcessedPIC = null;
            this.ProcessedPICId = null;
        }
    }

    setToBodyNumber(value) {
        
        let frombodynumber = this.refs.frombodynumber.fieldStatus.value,
            livestockcount = this.refs.livestockcount.fieldStatus.value;
        if (frombodynumber && livestockcount)
            this.refs.tobodynumber.setState({ value: parseInt(frombodynumber) + parseInt(livestockcount) });
        else
            this.refs.tobodynumber.setState({ value: '' });
        this.refs.frombodynumber.updateInputStatus();
        this.refs.livestockcount.updateInputStatus();
    }

    getFormValues() {
        let isValid = isValidForm(this.carcassSchema, this.refs);
        let gps = this.refs.gps.GPSValue;
        if (!isValid || !gps || !this.ProcessedPIC) {
            this.props.stateSet({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let carcassTabValues = getForm(this.carcassSchema, this.refs);
        Object.assign(carcassTabValues, { ProcessedPIC: this.ProcessedPIC, ProcessedPICId: this.ProcessedPICId, gps: gps });
        if (carcassTabValues.frombodynumber && this.isMob == 1)
            carcassTabValues.tobodynumber = parseInt(carcassTabValues.frombodynumber) + parseInt(carcassTabValues.livestockcount);
        return carcassTabValues;
    }

    render() {
        let strings = this.strings;
        return (
            <div>
                <div className="col-md-4">
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'chainnumber',
                            hintText: strings.CONTROLS.CHAINNUMBER_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.CHAINNUMBER_LABEL
                        }}
                            maxLength={50} initialValue=''
                            isClicked={this.props.isClicked} ref="chainnumber" />
                    </div>
                    {this.isMob == 1 ?
                        <div className="col-md-12">
                            <NumberInput inputProps={{
                                name: 'livestockcount',
                                hintText: strings.CONTROLS.LIVESTOCKCOUNT_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.LIVESTOCKCOUNT_LABEL
                            }}
                                eReq={strings.CONTROLS.LIVESTOCKCOUNT_REQ_MESSAGE}
                                onBlurInput={this.setToBodyNumber}
                                maxLength={10} initialValue=''
                                isClicked={this.props.isClicked} ref="livestockcount" />
                        </div>
                        : null}
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'frombodynumber',
                            hintText: this.isMob == 1 ? strings.CONTROLS.FROMBODYNUMBER_PLACEHOLDER : strings.CONTROLS.BODYNUMBER_PLACEHOLDER,
                            floatingLabelText: this.isMob == 1 ? strings.CONTROLS.FROMBODYNUMBER_LABEL : strings.CONTROLS.BODYNUMBER_LABEL
                        }}
                            onBlurInput={this.isMob == 1 ? this.setToBodyNumber : null}
                            maxLength={10} initialValue=''
                            isClicked={this.props.isClicked} ref="frombodynumber" />
                    </div>
                    {this.isMob == 1 ?
                        <div className="col-md-12">
                            <NumberInput inputProps={{
                                name: 'tobodynumber',
                                hintText: strings.CONTROLS.TOBODYNUMBER_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.TOBODYNUMBER_LABEL,
                                disabled: true
                            }}
                                maxLength={10} initialValue=''
                                isClicked={this.props.isClicked} ref="tobodynumber" />
                        </div>
                        : null}
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'operatornumber',
                            hintText: strings.CONTROLS.OPERATORNUMBER_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.OPERATORNUMBER_LABEL
                        }}
                            maxLength={50} initialValue=''
                            isClicked={this.props.isClicked} ref="operatornumber" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'lotnumber',
                            hintText: strings.CONTROLS.LOTNUMBER_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LOTNUMBER_LABEL
                        }}
                            maxLength={50} initialValue=''
                            isClicked={this.props.isClicked} ref="lotnumber" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'fatthickness',
                            hintText: strings.CONTROLS.FATTHICKNESS_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.FATTHICKNESS_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="fatthickness" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'ribfatness',
                            hintText: strings.CONTROLS.RIBFATNESS_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.RIBFATNESS_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="ribfatness" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'rumpfatthickness',
                            hintText: strings.CONTROLS.RUMPFATTHICKNESS_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.RUMPFATTHICKNESS_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="rumpfatthickness" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'dentition',
                            hintText: this.state.dentitionReady ? strings.CONTROLS.DENTITION_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.DENTITION_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.dentition}
                            isClicked={this.props.isClicked} ref="dentition" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'livecarcassweight',
                            hintText: strings.CONTROLS.LIVECARCASSWEIGHT_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LIVECARCASSWEIGHT_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="livecarcassweight" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'hotstandardcarcassweight',
                            hintText: strings.CONTROLS.HOTSTANDARDCARCASSWEIGHT_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.HOTSTANDARDCARCASSWEIGHT_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="hotstandardcarcassweight" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'bruisescore',
                            hintText: strings.CONTROLS.BRUISESCORE_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.BRUISESCORE_LABEL
                        }}
                            maxLength={10} initialValue=''
                            isClicked={this.props.isClicked} ref="bruisescore" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'carcasscategory',
                            hintText: this.state.carcasscategoryReady ? strings.CONTROLS.CARCASSCATEGORY_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.CARCASSCATEGORY_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.carcasscategory}
                            isClicked={this.props.isClicked} ref="carcasscategory" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'buttshape',
                            hintText: this.state.buttshapeReady ? strings.CONTROLS.BUTTSHAPE_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.BUTTSHAPE_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.buttshape}
                            isClicked={this.props.isClicked} ref="buttshape" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'eqsreference',
                            hintText: strings.CONTROLS.EQSREFERENCE_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.EQSREFERENCE_LABEL
                        }}
                            maxLength={10} initialValue=''
                            isClicked={this.props.isClicked} ref="eqsreference" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'humpheight',
                            hintText: strings.CONTROLS.HUMPHEIGHT_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.HUMPHEIGHT_LABEL
                        }}
                            maxLength={10} initialValue=''
                            isClicked={this.props.isClicked} ref="humpheight" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'feedtype',
                            hintText: strings.CONTROLS.FEEDTYPE_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.FEEDTYPE_LABEL
                        }}
                            initialValue='' maxLength={50}
                            isClicked={this.props.isClicked} ref="feedtype" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'disease',
                            hintText: strings.CONTROLS.DISEASE_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.DISEASE_LABEL
                        }}
                            initialValue='' maxLength={50}
                            isClicked={this.props.isClicked} ref="disease" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'carcassweight',
                            hintText: strings.CONTROLS.CARCASSWEIGHT_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.CARCASSWEIGHT_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="carcassweight" />
                    </div>
                    <div className="col-md-12">
                        <PICAutoComplete
                            inputProps={{
                                hintText: this.strings.CONTROLS.PROCESSEDPIC_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.PROCESSEDPIC_LABEL
                            }}
                            eReq={strings.CONTROLS.PROCESSEDPIC_REQ_MESSAGE}
                            isClicked={this.props.isClicked}
                            targetKey="ProcessedPIC" showDetail={false}
                            findPIC={this.props.findPIC}
                            openFindPIC={this.props.openFindPIC}
                            selectPIC={this.selectPIC}
                            notifyToaster={this.props.notifyToaster} />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'producerlicensenumber',
                            hintText: strings.CONTROLS.PRODUCERLICENSENUMBER_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.PRODUCERLICENSENUMBER_LABEL
                        }}
                            initialValue='' maxLength={50}
                            isClicked={this.props.isClicked} ref="producerlicensenumber" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'msastartcode',
                            hintText: strings.CONTROLS.MSASTARTCODE_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.MSASTARTCODE_LABEL
                        }}
                            initialValue='' maxLength={50}
                            isClicked={this.props.isClicked} ref="msastartcode" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'boninggroup',
                            hintText: this.state.boninggroupReady ? strings.CONTROLS.BONINGGROUP_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.BONINGGROUP_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.boninggroup}
                            isClicked={this.props.isClicked} ref="boninggroup" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'msagrader',
                            hintText: this.state.msagraderReady ? strings.CONTROLS.MSAGRADER_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.MSAGRADER_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.boninggroup}
                            isClicked={this.props.isClicked} ref="msagrader" />
                    </div>
                    <div className="col-md-12">
                        <DatetimePicker inputProps={{
                            name: 'gradedate',
                            placeholder: strings.CONTROLS.GRADEDATE_PLACEHOLDER,
                            label: strings.CONTROLS.GRADEDATE_LABEL,
                        }}
                            defaultValue={new Date()} timeFormat={false}
                            isClicked={this.props.isClicked} ref="gradedate" />
                    </div>
                    <div className="col-md-12">
                        <DatetimePicker inputProps={{
                            name: 'leftsidescantime',
                            placeholder: strings.CONTROLS.LEFTSIDESCANTIME_PLACEHOLDER,
                            label: strings.CONTROLS.LEFTSIDESCANTIME_LABEL,
                        }}
                            defaultValue={new Date()} viewMode='time' dateFormat={false}
                            isClicked={this.props.isClicked} ref="leftsidescantime" />
                    </div>
                    <div className="col-md-12">
                        <DatetimePicker inputProps={{
                            name: 'rightsidescantime',
                            placeholder: strings.CONTROLS.RIGHTSIDESCANTIME_PLACEHOLDER,
                            label: strings.CONTROLS.RIGHTSIDESCANTIME_LABEL,
                        }}
                            defaultValue={new Date()} viewMode='time' dateFormat={false}
                            isClicked={this.props.isClicked} ref="rightsidescantime" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'hangmethod',
                            hintText: this.state.hangmethodReady ? strings.CONTROLS.HANGMETHOD_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.HANGMETHOD_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.hangmethod}
                            isClicked={this.props.isClicked} ref="hangmethod" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'hgp',
                            hintText: strings.CONTROLS.HGP_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.HGP_LABEL
                        }}
                            initialValue='' maxLength={50}
                            isClicked={this.props.isClicked} ref="hgp" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'leftsidehscw',
                            hintText: strings.CONTROLS.LEFTSIDEHSCW_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LEFTSIDEHSCW_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="leftsidehscw" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'rightsidehscw',
                            hintText: strings.CONTROLS.RIGHTSIDEHSCW_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.RIGHTSIDEHSCW_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="rightsidehscw" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'brand',
                            hintText: strings.CONTROLS.BRAND_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.BRAND_LABEL
                        }}
                            maxLength={50} initialValue=''
                            isClicked={this.props.isClicked} ref="brand" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'pricekg',
                            hintText: strings.CONTROLS.PRICEKG_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.PRICEKG_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="pricekg" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'dest',
                            hintText: strings.CONTROLS.DEST_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.DEST_LABEL
                        }}
                            initialValue='' maxLength={50}
                            isClicked={this.props.isClicked} ref="dest" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'versionofmsamodel',
                            hintText: strings.CONTROLS.VERSIONOFMSAMODEL_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.VERSIONOFMSAMODEL_LABEL
                        }}
                            maxLength={50} initialValue=''
                            isClicked={this.props.isClicked} ref="versionofmsamodel" />
                    </div>
                    <div className="col-md-12">
                        <div className="col-md-5 mt5 row"><span>{strings.CONTROLS.ISMSASALEYARD_TEXT}</span></div>
                        <div className="col-md-7"><RadioButton inputGroupProps={{ name: 'ismsasaleyard', defaultSelected: '' }}
                            dataSource={[{ Value: 1, Text: 'Yes' },
                            { Value: 0, Text: 'No' }]}
                            textField="Text" valueField="Value" horizontalAlign={true}
                            isClicked={this.props.isClicked} ref="ismsasaleyard" />
                            </div>                                                
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'dressingpercentage',
                            hintText: strings.CONTROLS.DRESSINGPERCENTAGE_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.DRESSINGPERCENTAGE_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="dressingpercentage" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'gradecode',
                            hintText: this.state.gradecodeReady ? strings.CONTROLS.GRADECODE_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.GRADECODE_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.gradecode}
                            isClicked={this.props.isClicked} ref="gradecode" />
                    </div>
                    <div className="col-md-12">
                        <DatetimePicker inputProps={{
                            name: 'processeddate',
                            placeholder: strings.CONTROLS.PROCESSEDDATE_PLACEHOLDER,
                            label: strings.CONTROLS.PROCESSEDDATE_LABEL,
                        }}
                            eReq={strings.CONTROLS.PROCESSEDDATE_REQ_MESSAGE}
                            defaultValue={new Date()} timeFormat={false}
                            isClicked={this.props.isClicked} ref="processeddate" />
                    </div>
                    <div className="col-md-12">
                        <DatetimePicker inputProps={{
                            name: 'processedtime',
                            placeholder: strings.CONTROLS.PROCESSEDTIME_PLACEHOLDER,
                            label: strings.CONTROLS.PROCESSEDTIME_LABEL,
                        }}
                            eReq={strings.CONTROLS.PROCESSEDTIME_REQ_MESSAGE}
                            defaultValue={new Date()} viewMode='time' dateFormat={false}
                            isClicked={this.props.isClicked} ref="processedtime" />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'tropicalbreedcontent',
                            hintText: strings.CONTROLS.TROPICALBREEDCONTENT_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.TROPICALBREEDCONTENT_LABEL
                        }}
                            maxLength={10} initialValue=''
                            isClicked={this.props.isClicked} ref="tropicalbreedcontent" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'humpcold',
                            hintText: strings.CONTROLS.HUMPCOLD_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.HUMPCOLD_LABEL
                        }}
                            maxLength={50} initialValue=''
                            isClicked={this.props.isClicked} ref="humpcold" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'eyemusclearea',
                            hintText: strings.CONTROLS.EYEMUSCLEAREA_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.EYEMUSCLEAREA_LABEL
                        }}
                            maxLength={50} initialValue=''
                            isClicked={this.props.isClicked} ref="eyemusclearea" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'ossification',
                            hintText: strings.CONTROLS.OSSIFICATION_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.OSSIFICATION_LABEL
                        }}
                            maxLength={50} initialValue=''
                            isClicked={this.props.isClicked} ref="ossification" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'ausmarbling',
                            hintText: strings.CONTROLS.AUSMARBLING_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.AUSMARBLING_LABEL
                        }}
                            maxLength={50} initialValue=''
                            isClicked={this.props.isClicked} ref="ausmarbling" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'msamarbling',
                            hintText: strings.CONTROLS.MSAMARBLING_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.MSAMARBLING_LABEL
                        }}
                            maxLength={50} initialValue=''
                            isClicked={this.props.isClicked} ref="msamarbling" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'meatcolour',
                            hintText: this.state.meatcolourReady ? strings.CONTROLS.MEATCOLOUR_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.MEATCOLOUR_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.meatcolour}
                            isClicked={this.props.isClicked} ref="meatcolour" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'fatmuscle',
                            hintText: strings.CONTROLS.FATMUSCLE_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.FATMUSCLE_LABEL
                        }}
                            maxLength={50} initialValue=''
                            isClicked={this.props.isClicked} ref="fatmuscle" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'fatcolour',
                            hintText: this.state.fatcolourReady ? strings.CONTROLS.FATCOLOUR_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.FATCOLOUR_LABEL,
                            value: null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.fatcolour}
                            isClicked={this.props.isClicked} ref="fatcolour" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'fatdepth',
                            hintText: strings.CONTROLS.FATDEPTH_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.FATDEPTH_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="fatdepth" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'pH',
                            hintText: strings.CONTROLS.PH_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.PH_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="pH" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'lointemperature',
                            hintText: strings.CONTROLS.LOINTEMPERATURE_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LOINTEMPERATURE_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="lointemperature" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'cost',
                            hintText: strings.CONTROLS.COST_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.COST_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="cost" />
                    </div>
                    <div className="col-md-12">
                        <div className="col-md-5 mt5 row"><span>{strings.CONTROLS.ISMILKFEDVEALER_TEXT}</span></div>
                        <div className="col-md-7">     
                            <RadioButton inputGroupProps={{ name: 'ismilkfedvealer', defaultSelected: '' }}
                                dataSource={[{ Value: 1, Text: 'Yes' },
                                { Value: 0, Text: 'No' }]}
                                textField="Text" valueField="Value" horizontalAlign={true}
                                isClicked={this.props.isClicked} ref="ismilkfedvealer" />
                        </div>                    
                    </div>
                    <div className="col-md-12">
                        <div className="col-md-5 mt5 row"><span>{strings.CONTROLS.ISRINSE_TEXT}</span></div>
                        <div className="col-md-7">     
                           <RadioButton inputGroupProps={{ name: 'isrinse', defaultSelected: '' }}
                            dataSource={[{ Value: 1, Text: 'Yes' },
                            { Value: 0, Text: 'No' }]}
                            textField="Text" valueField="Value" horizontalAlign={true}
                            isClicked={this.props.isClicked} ref="isrinse" />
                        </div>                        
                       
                    </div>
                    <div className="col-md-12">
                        <div className="col-md-5 mt5 row"><span>{strings.CONTROLS.ISRIB_TEXT}</span></div>
                        <div className="col-md-7">     
                            <RadioButton inputGroupProps={{ name: 'isrib', defaultSelected: '' }}
                            dataSource={[{ Value: 1, Text: 'Yes' },
                            { Value: 0, Text: 'No' }]}
                            textField="Text" valueField="Value" horizontalAlign={true}
                            isClicked={this.props.isClicked} ref="isrib" />
                        </div> 
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'retailproductyield',
                            hintText: strings.CONTROLS.RETAILPRODUCTYIELD_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.RETAILPRODUCTYIELD_LABEL
                        }}
                            maxLength={10} initialValue='' numberType='decimal'
                            isClicked={this.props.isClicked} ref="retailproductyield" />
                    </div>
                    <div className="col-md-12">
                        <div className="col-md-5 mt5 row"><span>{strings.CONTROLS.ISGRASSSEED_TEXT}</span></div>
                        <div className="col-md-7">     
                            <RadioButton inputGroupProps={{ name: 'isgrassseed', defaultSelected: '' }}
                            dataSource={[{ Value: 1, Text: 'Yes' },
                            { Value: 0, Text: 'No' }]}
                            textField="Text" valueField="Value" horizontalAlign={true}
                            isClicked={this.props.isClicked} ref="isgrassseed" />
                        </div>
                    </div>
                    <div className="col-md-12">
                         <div className="col-md-5 mt5 row"><span>{strings.CONTROLS.ISARTHRITIS_TEXT}</span></div>
                        <div className="col-md-7">     
                            <RadioButton inputGroupProps={{ name: 'isarthritis', defaultSelected: '' }}
                            dataSource={[{ Value: 1, Text: 'Yes' },
                            { Value: 0, Text: 'No' }]}
                            textField="Text" valueField="Value" horizontalAlign={true}
                            isClicked={this.props.isClicked} ref="isarthritis" />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <GPS_Coordinate strings={{
                            hintText: strings.CONTROLS.GPS_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.GPS_LABEL, COMMON: this.strings.COMMON
                        }}
                            eReq={strings.CONTROLS.GPS_REQ_MESSAGE}
                            isClicked={this.props.isClicked}
                            propertyId={this.props.topPIC.PropertyId} ref='gps'
                            initialCords={null} />
                    </div>
                </div>
            </div>
        );
    }
}

export default TabRecordCarcass;