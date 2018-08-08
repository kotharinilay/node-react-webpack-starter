'use strict';

/**************************
 * tab component livestock other attributes
 * **************************** */

import React, { Component } from 'react';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import Input from '../../../../../lib/core-components/Input';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import ToggleSwitch from '../../../../../lib/core-components/ToggleSwitch';
import LoadingIndicator from '../../../../../lib/core-components/LoadingIndicator';

import { lastMonthOfShearing } from '../../../../../../shared/constants';
import { getLivestockSecondaryDDLData } from '../../../../../services/private/livestock';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';

class LivestockOtherTab extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.state = {
            dentition: [],
            dentitionReady: false,
            contemporaryGroup: [],
            contemporaryGroupReady: false,
            geneticStatus: [],
            geneticStatusReady: false,
            livestockGroup: [],
            livestockGroupReady: false,
            conditionScore: [],
            conditionScoreReady: false,
            classification: [],
            classificationReady: false,
            tagPlace: [],
            tagPlaceReady: false,
        }
        this.livestock = this.props.data.livestocks ? this.props.data.livestocks[0] : {};
        this.otherSchema = ['mgmtnumber', 'mgmtgroup', 'numberinbirth', 'dentition', 'birthproductivity',
            'numberreared', 'progeny', 'hgp', 'batchnumber', 'lastmonthofshearing', 'hgpdetail',
            'lastcomment', 'additionaltag', 'feedlottag', 'breedertag', 'studname', 'registrationdetail',
            'weighbridgeticket', 'referenceid', 'name', 'breederpic', 'breedercontact', 'breedercontactmobile',
            'contemporarygroup', 'geneticstatus', 'apprialsal', 'conditionscore', 'group', 'classification',
            'supplychain', 'freemartin', 'draftgroup', 'remindernote', 'reminderdate', 'breedercontactemail',
            'tagPlace'];

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;
        this.getFormValues = this.getFormValues.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getLivestockSecondaryDDLData(this.props.topPIC).then(function (res) {
            if (res.success) {
                _this.stateSet({
                    dentition: res.data.dentition,
                    dentitionReady: true,
                    contemporaryGroup: res.data.contemporaryGroup,
                    contemporaryGroupReady: true,
                    geneticStatus: res.data.geneticStatus,
                    geneticStatusReady: true,
                    livestockGroup: res.data.livestockGroup,
                    livestockGroupReady: true,
                    conditionScore: res.data.conditionScore,
                    conditionScoreReady: true,
                    classification: res.data.classification,
                    classificationReady: true,
                    tagPlace: res.data.tagPlace,
                    tagPlaceReady: true,
                })
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getFormValues() {
        let isValid = isValidForm(this.otherSchema, this.refs);
        if (!isValid) {
            this.props.stateSet({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let otherTabValues = getForm(this.otherSchema, this.refs);
        return otherTabValues;
    }

    render() {
        let strings = this.strings;
        return (
            <div>
                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'mgmtnumber',
                                hintText: this.strings.CONTROLS.MANAGEMENT_NUMBER_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.MANAGEMENT_NUMBER_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.ManagementNo'] ?
                                    this.livestock['livestockattribute.ManagementNo'] : ''}
                                isClicked={this.props.isClicked} ref="mgmtnumber" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'mgmtgroup',
                                hintText: this.strings.CONTROLS.MANAGEMENT_GROUP_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.MANAGEMENT_GROUP_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.ManagementGroup'] ?
                                    this.livestock['livestockattribute.ManagementGroup'] : ''}
                                isClicked={this.props.isClicked} ref="mgmtgroup" />
                        </div>
                        <div className="col-md-4">
                            <NumberInput inputProps={{
                                name: 'numberinbirth',
                                hintText: strings.CONTROLS.NUMBER_IN_BIRTH_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.NUMBER_IN_BIRTH_LABEL
                            }}
                                maxLength={5} initialValue={this.livestock['livestockattribute.NumberInBirth'] ?
                                    this.livestock['livestockattribute.NumberInBirth'] : ''}
                                isClicked={this.state.isClicked} ref="numberinbirth" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'dentition',
                                hintText: this.state.dentitionReady ? this.strings.CONTROLS.DENTITION_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.DENTITION_LABEL,
                                value: this.livestock['livestockattribute.DentitionId'] ?
                                    bufferToUUID(this.livestock['livestockattribute.DentitionId']) : null
                            }}
                                textField="NameCode" valueField="Id" dataSource={this.state.dentition}
                                isClicked={this.state.isClicked} ref="dentition" />
                        </div>
                        <div className="col-md-4">
                            <NumberInput inputProps={{
                                name: 'birthproductivity',
                                hintText: strings.CONTROLS.BIRTH_PRODUCTIVITY_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.BIRTH_PRODUCTIVITY_LABEL
                            }}
                                maxLength={5} initialValue={this.livestock['livestockattribute.BirthProductivity'] ?
                                    this.livestock['livestockattribute.BirthProductivity'] : ''}
                                isClicked={this.state.isClicked} ref="birthproductivity" />
                        </div>
                        <div className="col-md-4">
                            <NumberInput inputProps={{
                                name: 'numberreared',
                                hintText: strings.CONTROLS.NUMBER_REARED_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.NUMBER_REARED_LABEL
                            }}
                                maxLength={5} initialValue={this.livestock['livestockattribute.NumberInReared'] ?
                                    this.livestock['livestockattribute.NumberInReared'] : ''}
                                isClicked={this.state.isClicked} ref="numberreared" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <NumberInput inputProps={{
                                name: 'progeny',
                                hintText: strings.CONTROLS.PROGENY_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.PROGENY_LABEL
                            }}
                                maxLength={5} initialValue={this.livestock['livestockattribute.Progeny'] ?
                                    this.livestock['livestockattribute.Progeny'] : ''}
                                isClicked={this.state.isClicked} ref="progeny" />
                        </div>
                        <div className="col-md-4">
                            <ToggleSwitch inputProps={{
                                label: this.strings.CONTROLS.HGP_LABEL,
                                labelPosition: "right",
                                name: 'hgp',
                                disabled: this.isProfile
                            }}
                                initialValue={this.livestock['livestockattribute.IsHGP'] == 1 ? true : false}
                                isClicked={this.state.isClicked} ref="hgp" />
                        </div>
                        <div className="col-md-4">
                            <NumberInput inputProps={{
                                name: 'batchnumber',
                                hintText: strings.CONTROLS.BATCH_NUMBER_PLACEHOLDER,
                                floatingLabelText: strings.CONTROLS.BATCH_NUMBER_LABEL
                            }}
                                maxLength={5} initialValue={this.livestock['livestockattribute.EIDBatchNo'] ?
                                    this.livestock['livestockattribute.EIDBatchNo'] : ''}
                                isClicked={this.state.isClicked} ref="batchnumber" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'lastmonthofshearing',
                                hintText: this.strings.CONTROLS.LASTMONTH_OF_SHEARING_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.LASTMONTH_OF_SHEARING_LABEL,
                                value: this.livestock['livestockattribute.LastMonthOfShearing'] ?
                                    bufferToUUID(this.livestock['livestockattribute.LastMonthOfShearing']) : null
                            }}
                                textField="Text" valueField="Value" dataSource={lastMonthOfShearing}
                                isClicked={this.state.isClicked} ref="lastmonthofshearing" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'hgpdetail',
                                hintText: this.strings.CONTROLS.HGP_DETAIL_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.HGP_DETAIL_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.HGPText'] ?
                                    this.livestock['livestockattribute.HGPText'] : ''}
                                isClicked={this.props.isClicked} ref="hgpdetail" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'lastcomment',
                                hintText: this.strings.CONTROLS.LAST_COMMENT_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.LAST_COMMENT_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.LastComment'] ?
                                    this.livestock['livestockattribute.LastComment'] : ''}
                                isClicked={this.props.isClicked} ref="lastcomment" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'additionaltag',
                                hintText: this.strings.CONTROLS.ADDITIONAL_TAG_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.ADDITIONAL_TAG_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.AdditionalTag'] ?
                                    this.livestock['livestockattribute.AdditionalTag'] : ''}
                                isClicked={this.props.isClicked} ref="additionaltag" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'feedlottag',
                                hintText: this.strings.CONTROLS.FEEDLOT_TAG_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.FEEDLOT_TAG_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.FeedlotTag'] ?
                                    this.livestock['livestockattribute.FeedlotTag'] : ''}
                                isClicked={this.props.isClicked} ref="feedlottag" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'breedertag',
                                hintText: this.strings.CONTROLS.BREEDER_TAG_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BREEDER_TAG_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.BreederTag'] ?
                                    this.livestock['livestockattribute.BreederTag'] : ''}
                                isClicked={this.props.isClicked} ref="breedertag" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'studname',
                                hintText: this.strings.CONTROLS.STUD_NAME_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.STUD_NAME_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.StudName'] ?
                                    this.livestock['livestockattribute.StudName'] : ''}
                                isClicked={this.props.isClicked} ref="studname" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'registrationdetail',
                                hintText: this.strings.CONTROLS.REGISTRATION_DETAIL_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.REGISTRATION_DETAIL_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.RegistrationDetail'] ?
                                    this.livestock['livestockattribute.RegistrationDetail'] : ''}
                                isClicked={this.props.isClicked} ref="registrationdetail" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'weighbridgeticket',
                                hintText: this.strings.CONTROLS.WEIGHBRIDGE_TICKET_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.WEIGHBRIDGE_TICKET_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.WeighBridgeTicket'] ?
                                    this.livestock['livestockattribute.WeighBridgeTicket'] : ''}
                                isClicked={this.props.isClicked} ref="weighbridgeticket" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'referenceid',
                                hintText: this.strings.CONTROLS.REFERENCE_ID_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.REFERENCE_ID_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.ReferenceId'] ?
                                    this.livestock['livestockattribute.ReferenceId'] : ''}
                                isClicked={this.props.isClicked} ref="referenceid" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'name',
                                hintText: this.strings.CONTROLS.NAME_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.NAME_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.Name'] ?
                                    this.livestock['livestockattribute.Name'] : ''}
                                isClicked={this.props.isClicked} ref="name" />
                        </div>
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'contemporarygroup',
                                hintText: this.state.contemporaryGroupReady ? this.strings.CONTROLS.CONTEMPORARY_GROUP_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.CONTEMPORARY_GROUP_LABEL,
                                value: this.livestock['livestockattribute.ContemporaryId'] ?
                                    bufferToUUID(this.livestock['livestockattribute.ContemporaryId']) : null
                            }}
                                textField="NameCode" valueField="Id" dataSource={this.state.contemporaryGroup}
                                isClicked={this.state.isClicked} ref="contemporarygroup" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'geneticstatus',
                                hintText: this.state.geneticStatusReady ? this.strings.CONTROLS.GENETIC_STATUS_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.GENETIC_STATUS_LABEL,
                                value: this.livestock['livestockattribute.GeneticStatusId'] ?
                                    bufferToUUID(this.livestock['livestockattribute.GeneticStatusId']) : null
                            }}
                                textField="NameCode" valueField="Id" dataSource={this.state.geneticStatus}
                                isClicked={this.state.isClicked} ref="geneticstatus" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'apprialsal',
                                hintText: this.strings.CONTROLS.APPRIALSAL_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.APPRIALSAL_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.Appraisal'] ?
                                    this.livestock['livestockattribute.Appraisal'] : ''}
                                isClicked={this.props.isClicked} ref="apprialsal" />
                        </div>
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'conditionscore',
                                hintText: this.state.conditionScoreReady ? this.strings.CONTROLS.CONDITION_SCORE_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.CONDITION_SCORE_LABEL,
                                value: this.livestock['livestockattribute.ConditionScoreId'] ?
                                    bufferToUUID(this.livestock['livestockattribute.ConditionScoreId']) : null
                            }}
                                textField="NameCode" valueField="Id" dataSource={this.state.conditionScore}
                                isClicked={this.state.isClicked} ref="conditionscore" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'group',
                                hintText: this.state.livestockGroupReady ? this.strings.CONTROLS.GROUP_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.GROUP_LABEL,
                                value: this.livestock['livestockattribute.LivestockGroupId'] ?
                                    bufferToUUID(this.livestock['livestockattribute.LivestockGroupId']) : null
                            }}
                                textField="NameCode" valueField="Id" dataSource={this.state.livestockGroup}
                                isClicked={this.state.isClicked} ref="group" />
                        </div>
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'classification',
                                hintText: this.state.classificationReady ? this.strings.CONTROLS.CLASSIFICATION_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.CLASSIFICATION_LABEL,
                                value: this.livestock['livestockattribute.ClassificationId'] ?
                                    bufferToUUID(this.livestock['livestockattribute.ClassificationId']) : null
                            }}
                                textField="NameCode" valueField="Id" dataSource={this.state.classification}
                                isClicked={this.state.isClicked} ref="classification" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'supplychain',
                                hintText: this.strings.CONTROLS.SUPPLY_CHAIN_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.SUPPLY_CHAIN_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.SupplyChain'] ?
                                    this.livestock['livestockattribute.SupplyChain'] : ''}
                                isClicked={this.props.isClicked} ref="supplychain" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <ToggleSwitch inputProps={{
                                label: this.strings.CONTROLS.FREEMARTIN_LABEL,
                                labelPosition: "right",
                                name: 'freemartin',
                                disabled: this.isProfile
                            }}
                                initialValue={this.livestock['livestockattribute.IsFreeMartin' == 1 ? true : false]}
                                isClicked={this.state.isClicked} ref="freemartin" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'draftgroup',
                                hintText: this.strings.CONTROLS.DRAFT_GROUP_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.DRAFT_GROUP_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.DraftGroup'] ?
                                    this.livestock['livestockattribute.DraftGroup'] : ''}
                                isClicked={this.props.isClicked} ref="draftgroup" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'breederpic',
                                hintText: this.strings.CONTROLS.BRREEDER_PIC_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BRREEDER_PIC_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.BreederPIC'] ?
                                    this.livestock['livestockattribute.BreederPIC'] : this.props.topPIC.PIC || ''}
                                isClicked={this.props.isClicked} ref="breederpic" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'breedercontact',
                                hintText: this.strings.CONTROLS.BREEDER_CONTACT_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BREEDER_CONTACT_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.BreederContact'] ?
                                    this.livestock['livestockattribute.BreederContact'] : ''}
                                isClicked={this.props.isClicked} ref="breedercontact" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'breedercontactmobile',
                                hintText: this.strings.CONTROLS.BREEDER_CONTACT_MOBILE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BREEDER_CONTACT_MOBILE_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.BreederContactMobile'] ?
                                    this.livestock['livestockattribute.BreederContactMobile'] : ''}
                                isClicked={this.props.isClicked} ref="breedercontactmobile" />
                        </div>
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'breedercontactemail',
                                hintText: this.strings.CONTROLS.BREEDER_CONTACT_EMAIL_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.BREEDER_CONTACT_EMAIL_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.BreederContactEmail'] ?
                                    this.livestock['livestockattribute.BreederContactEmail'] : ''}
                                isClicked={this.props.isClicked} ref="breedercontactemail" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <Input inputProps={{
                                name: 'remindernote',
                                hintText: this.strings.CONTROLS.REMINDER_NOTE_PLACEHOLDER,
                                floatingLabelText: this.strings.CONTROLS.REMINDER_NOTE_LABEL
                            }}
                                maxLength={50} initialValue={this.livestock['livestockattribute.ReminderNote'] ?
                                    this.livestock['livestockattribute.ReminderNote'] : ''}
                                isClicked={this.props.isClicked} ref="remindernote" />
                        </div>
                        <div className="col-md-4">
                            <DateTimePicker inputProps={{
                                name: 'reminderdate',
                                placeholder: this.strings.CONTROLS.REMINDER_DATE_PLACEHOLDER,
                                label: this.strings.CONTROLS.REMINDER_DATE_LABEL
                            }}
                                defaultValue={this.livestock['livestockattribute.ReminderDate'] ?
                                    this.livestock['livestockattribute.ReminderDate'] : new Date()} timeFormat={false}
                                isClicked={this.state.isClicked} ref="reminderdate" />
                        </div>
                        <div className="col-md-4">
                            <Dropdown inputProps={{
                                name: 'tagPlace',
                                hintText: this.state.tagPlaceReady ? this.strings.CONTROLS.TAG_PLACE_PLACEHOLDER : 'Loading...',
                                floatingLabelText: this.strings.CONTROLS.TAG_PLACE_LABEL,
                                value: this.livestock['livestockattribute.TagPlaceId'] ?
                                    bufferToUUID(this.livestock['livestockattribute.TagPlaceId']) : null
                            }}
                                textField="NameCode" valueField="Id" dataSource={this.state.tagPlace}
                                isClicked={this.state.isClicked} ref="tagPlace" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LivestockOtherTab;