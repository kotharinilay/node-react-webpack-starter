'use strict';

/**************************
 * tab component livestock primary attributes
 * **************************** */

import React, { Component } from 'react';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import Input from '../../../../../lib/core-components/Input';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import DateTimePicker from '../../../../../lib/core-components/DatetimePicker';
import AutoComplete from '../../../../../lib/core-components/AutoComplete';
import ToggleSwitch from '../../../../../lib/core-components/ToggleSwitch';
import LoadingIndicator from '../../../../../lib/core-components/LoadingIndicator';
import BreederComposition from '../../../../../lib/wrapper-components/BreederComposition/BreederComposition';
import GPS_Coordinate from '../../../../../lib/wrapper-components/GPSCoordiante/GPS_Coordinate';
import { Scrollbars } from '../../../../../../../assets/js/react-custom-scrollbars';
import {
    getLivestockPrimaryDDLData, getSireOrDam, getEnclosureByType,
    getLivestockFilterBySpecies
} from '../../../../../services/private/livestock';
import { getTagByEID } from '../../../../../services/private/tag';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';
import { bufferToUUID } from '../../../../../../shared/uuid';
import { EIDValidation, NLISValidation } from '../../../../../../shared/format/string';
import { livestockIdentifierCodes, livestockActivityStatusCodes } from '../../../../../../shared/constants';

class LivestockPrimaryTab extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.speciesId = null;
        this.livestocks = this.props.data.livestocks ? this.props.data.livestocks : {};
        this.livestock = {};
        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        if (this.props.type == '1') {
            this.livestocks.forEach(function (element) {
                if (element.Identifier == livestockIdentifierCodes.EID || element.Identifier == livestockIdentifierCodes.NLISID) {
                    this.speciesId = element.SpeciesId;
                }
            }, this);
        }

        this.state = {
            enclosureName: [],
            enclosureNameReady: false,
            geneticsire: [],
            geneticdam: [],
            foasterdam: [],
            receipientdam: [],
            species: [],
            speciesReady: false,
            speciesType: [],
            speciesTypeReady: false,
            breed: [],
            breedReady: false,
            breedType: [],
            breedTypeReady: false,
            maturity: [],
            maturityReady: false,
            sex: [],
            sexReady: false,
            category: [],
            categoryReady: false,
            colour: [],
            colourReady: false,
            livestockOrigin: [],
            livestockOriginReady: false,
            multisiregroup: [],
            multisiregroupReady: false,
            activityStatus: [],
            activityStatusReady: false,
            propertyData: {},
            propertyDataReady: true,
            renderBreedComposition: Math.random(),
            speciesId: this.speciesId
        }

        this.geneticsireId = null;
        this.geneticdamId = null;
        this.foasterdamId = null;
        this.receipientdamId = null;
        this.tagId = null;
        this.tagAuditId = null;

        this.primarySchema = ['species', 'speciestype',
            'livestockweight', 'birthweight', 'breedtype', 'dateofbirth', 'eartag',
            'maturity', 'drop', 'brand', 'sex', 'birthpic', 'livestockorigin', 'category', 'scandate', 'livestockoriginpic',
            'livestockoriginref', 'colour', 'inductiondate', 'multisiregroup', 'financierName', 'ppsr', 'financierOwned',
            'geneticsire', 'geneticdam', 'foasterdam', 'receipientdam', 'activitystatus'];

        this.onSpeciesChange = this.onSpeciesChange.bind(this);
        this.geneticSireChange = this.geneticSireChange.bind(this);
        this.geneticDamChange = this.geneticDamChange.bind(this);
        this.foasterDamChange = this.foasterDamChange.bind(this);
        this.receipientDamChange = this.receipientDamChange.bind(this);
        this.geneticSireBlur = this.geneticSireBlur.bind(this);
        this.geneticDamBlur = this.geneticDamBlur.bind(this);
        this.foasterDamBlur = this.foasterDamBlur.bind(this);
        this.receipientDamBlur = this.receipientDamBlur.bind(this);
        this.clearSireOrDam = this.clearSireOrDam.bind(this);
        this.setInitialValue = this.setInitialValue.bind(this);
        this.conflictValidate = this.conflictValidate.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;

        _this.setInitialValue();
        _this.props.updateConflictDS(_this.livestock);
        this.geneticsireId = this.livestock['livestockattribute.GeneticSireLivestockId'] || null;
        this.geneticdamId = this.livestock['livestockattribute.GeneticDamLivestockId'] || null;
        this.foasterdamId = this.livestock['livestockattribute.FosterDamLivestockId'] || null;
        this.receipientdamId = this.livestock['livestockattribute.RecipientDamLivestockId'] || null;
        if (this.livestock.SpeciesId != '-1') {
            //this.onSpeciesChange(bufferToUUID(this.livestock.SpeciesId));
            this.speciesId = bufferToUUID(this.livestock.SpeciesId);
        }
        getLivestockPrimaryDDLData(this.livestock.SpeciesId != '-1' ? bufferToUUID(this.livestock.SpeciesId) : null, this.props.topPIC).then(function (res) {
            if (res.success) {
                let objConflict = {
                    Id: '-1',
                    NameCode: 'Mixed Value'
                }
                if (_this.livestock.SpeciesId == '-1') res.data.species.push(objConflict);
                if (_this.livestock.BreedTypeId == '-1') res.data.breedType.push(objConflict);
                if (_this.livestock.GenderId == '-1') res.data.sex.push(objConflict);
                if (_this.livestock.LivestockCategoryId == '-1') res.data.category.push(objConflict);
                if (_this.livestock.ColorId == '-1') res.data.livestockColour.push(objConflict);
                if (_this.livestock.LivestockOriginId == '-1') res.data.livestockOrigin.push(objConflict);
                if (_this.livestock['livestockattribute.MultiSireGroup'] == '-1') res.data.multisiregroup.push(objConflict);
                if (_this.livestock.ActivityStatusId == '-1') res.data.activityStatus.push(objConflict);
                if (_this.livestock.SpeciesTypeId == '-1') res.data.speciesType.push(objConflict);
                if (_this.livestock.MaturityStatusId == '-1') res.data.maturity.push(objConflict);

                let newState = {
                    species: res.data.species,
                    speciesReady: true,
                    speciesType: res.data.speciesType,
                    speciesTypeReady: true,
                    breed: res.data.breed,
                    breedReady: true,
                    maturity: res.data.maturity,
                    maturityReady: true,
                    breedType: res.data.breedType,
                    breedTypeReady: true,
                    sex: res.data.sex,
                    sexReady: true,
                    category: res.data.category,
                    categoryReady: true,
                    colour: res.data.livestockColour,
                    colourReady: true,
                    livestockOrigin: res.data.livestockOrigin,
                    livestockOriginReady: true,
                    multisiregroup: res.data.multisiregroup,
                    multisiregroupReady: true,
                    propertyData: res.data.propertyData[0],
                    propertyDataReady: true,
                    enclosureNameReady: true,
                    activityStatus: res.data.activityStatus,
                    activityStatusReady: true
                };
                _this.stateSet(newState);
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    setInitialValue() {
        let keys = Object.keys(this.livestocks[0]);
        let matchLivestock = this.livestocks[0];
        let livestocks = this.livestocks;
        keys.forEach(function (key, i) {
            this.livestock[key] = matchLivestock[key];
            for (var index = 1; index < livestocks.length; index++) {
                if (livestocks[index][key] && typeof livestocks[index][key] == 'object') {
                    if (!matchLivestock[key] || bufferToUUID(matchLivestock[key]) != bufferToUUID(livestocks[index][key])) {
                        this.livestock[key] = '-1';
                        break;
                    }
                }
                else if (matchLivestock[key] != livestocks[index][key]) {
                    this.livestock[key] = '-1';
                    break;
                }
            }
        }, this);
    }

    // handle change event of species drop down
    onSpeciesChange(value, text) {
        this.speciesId = value;
        let _this = this;
        getLivestockFilterBySpecies(value, this.props.topPIC).then(function (res) {
            if (res.success) {
                _this.stateSet({
                    breed: res.data.breed,
                    maturity: res.data.maturity,
                    speciesType: res.data.speciesType,
                    renderBreedComposition: Math.random()
                });
                _this.refs.speciestype.setState({ value: null });
                _this.refs.maturity.setState({ value: null });
                _this.geneticsireId = null;
                _this.geneticdamId = null;
                _this.foasterdamId = null;
                _this.receipientdamId = null;
                _this.refs.geneticsire.setState({ value: '' });
                _this.refs.foasterdam.setState({ value: '' });
                _this.refs.geneticdam.setState({ value: '' });
                _this.refs.receipientdam.setState({ value: '' });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    getFormValues() {

        let breedComposition = this.refs.breedComposition.getData();
        // let isValid = isValidForm(this.primarySchema, this.refs);
        // if (!isValid || breedComposition.length < 1) {
        //     this.props.stateSet({ isClicked: true });
        //     this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
        //     return false;
        // }

        let primaryTabValues = getForm(this.primarySchema, this.refs);
        let inductionGPS = this.refs.inductionGPS.GPSValue;
        primaryTabValues.breedComposition = breedComposition;
        primaryTabValues.inductionGPS = inductionGPS;
        primaryTabValues.geneticsireId = this.geneticsireId;
        primaryTabValues.geneticdamId = this.geneticdamId;
        primaryTabValues.foasterdamId = this.foasterdamId;
        primaryTabValues.receipientdamId = this.receipientdamId;
        primaryTabValues.livestockId = this.livestock.UUID;
        primaryTabValues.livestockAuditId = this.livestock.AuditLogId
        if (this.livestock.CurrentWeight != primaryTabValues.livestockweight) {
            primaryTabValues.weightHistory = true;
        }
        if (primaryTabValues.enclosurename || this.livestock.CurrentEnclosureId) {
            let oldEnclosure = this.livestock.CurrentEnclosureId ? bufferToUUID(this.livestock.CurrentEnclosureId) : null;
            if (primaryTabValues.enclosurename != oldEnclosure) {
                primaryTabValues.enclosureHistory = true;
            }
        }
        if (primaryTabValues.activitystatus != '-1') {
            let selectedStatus = this.state.activityStatus.filter((status) => {
                return primaryTabValues.activitystatus == status.Id;
            })[0];
            if (this.livestock.ActivityStatusId == '-1') {
                if (selectedStatus.SystemCode == livestockActivityStatusCodes.InTransit ||
                    selectedStatus.SystemCode == livestockActivityStatusCodes.PrepareForMove) {
                    this.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_STATUS_MESSAGE });
                    return false;
                }
                primaryTabValues.prevActivityStatus = this.livestocks.map(function (element) {
                    return { livestockId: element.UUID, statusId: element.ActivityStatusId }
                });
                primaryTabValues.activityHistory = true;
            }
            else {
                if (primaryTabValues.activitystatus != bufferToUUID(this.livestock.ActivityStatusId)) {
                    let prevStatus = this.state.activityStatus.filter((status) => {
                        return bufferToUUID(this.livestock.ActivityStatusId) == status.Id;
                    })[0];
                    if ((selectedStatus.SystemCode == livestockActivityStatusCodes.InTransit ||
                        selectedStatus.SystemCode == livestockActivityStatusCodes.PrepareForMove) ||
                        (prevStatus.SystemCode == livestockActivityStatusCodes.InTransit ||
                            prevStatus.SystemCode == livestockActivityStatusCodes.PrepareForMove)) {
                        this.notifyToaster(NOTIFY_ERROR, { message: this.strings.INVALID_STATUS_MESSAGE });
                        return false;
                    }
                    primaryTabValues.prevActivityStatus = prevStatus.SystemCode;
                    primaryTabValues.activityHistory = true;
                }
            }
        }

        primaryTabValues.tagId = this.tagId;
        primaryTabValues.tagAuditId = this.tagAuditId;
        primaryTabValues.type = this.props.type;
        return primaryTabValues;
    }

    clearSireOrDam() {
        this.setState({
            geneticsire: [],
            geneticdam: [],
            foasterdam: [],
            receipientdam: []
        });
    }

    geneticSireChange(value) {
        let geneticsire = this.refs.geneticsire;
        this.geneticsireId = null;
        if (value == null || value.length == 0) {
            this.setState({ geneticsire: [] });
            geneticsire.updateInputStatus();
            return;
        }
        this.getSireOrDamData('sire', value, geneticsire, 'geneticsire', this);
    }

    geneticSireBlur() {
        let geneticsire = this.refs.geneticsire;
        geneticsire.updateInputStatus();
        this.clearSireOrDam();
    }

    geneticDamChange(value) {
        let geneticdam = this.refs.geneticdam;
        this.geneticdamId = null;
        if (value == null || value.length == 0) {
            this.setState({ geneticdam: [] });
            geneticdam.updateInputStatus();
            return;
        }
        this.getSireOrDamData('dam', value, geneticdam, 'geneticdam', this);
    }

    geneticDamBlur() {
        let geneticdam = this.refs.geneticdam;
        geneticdam.updateInputStatus();
        this.clearSireOrDam();
    }

    foasterDamChange(value) {
        let foasterdam = this.refs.foasterdam;
        this.foasterdamId = null;
        if (value == null || value.length == 0) {
            this.setState({ foasterdam: [] });
            foasterdam.updateInputStatus();
            return;
        }
        this.getSireOrDamData('dam', value, foasterdam, 'foasterdam', this);
    }

    foasterDamBlur() {
        let foasterdam = this.refs.foasterdam;
        foasterdam.updateInputStatus();
        this.clearSireOrDam();
    }

    receipientDamChange(value) {
        let receipientdam = this.refs.receipientdam;
        this.receipientdamId = null;
        if (value == null || value.length == 0) {
            this.setState({ receipientdam: [] });
            receipientdam.updateInputStatus();
            return;
        }
        this.getSireOrDamData('dam', value, receipientdam, 'receipientdam', this);
    }

    receipientDamBlur() {
        let receipientdam = this.refs.receipientdam;
        receipientdam.updateInputStatus();
        this.clearSireOrDam();
    }

    getSireOrDamData(type, searchValue, reference, dsName, _this) {
        getSireOrDam({ speciesId: this.speciesId, type: type, searchValue: searchValue }).then(function (response) {
            reference.updateInputStatus();
            let newState = {};
            if (response.success == true) {
                newState[dsName] = response.data;
            }
            else {
                newState[dsName] = [];
            }
            _this.setState(newState);
        });
    }

    renderDamOrSire(ds, referenceField) {
        if (ds.length > 0) {
            return (<Scrollbars autoHide autoHeight autoHeightMax={220}>
                <div className="table1">
                    <div className="row1">
                        <div className="header1">EId</div>
                        <div className="header1">NLISID</div>
                        <div className="header1">Visual Tag</div>
                        <div className="header1">Society Id</div>
                    </div>
                    {ds.map((item, index) => {
                        return <div key={index} className="row1" onMouseDown={this.selectSireOrDam.bind(this, referenceField, item)}>
                            <div className="cell1">{item.EID}</div>
                            <div className="cell1">{item.NLISID}</div>
                            <div className="cell1">{item.VisualTag}</div>
                            <div className="cell1">{item.SocietyId}</div>
                        </div>
                    })
                    }
                </div>
            </Scrollbars>
            );
        }
    }

    selectSireOrDam(referenceField, item) {
        this.refs[referenceField].updateInputStatus();
        this.refs[referenceField].setState({ value: item[item.Identifier] });
        this[`${referenceField}Id`] = item.UUID;
        // this.clearSireOrDam();
    }

    conflictValidate(value, label) {
        if (value == 'Mixed Value' || value == '-1' || (value && value._i == 'Mixed Value')) {
            return label + this.strings.CONFLICT_MESSAGE;
        }
    }

    render() {
        let strings = this.strings;
        return (
            <div>
                <div className="col-md-4">
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'species',
                            hintText: this.state.speciesReady ? strings.CONTROLS.SPECIES_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.SPECIES_LABEL,
                            value: this.livestock.SpeciesId ? this.livestock.SpeciesId == '-1' ? '-1' :
                                bufferToUUID(this.livestock.SpeciesId) : null,
                            disabled: this.state.speciesId ? true : false
                        }}
                            eReq={strings.CONTROLS.SPECIES_REQ_MESSAGE}
                            onSelectionChange={this.onSpeciesChange} callOnChange={true}
                            textField="NameCode" valueField="Id" dataSource={this.state.species}
                            isClicked={this.props.isClicked} ref="species" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'speciestype',
                            hintText: this.state.speciesTypeReady ? strings.CONTROLS.SPECIES_TYPE_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.SPECIES_TYPE_LABEL,
                            value: this.livestock.SpeciesTypeId ? this.livestock.SpeciesTypeId == '-1' ? '-1' : bufferToUUID(this.livestock.SpeciesTypeId) : null
                        }}
                            eClientValidation={this.conflictValidate}
                            textField="NameCode" valueField="Id" dataSource={this.state.speciesType}
                            ref="speciestype" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'breedtype',
                            hintText: this.state.breedTypeReady ? strings.CONTROLS.BREED_TYPE_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.BREED_TYPE_LABEL,
                            value: this.livestock.BreedTypeId ? this.livestock.BreedTypeId == '-1' ? '-1' : bufferToUUID(this.livestock.BreedTypeId) : null
                        }}
                            eClientValidation={this.conflictValidate}
                            textField="NameCode" valueField="Id" dataSource={this.state.breedType}
                            ref="breedtype" />
                    </div>
                    <div className="col-md-12" key={this.state.renderBreedComposition}>
                        <BreederComposition breedData={this.state.breed}
                            strings={{ COMMON: this.strings.COMMON }}
                            data={null} isReq={false}
                            ref='breedComposition' />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'maturity',
                            hintText: this.state.maturityReady ? strings.CONTROLS.MATURITY_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.MATURITY_LABEL,
                            value: this.livestock.MaturityStatusId ? this.livestock.MaturityStatusId == '-1' ? '-1' : bufferToUUID(this.livestock.MaturityStatusId) : null
                        }}
                            eClientValidation={this.conflictValidate}
                            textField="NameCode" valueField="Id" dataSource={this.state.maturity}
                            ref="maturity" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'sex',
                            hintText: this.state.sexReady ? strings.CONTROLS.SEX_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.SEX_LABEL,
                            value: this.livestock.GenderId ? this.livestock.GenderId == '-1' ? '-1' : bufferToUUID(this.livestock.GenderId) : null
                        }}
                            eClientValidation={this.conflictValidate}
                            textField="NameCode" valueField="Id" dataSource={this.state.sex}
                            ref="sex" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'birthpic',
                            hintText: strings.CONTROLS.BIRTHPIC_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.BIRTHPIC_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            maxLength={50} initialValue={this.livestock.BirthPIC ? this.livestock.BirthPIC == '-1' ? 'Mixed Value' : this.livestock.BirthPIC : this.props.topPIC.PIC}
                            hideStar={true} ref="birthpic" />
                    </div>
                    <div className="col-md-12">
                        <DateTimePicker inputProps={{
                            name: 'dateofbirth',
                            placeholder: strings.CONTROLS.DATEOFBIRTH_PLACEHOLDER,
                            label: strings.CONTROLS.DATEOFBIRTH_LABEL
                        }}
                            eReq={this.livestock.BirthDate == '-1' ?
                                strings.CONTROLS.DATEOFBIRTH_LABEL + strings.CONFLICT_MESSAGE : null}
                            defaultValue={this.livestock.BirthDate ? this.livestock.BirthDate == '-1' ? 'Mixed Value' :
                                new Date(this.livestock.BirthDate) : new Date()} timeFormat={false}
                            ref="dateofbirth" />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'drop',
                            hintText: strings.CONTROLS.DROP_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.DROP_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            initialValue={this.livestock['livestockattribute.Drop'] ? this.livestock['livestockattribute.Drop'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.Drop'] : ''}
                            hideStar={true} maxLength={10} numberType="decimal" ref="drop" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'birthweight',
                            hintText: strings.CONTROLS.BIRTH_WEIGHT_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.BIRTH_WEIGHT_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            maxLength={5} numberType="decimal"
                            initialValue={this.livestock.BirthWeight ? this.livestock.BirthWeight == '-1' ? 'Mixed Value' : this.livestock.BirthWeight : ''}
                            hideStar={true} ref="birthweight" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'livestockweight',
                            hintText: strings.CONTROLS.LIVESTOCK_WEIGHT_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LIVESTOCK_WEIGHT_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            maxLength={5} numberType="decimal"
                            initialValue={this.livestock.CurrentWeight ? this.livestock.CurrentWeight == '-1' ? 'Mixed Value' : this.livestock.CurrentWeight : ''}
                            hideStar={true} ref="livestockweight" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'geneticsire',
                            hintText: strings.CONTROLS.GENETIC_SIRE_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.GENETIC_SIRE_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            initialValue={this.livestock['livestockattribute.GeneticSireText'] ?
                                this.livestock['livestockattribute.GeneticSireText'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.GeneticSireText'] : ''}
                            onBlurInput={this.geneticSireBlur}
                            onChangeInput={this.geneticSireChange}
                            hideStar={true} ref="geneticsire" />

                        {this.renderDamOrSire(this.state.geneticsire, 'geneticsire')}
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'geneticdam',
                            hintText: strings.CONTROLS.GENETIC_DAM_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.GENETIC_DAM_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            initialValue={this.livestock['livestockattribute.GeneticDamText'] ?
                                this.livestock['livestockattribute.GeneticDamText'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.GeneticDamText'] : ''}
                            onBlurInput={this.geneticDamBlur}
                            onChangeInput={this.geneticDamChange}
                            hideStar={true} ref="geneticdam" />
                        {this.renderDamOrSire(this.state.geneticdam, 'geneticdam')}
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'foasterdam',
                            hintText: strings.CONTROLS.FOASTER_DAM_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.FOASTER_DAM_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            initialValue={this.livestock['livestockattribute.FosterDamText'] ?
                                this.livestock['livestockattribute.FosterDamText'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.FosterDamText'] : ''}
                            onBlurInput={this.foasterDamBlur}
                            onChangeInput={this.foasterDamChange}
                            hideStar={true} ref="foasterdam" />
                        {this.renderDamOrSire(this.state.foasterdam, 'foasterdam')}
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'receipientdam',
                            hintText: strings.CONTROLS.RECEIPIENT_DAM_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.RECEIPIENT_DAM_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            initialValue={this.livestock['livestockattribute.RecipientDamText'] ?
                                this.livestock['livestockattribute.RecipientDamText'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.RecipientDamText'] : ''}
                            onBlurInput={this.receipientDamBlur}
                            onChangeInput={this.receipientDamChange}
                            hideStar={true} ref="receipientdam" />
                        {this.renderDamOrSire(this.state.receipientdam, 'receipientdam')}
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'multisiregroup',
                            hintText: this.state.multisiregroupReady ? strings.CONTROLS.MULTISIREGROUP_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.MULTISIREGROUP_LABEL,
                            value: this.livestock['livestockattribute.MultiSireGroup'] ?
                                this.livestock['livestockattribute.MultiSireGroup'] == '-1' ? '-1' : bufferToUUID(this.livestock['livestockattribute.MultiSireGroup']) : null
                        }}
                            eClientValidation={this.conflictValidate}
                            textField="NameCode" valueField="Id" dataSource={this.state.multisiregroup}
                            ref="multisiregroup" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'colour',
                            hintText: this.state.colourReady ? strings.CONTROLS.COLOUR_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.COLOUR_LABEL,
                            value: this.livestock.ColorId ? this.livestock.ColorId == '-1' ? '-1' : bufferToUUID(this.livestock.ColorId) : null
                        }}
                            eClientValidation={this.conflictValidate}
                            textField="NameCode" valueField="Id" dataSource={this.state.colour}
                            ref="colour" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'category',
                            hintText: this.state.categoryReady ? strings.CONTROLS.CATEGORY_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.CATEGORY_LABEL,
                            value: this.livestock.LivestockCategoryId ?
                                this.livestock.LivestockCategoryId == '-1' ? '-1' : bufferToUUID(this.livestock.LivestockCategoryId) : null
                        }}
                            eClientValidation={this.conflictValidate}
                            textField="NameCode" valueField="Id" dataSource={this.state.category}
                            ref="category" />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'eartag',
                            hintText: strings.CONTROLS.EARTAG_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.EARTAG_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            maxLength={50} initialValue={this.livestock['livestockattribute.EarmarkText'] ?
                                this.livestock['livestockattribute.EarmarkText'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.EarmarkText'] : ''}
                            hideStar={true} ref="eartag" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'brand',
                            hintText: strings.CONTROLS.BRAND_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.BRAND_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            maxLength={50} initialValue={this.livestock['livestockattribute.BrandText'] ?
                                this.livestock['livestockattribute.BrandText'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.BrandText'] : ''}
                            hideStar={true} ref="brand" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'livestockorigin',
                            hintText: this.state.livestockOriginReady ? strings.CONTROLS.LIVESTOCK_ORIGIN_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.LIVESTOCK_ORIGIN_LABEL,
                            value: this.livestock.LivestockOriginId ? this.livestock.LivestockOriginId == '-1' ? '-1' : bufferToUUID(this.livestock.LivestockOriginId) : null
                        }}
                            eClientValidation={this.conflictValidate}
                            textField="NameCode" valueField="Id" dataSource={this.state.livestockOrigin}
                            ref="livestockorigin" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'livestockoriginpic',
                            hintText: strings.CONTROLS.LIVESTOCK_ORIGIN_PIC_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LIVESTOCK_ORIGIN_PIC_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            maxLength={50} initialValue={this.livestock['livestockattribute.LivestockOriginPIC'] ?
                                this.livestock['livestockattribute.LivestockOriginPIC'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.LivestockOriginPIC'] : ''}
                            hideStar={true} ref="livestockoriginpic" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'livestockoriginref',
                            hintText: strings.CONTROLS.LIVESTOCK_ORIGIN_REF_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LIVESTOCK_ORIGIN_REF_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            maxLength={50} initialValue={this.livestock['livestockattribute.LivestockOriginReference'] ?
                                this.livestock['livestockattribute.LivestockOriginReference'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.LivestockOriginReference'] : ''}
                            hideStar={true} ref="livestockoriginref" />
                    </div>
                    <div className="col-md-3">
                        <ToggleSwitch inputProps={{
                            label: this.strings.CONTROLS.PPSR_LABEL,
                            labelPosition: "right",
                            name: 'ppsr'
                        }}
                            initialValue={this.livestock['livestockattribute.IsPPSR'] == 1 ? true : false}
                            ref="ppsr" />
                    </div>
                    <div className="col-md-9">
                        <ToggleSwitch inputProps={{
                            label: this.strings.CONTROLS.FINANCIER_OWNED_LIVESTOCK_LABEL,
                            labelPosition: "right",
                            name: 'financierOwned'
                        }}
                            initialValue={this.livestock.IsFinancierOwned == 1 ? true : false}
                            ref="financierOwned" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'financierName',
                            hintText: strings.CONTROLS.FINANCIER_NAME_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.FINANCIER_NAME_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            maxLength={50} initialValue={this.livestock['livestockattribute.FinancierName'] ?
                                this.livestock['livestockattribute.FinancierName'] == '-1' ? 'Mixed Value' : this.livestock['livestockattribute.FinancierName'] : ''}
                            hideStar={true} ref="financierName" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'activitystatus',
                            hintText: this.state.activityStatusReady ? strings.CONTROLS.ACTIVITY_STATUS_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.ACTIVITY_STATUS_LABEL,
                            value: this.livestock.ActivityStatusId ? this.livestock.ActivityStatusId == '-1' ? '-1' : bufferToUUID(this.livestock.ActivityStatusId) : null
                        }}
                            eClientValidation={this.conflictValidate}
                            textField="NameCode" valueField="Id" dataSource={this.state.activityStatus}
                            ref="activitystatus" />
                    </div>
                    <div className="col-md-12">
                        <DateTimePicker inputProps={{
                            name: 'inductiondate',
                            placeholder: strings.CONTROLS.INDUCTIONDATE_PLACEHOLDER,
                            label: strings.CONTROLS.INDUCTIONDATE_LABEL,
                        }}
                            eClientValidation={this.conflictValidate}
                            defaultValue={this.livestock.InductionDate ?
                                this.livestock.InductionDate == '-1' ? 'Mixed Value' : new Date(this.livestock.InductionDate) : new Date()} timeFormat={false}
                            ref="inductiondate" />
                    </div>
                    <div className="col-md-12">
                        <DateTimePicker inputProps={{
                            name: 'scandate',
                            placeholder: strings.CONTROLS.SCANDATE_PLACEHOLDER,
                            label: strings.CONTROLS.SCANDATE_LABEL
                        }}
                            eClientValidation={this.conflictValidate}
                            defaultValue={this.livestock['livestockattribute.ScanDate'] ?
                                this.livestock['livestockattribute.ScanDate'] == '-1' ? 'Mixed Value' : new Date(this.livestock['livestockattribute.ScanDate']) : new Date()} timeFormat={false}
                            ref="scandate" />
                    </div>
                    <div className="col-md-12">
                        <GPS_Coordinate strings={{
                            hintText: strings.CONTROLS.INDUCTIONGPS_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.INDUCTIONGPS_LABEL, COMMON: this.strings.COMMON
                        }}
                            propertyId={this.props.topPIC.PropertyId} ref='inductionGPS'
                            initialCords={this.livestock.DefaultGPS ? this.livestock.DefaultGPS :
                                this.state.propertyData['DefaultGPS'] ? this.state.propertyData['DefaultGPS'] : null} />
                    </div>
                </div>
            </div>
        );
    }
}

export default LivestockPrimaryTab;