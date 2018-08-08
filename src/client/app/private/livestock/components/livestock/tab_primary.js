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
import { livestockIdentifierDS, livestockIdentifierCodes, livestockActivityStatusCodes } from '../../../../../../shared/constants';
import {
    getLivestockPrimaryDDLData, getSireOrDam, getEnclosureByType,
    getLivestockFilterBySpecies
} from '../../../../../services/private/livestock';
import { getTagByEID } from '../../../../../services/private/tag';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../../common/actiontypes';
import { bufferToUUID } from '../../../../../../shared/uuid';
import { EIDValidation, NLISValidation } from '../../../../../../shared/format/string';

class LivestockPrimaryTab extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.speciesId = null;
        this.livestock = this.props.data.livestocks ? this.props.data.livestocks[0] : {};
        this.breedComposition = this.props.data.breedComposition;
        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;
        if (this.props.detail == 'activate-tags' && this.props.selectedTags) {
            this.speciesId = this.props.selectedTags.SpeciesId;
        }
        if (this.props.subdetail == 'modify' && this.props.type == '1' &&
            (this.livestock.Identifier == livestockIdentifierCodes.EID || this.livestock.Identifier == livestockIdentifierCodes.NLISID)) {
            this.speciesId = bufferToUUID(this.livestock.SpeciesId);
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
            enclosureType: [],
            enclosureTypeReady: false,
            livestockOrigin: [],
            livestockOriginReady: false,
            multisiregroup: [],
            multisiregroupReady: false,
            activityStatus: [],
            activityStatusReady: false,
            propertyData: {},
            propertyDataReady: true,
            renderBreedComposition: new Date(),
            identifierField: null,
            speciesId: this.speciesId
        }

        this.geneticsireId = this.livestock['livestockattribute.GeneticSireLivestockId'] || null;
        this.geneticdamId = this.livestock['livestockattribute.GeneticDamLivestockId'] || null;
        this.foasterdamId = this.livestock['livestockattribute.FosterDamLivestockId'] || null;
        this.receipientdamId = this.livestock['livestockattribute.RecipientDamLivestockId'] || null;
        this.tagId = null;
        this.tagAuditId = null;

        this.primarySchema = ['species', 'mob', 'speciestype', 'livestockquantity',
            'enclosuretype', 'livestockweight', 'birthweight', 'enclosurename', 'breedtype', 'dateofbirth', 'eartag',
            'maturity', 'drop', 'brand', 'sex', 'birthpic', 'livestockorigin', 'category', 'scandate', 'livestockoriginpic',
            'livestockoriginref', 'colour', 'inductiondate', 'multisiregroup', 'financierName', 'ppsr', 'financierOwned',
            'geneticsire', 'geneticdam', 'foasterdam', 'receipientdam'];

        if (this.props.subdetail == 'modify') {
            this.primarySchema.push('activitystatus');
        }

        this.onSpeciesChange = this.onSpeciesChange.bind(this);
        this.onIdentifierChange = this.onIdentifierChange.bind(this);
        this.onEnclosureTypeChange = this.onEnclosureTypeChange.bind(this);
        this.geneticSireChange = this.geneticSireChange.bind(this);
        this.geneticDamChange = this.geneticDamChange.bind(this);
        this.foasterDamChange = this.foasterDamChange.bind(this);
        this.receipientDamChange = this.receipientDamChange.bind(this);
        this.geneticSireBlur = this.geneticSireBlur.bind(this);
        this.geneticDamBlur = this.geneticDamBlur.bind(this);
        this.foasterDamBlur = this.foasterDamBlur.bind(this);
        this.receipientDamBlur = this.receipientDamBlur.bind(this);
        this.clearSireOrDam = this.clearSireOrDam.bind(this);
        this.checkIdentifier = this.checkIdentifier.bind(this);
        this.validateIdentifier = this.validateIdentifier.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        if (this.livestock.SpeciesId) this.speciesId = bufferToUUID(this.livestock.SpeciesId);
        getLivestockPrimaryDDLData(this.speciesId, this.props.topPIC).then(function (res) {
            if (res.success) {
                let newState = {
                    species: res.data.species,
                    speciesReady: true,
                    speciesTypeReady: true,
                    breedReady: true,
                    maturityReady: true,
                    breedType: res.data.breedType,
                    breedTypeReady: true,
                    sex: res.data.sex,
                    sexReady: true,
                    category: res.data.category,
                    categoryReady: true,
                    colour: res.data.livestockColour,
                    colourReady: true,
                    enclosureType: res.data.enclosureType,
                    enclosureTypeReady: true,
                    livestockOrigin: res.data.livestockOrigin,
                    livestockOriginReady: true,
                    multisiregroup: res.data.multisiregroup,
                    multisiregroupReady: true,
                    propertyData: res.data.propertyData[0],
                    propertyDataReady: true,
                    enclosureNameReady: true,
                    activityStatus: res.data.activityStatus,
                    activityStatusReady: true,
                    identifierField: _this.props.subdetail == 'modify' ? _this.livestock.Identifier : res.data.propertyData[0]['LivestockIdentifier']
                };
                if (_this.speciesId) {
                    newState.speciesType = res.data.speciesType;
                    newState.breed = res.data.breed;
                    newState.maturity = res.data.maturity;
                }
                _this.stateSet(newState);
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // handle change event of enclosure type down
    onEnclosureTypeChange(value, text) {
        let _this = this;
        if (value)
            getEnclosureByType(_this.props.topPIC.PropertyId, value).then(function (res) {
                if (res.success) {
                    _this.stateSet({ enclosureName: res.data, enclosureNameReady: true });
                }
            })
    }

    // handle change event of species drop down
    onSpeciesChange(value, text) {
        this.speciesId = value;
        let _this = this;

        getLivestockFilterBySpecies(value, this.props.topPIC).then(function (res) {
            if (res.success) {
                _this.breedComposition = null;
                _this.livestock.SpeciesTypeId = null;
                _this.livestock.MaturityStatusId = null;
                _this.stateSet({
                    breed: res.data.breed,
                    maturity: res.data.maturity,
                    speciesType: res.data.speciesType,
                    renderBreedComposition: new Date()
                });

                // _this.refs.speciestype.setState({ value: null });
                // _this.refs.maturity.setState({ value: null });
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
    // handle change event of livestock identifier drop down
    onIdentifierChange(value, text) {
        this.tagId = null;
        this.tagAuditId = null;
        this.stateSet({ identifierField: value });
    }

    getFormValues() {
        let breedComposition = this.refs.breedComposition.getData();
        let isValid = isValidForm(this.primarySchema, this.refs);
        if (!isValid || breedComposition.length < 1) {
            this.props.stateSet({ isClicked: true });
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let primaryTabValues = getForm(this.primarySchema, this.refs);
        let inductionGPS = this.refs.inductionGPS.GPSValue;
        primaryTabValues.breedComposition = breedComposition;
        primaryTabValues.inductionGPS = inductionGPS;
        primaryTabValues.geneticsireId = this.geneticsireId;
        primaryTabValues.geneticdamId = this.geneticdamId;
        primaryTabValues.foasterdamId = this.foasterdamId;
        primaryTabValues.receipientdamId = this.receipientdamId;
        if (this.props.subdetail == 'modify') {
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
            if (primaryTabValues.activitystatus != bufferToUUID(this.livestock.ActivityStatusId)) {
                let selectedStatus = this.state.activityStatus.filter((status) => {
                    return primaryTabValues.activitystatus == status.Id;
                })[0];
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
            if (primaryTabValues.livestockquantity != this.livestock.NumberOfHead) {
                primaryTabValues.mobCountHistory = true;
                primaryTabValues.mobCountDifference = primaryTabValues.livestockquantity - this.livestock.NumberOfHead;
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
            return (<Scrollbars className="sire-dam-autocomplete" autoHide autoHeight autoHeightMax={220}>
                <div className="table1">
                    <div className="row1">
                        <div className="header1">EID</div>
                        <div className="header1">NLIS ID</div>
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
        //this.clearSireOrDam();
    }

    checkIdentifier(value) {
        let livestockIdentifier = this.refs.livestockidentifier.fieldStatus.value;
        let _this = this;
        if (livestockIdentifier == livestockIdentifierCodes.EID || livestockIdentifier == livestockIdentifierCodes.NLISID) {
            getTagByEID(livestockIdentifier, value).then(function (res) {
                if (res.success) {
                    _this.refs.identifier.updateInputStatus();
                    let speciesId = null;
                    if (res.data.length > 0) {
                        speciesId = bufferToUUID(res.data[0].SpeciesId);
                        _this.tagId = bufferToUUID(res.data[0].Id);
                        _this.tagAuditId = res.data[0].AuditLogId;
                    }
                    else {
                        _this.tagId = null;
                        _this.tagAuditId = null;
                        if (_this.refs.species.fieldStatus.dirty) _this.refs.species.setState({ value: null });
                    }
                    _this.onSpeciesChange(speciesId);
                    _this.stateSet({ speciesId: speciesId });
                }
            });
        }
        this.refs.identifier.updateInputStatus();
    }

    validateIdentifier(input) {
        if (this.state.identifierField == livestockIdentifierCodes['EID']) {
            if (!EIDValidation(input)) return this.strings.CONTROLS.INVALID_EID
        }
        else {
            if (!NLISValidation(input)) return this.strings.CONTROLS.INVALID_NLISID
        }
        return null;
    }

    render() {

        let strings = this.strings;
        if (this.props.type == '1') {
            this.primarySchema.indexOf('livestockidentifier') == -1 ? this.primarySchema.push('livestockidentifier') : null;
            this.primarySchema.indexOf('identifier') == -1 ? this.primarySchema.push('identifier') : null;
        } else {
            this.primarySchema.indexOf('livestockidentifier') != -1 ? this.primarySchema.splice(this.primarySchema.indexOf('livestockidentifier'), 1) : null;
            this.primarySchema.indexOf('identifier') != -1 ? this.primarySchema.splice(this.primarySchema.indexOf('identifier'), 1) : null;
        }
        return (
            <div>
                <div className="col-md-4">
                    {this.props.type == '1' ?
                        <div>
                            <div className="col-md-12">
                                <Dropdown inputProps={{
                                    name: 'livestockidentifier',
                                    hintText: strings.CONTROLS.LIVESTOCKIDENTIFIER_PLACEHOLDER,
                                    floatingLabelText: strings.CONTROLS.LIVESTOCKIDENTIFIER_LABEL,
                                    value: this.props.subdetail == 'modify' ? this.livestock.Identifier :
                                        (this.state.propertyData['LivestockIdentifier'] ? this.state.propertyData['LivestockIdentifier'] : null),
                                    disabled: this.props.subdetail == 'modify'
                                }}
                                    eReq={strings.CONTROLS.LIVESTOCKIDENTIFIER_REQ_MESSAGE}
                                    onSelectionChange={this.onIdentifierChange}
                                    textField="Text" valueField="Value" dataSource={livestockIdentifierDS}
                                    isClicked={this.props.isClicked} ref="livestockidentifier" />
                            </div>
                            <div className="col-md-12">
                                <Input inputProps={{
                                    name: 'identifier',
                                    hintText: strings.CONTROLS.IDENTIFIER_PLACEHOLDER + (this.state.identifierField == 'NLISID' ? 'NLIS ID' : this.state.identifierField),
                                    floatingLabelText: (this.state.identifierField == 'NLISID' ? 'NLIS ID' : this.state.identifierField),
                                    disabled: this.props.subdetail == 'modify'
                                }}
                                    eReq={strings.CONTROLS.IDENTIFIER_REQ_MESSAGE + (this.state.identifierField == 'NLISID' ? 'NLIS ID' : this.state.identifierField)}
                                    eClientValidation={this.state.identifierField == livestockIdentifierCodes['EID'] || this.state.identifierField == livestockIdentifierCodes['NLISID'] ? this.validateIdentifier : null}
                                    onBlurInput={this.checkIdentifier}
                                    maxLength={50} initialValue={this.livestock[this.livestock.Identifier] ? this.livestock[this.livestock.Identifier] : ''}
                                    isClicked={this.props.isClicked} ref="identifier" />
                            </div>
                        </div>
                        : null}
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'mob',
                            hintText: strings.CONTROLS.MOB_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.MOB_LABEL
                        }}
                            eReq={this.props.type == '2' ? strings.CONTROLS.MOB_REQ_MESSAGE : null}
                            maxLength={50} initialValue={this.livestock.Mob ? this.livestock.Mob : ''}
                            isClicked={this.props.isClicked} ref="mob" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'livestockquantity',
                            hintText: strings.CONTROLS.LIVESTOCKQUANTITY_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LIVESTOCKQUANTITY_LABEL,
                            disabled: this.props.type == '2' ? false : true
                        }}
                            eReq={this.props.type == '2' ? strings.CONTROLS.LIVESTOCKQUANTITY_REQ_MESSAGE : null}
                            maxLength={10} initialValue={this.livestock.NumberOfHead ? this.livestock.NumberOfHead : ''}
                            isClicked={this.props.isClicked} ref="livestockquantity" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'species',
                            hintText: this.state.speciesReady ? strings.CONTROLS.SPECIES_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.SPECIES_LABEL,
                            value: this.state.speciesId ? this.state.speciesId : this.livestock.SpeciesId ?
                                bufferToUUID(this.livestock.SpeciesId) : null,
                            disabled: this.state.speciesId ? true : false
                        }}
                            eReq={strings.CONTROLS.SPECIES_REQ_MESSAGE}
                            onSelectionChange={this.onSpeciesChange} callOnChange={true}
                            textField="NameCode" valueField="Id" dataSource={this.state.species}
                            isClicked={this.props.isClicked} ref="species" />
                    </div>
                    <div key={this.state.renderBreedComposition}>
                        <div className="col-md-12">
                            <Dropdown inputProps={{
                                name: 'speciestype',
                                hintText: this.state.speciesTypeReady ? strings.CONTROLS.SPECIES_TYPE_PLACEHOLDER : 'Loading...',
                                floatingLabelText: strings.CONTROLS.SPECIES_TYPE_LABEL,
                                value: this.livestock.SpeciesTypeId ? bufferToUUID(this.livestock.SpeciesTypeId) : null
                            }}
                                eReq={strings.CONTROLS.SPECIES_TYPE_REQ_MESSAGE}
                                textField="NameCode" valueField="Id" dataSource={this.state.speciesType}
                                isClicked={this.props.isClicked} ref="speciestype" />
                        </div>
                        <div className="col-md-12">
                            <BreederComposition breedData={this.state.breed}
                                strings={{ COMMON: this.strings.COMMON }}
                                data={this.breedComposition ? this.breedComposition : null}
                                isClicked={this.props.isClicked} ref='breedComposition' />
                        </div>
                        <div className="col-md-12">
                            <Dropdown inputProps={{
                                name: 'maturity',
                                hintText: this.state.maturityReady ? strings.CONTROLS.MATURITY_PLACEHOLDER : 'Loading...',
                                floatingLabelText: strings.CONTROLS.MATURITY_LABEL,
                                value: this.livestock.MaturityStatusId ? bufferToUUID(this.livestock.MaturityStatusId) : null
                            }}
                                eReq={strings.CONTROLS.MATURITY_REQ_MESSAGE}
                                textField="NameCode" valueField="Id" dataSource={this.state.maturity}
                                isClicked={this.props.isClicked} ref="maturity" />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'breedtype',
                            hintText: this.state.breedTypeReady ? strings.CONTROLS.BREED_TYPE_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.BREED_TYPE_LABEL,
                            value: this.livestock.BreedTypeId ? bufferToUUID(this.livestock.BreedTypeId) : null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.breedType}
                            isClicked={this.props.isClicked} ref="breedtype" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'sex',
                            hintText: this.state.sexReady ? strings.CONTROLS.SEX_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.SEX_LABEL,
                            value: this.livestock.GenderId ? bufferToUUID(this.livestock.GenderId) : null
                        }}
                            eReq={strings.CONTROLS.SEX_REQ_MESSAGE}
                            textField="NameCode" valueField="Id" dataSource={this.state.sex}
                            isClicked={this.props.isClicked} ref="sex" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'birthpic',
                            hintText: strings.CONTROLS.BIRTHPIC_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.BIRTHPIC_LABEL
                        }}
                            maxLength={50} initialValue={this.livestock.BirthPIC ? this.livestock.BirthPIC : this.props.topPIC.PIC}
                            isClicked={this.props.isClicked} ref="birthpic" />
                    </div>
                    <div className="col-md-12">
                        <DateTimePicker inputProps={{
                            name: 'dateofbirth',
                            placeholder: strings.CONTROLS.DATEOFBIRTH_PLACEHOLDER,
                            label: strings.CONTROLS.DATEOFBIRTH_LABEL
                        }}
                            defaultValue={this.livestock.BirthDate ? new Date(this.livestock.BirthDate) : new Date()} timeFormat={false}
                            isClicked={this.props.isClicked} ref="dateofbirth" />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'drop',
                            hintText: strings.CONTROLS.DROP_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.DROP_LABEL
                        }}
                            initialValue={this.livestock['livestockattribute.Drop'] ? this.livestock['livestockattribute.Drop'] : ''}
                            maxLength={10} numberType="decimal"
                            eReq={strings.CONTROLS.DROP_REQ_MESSAGE}
                            isClicked={this.props.isClicked} ref="drop" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'birthweight',
                            hintText: strings.CONTROLS.BIRTH_WEIGHT_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.BIRTH_WEIGHT_LABEL
                        }}
                            maxLength={5} numberType="decimal"
                            initialValue={this.livestock.BirthWeight ? this.livestock.BirthWeight : ''}
                            isClicked={this.props.isClicked} ref="birthweight" />
                    </div>
                    <div className="col-md-12">
                        <NumberInput inputProps={{
                            name: 'livestockweight',
                            hintText: strings.CONTROLS.LIVESTOCK_WEIGHT_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LIVESTOCK_WEIGHT_LABEL
                        }}
                            maxLength={5} numberType="decimal"
                            initialValue={this.livestock.CurrentWeight ? this.livestock.CurrentWeight : ''}
                            isClicked={this.props.isClicked} ref="livestockweight" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'geneticsire',
                            hintText: strings.CONTROLS.GENETIC_SIRE_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.GENETIC_SIRE_LABEL
                        }}
                            initialValue={this.livestock['livestockattribute.GeneticSireText'] ?
                                this.livestock['livestockattribute.GeneticSireText'] : ''}
                            onBlurInput={this.geneticSireBlur}
                            onChangeInput={this.geneticSireChange}
                            ref="geneticsire" />

                        {this.renderDamOrSire(this.state.geneticsire, 'geneticsire')}
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'geneticdam',
                            hintText: strings.CONTROLS.GENETIC_DAM_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.GENETIC_DAM_LABEL
                        }}
                            initialValue={this.livestock['livestockattribute.GeneticDamText'] ?
                                this.livestock['livestockattribute.GeneticDamText'] : ''}
                            onBlurInput={this.geneticDamBlur}
                            onChangeInput={this.geneticDamChange}
                            ref="geneticdam" />
                        {this.renderDamOrSire(this.state.geneticdam, 'geneticdam')}
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'foasterdam',
                            hintText: strings.CONTROLS.FOASTER_DAM_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.FOASTER_DAM_LABEL
                        }}
                            initialValue={this.livestock['livestockattribute.FosterDamText'] ?
                                this.livestock['livestockattribute.FosterDamText'] : ''}
                            onBlurInput={this.foasterDamBlur}
                            onChangeInput={this.foasterDamChange}
                            ref="foasterdam" />
                        {this.renderDamOrSire(this.state.foasterdam, 'foasterdam')}
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'receipientdam',
                            hintText: strings.CONTROLS.RECEIPIENT_DAM_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.RECEIPIENT_DAM_LABEL
                        }}
                            initialValue={this.livestock['livestockattribute.RecipientDamText'] ?
                                this.livestock['livestockattribute.RecipientDamText'] : ''}
                            onBlurInput={this.receipientDamBlur}
                            onChangeInput={this.receipientDamChange}
                            ref="receipientdam" />
                        {this.renderDamOrSire(this.state.receipientdam, 'receipientdam')}
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'multisiregroup',
                            hintText: this.state.multisiregroupReady ? strings.CONTROLS.MULTISIREGROUP_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.MULTISIREGROUP_LABEL,
                            value: this.livestock['livestockattribute.MultiSireGroup'] ?
                                bufferToUUID(this.livestock['livestockattribute.MultiSireGroup']) : null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.multisiregroup}
                            isClicked={this.props.isClicked} ref="multisiregroup" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'enclosuretype',
                            hintText: this.state.enclosureTypeReady ? strings.CONTROLS.ENCLOSURE_TYPE_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.ENCLOSURE_TYPE_LABEL,
                            value: this.livestock['enclosure.EnclosureTypeId'] ? bufferToUUID(this.livestock['enclosure.EnclosureTypeId']) : null
                        }}
                            onSelectionChange={this.onEnclosureTypeChange}
                            textField="NameCode" valueField="Id" dataSource={this.state.enclosureType}
                            isClicked={this.props.isClicked} ref="enclosuretype" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'enclosurename',
                            hintText: this.state.enclosureNameReady ? strings.CONTROLS.ENCLOSURE_NAME_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.ENCLOSURE_NAME_LABEL,
                            value: this.livestock.CurrentEnclosureId ? bufferToUUID(this.livestock.CurrentEnclosureId) : null
                        }}
                            textField="Name" valueField="Id" dataSource={this.state.enclosureName}
                            isClicked={this.props.isClicked} ref="enclosurename" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'colour',
                            hintText: this.state.colourReady ? strings.CONTROLS.COLOUR_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.COLOUR_LABEL,
                            value: this.livestock.ColorId ? bufferToUUID(this.livestock.ColorId) : null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.colour}
                            isClicked={this.props.isClicked} ref="colour" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'category',
                            hintText: this.state.categoryReady ? strings.CONTROLS.CATEGORY_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.CATEGORY_LABEL,
                            value: this.livestock.LivestockCategoryId ?
                                bufferToUUID(this.livestock.LivestockCategoryId) : null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.category}
                            isClicked={this.props.isClicked} ref="category" />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'eartag',
                            hintText: strings.CONTROLS.EARTAG_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.EARTAG_LABEL
                        }}
                            maxLength={50} initialValue={this.livestock['livestockattribute.EarmarkText'] ? this.livestock['livestockattribute.EarmarkText'] : ''}
                            isClicked={this.props.isClicked} ref="eartag" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'brand',
                            hintText: strings.CONTROLS.BRAND_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.BRAND_LABEL
                        }}
                            maxLength={50} initialValue={this.livestock['livestockattribute.BrandText'] ? this.livestock['livestockattribute.BrandText'] : ''}
                            isClicked={this.props.isClicked} ref="brand" />
                    </div>
                    <div className="col-md-12">
                        <Dropdown inputProps={{
                            name: 'livestockorigin',
                            hintText: this.state.livestockOriginReady ? strings.CONTROLS.LIVESTOCK_ORIGIN_PLACEHOLDER : 'Loading...',
                            floatingLabelText: strings.CONTROLS.LIVESTOCK_ORIGIN_LABEL,
                            value: this.livestock.LivestockOriginId ? bufferToUUID(this.livestock.LivestockOriginId) : null
                        }}
                            textField="NameCode" valueField="Id" dataSource={this.state.livestockOrigin}
                            isClicked={this.props.isClicked} ref="livestockorigin" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'livestockoriginpic',
                            hintText: strings.CONTROLS.LIVESTOCK_ORIGIN_PIC_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LIVESTOCK_ORIGIN_PIC_LABEL
                        }}
                            maxLength={50} initialValue={this.livestock['livestockattribute.LivestockOriginPIC'] ?
                                this.livestock['livestockattribute.LivestockOriginPIC'] : ''}
                            isClicked={this.props.isClicked} ref="livestockoriginpic" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'livestockoriginref',
                            hintText: strings.CONTROLS.LIVESTOCK_ORIGIN_REF_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.LIVESTOCK_ORIGIN_REF_LABEL
                        }}
                            maxLength={50} initialValue={this.livestock['livestockattribute.LivestockOriginReference'] ?
                                this.livestock['livestockattribute.LivestockOriginReference'] : ''}
                            isClicked={this.props.isClicked} ref="livestockoriginref" />
                    </div>
                    <div className="col-md-3">
                        <ToggleSwitch inputProps={{
                            label: this.strings.CONTROLS.PPSR_LABEL,
                            labelPosition: "right",
                            name: 'ppsr'
                        }}
                            initialValue={this.livestock['livestockattribute.IsPPSR'] == 1 ? true : false}
                            isClicked={this.props.isClicked} ref="ppsr" />
                    </div>
                    <div className="col-md-9">
                        <ToggleSwitch inputProps={{
                            label: this.strings.CONTROLS.FINANCIER_OWNED_LIVESTOCK_LABEL,
                            labelPosition: "right",
                            name: 'financierOwned'
                        }}
                            initialValue={this.livestock.IsFinancierOwned == 1 ? true : false}
                            isClicked={this.state.isClicked} ref="financierOwned" />
                    </div>
                    <div className="col-md-12">
                        <Input inputProps={{
                            name: 'financierName',
                            hintText: strings.CONTROLS.FINANCIER_NAME_PLACEHOLDER,
                            floatingLabelText: strings.CONTROLS.FINANCIER_NAME_LABEL
                        }}
                            maxLength={50} initialValue={this.livestock['livestockattribute.FinancierName'] ?
                                this.livestock['livestockattribute.FinancierName'] : ''}
                            isClicked={this.props.isClicked} ref="financierName" />
                    </div>
                    {this.props.subdetail == 'modify' ?
                        <div className="col-md-12">
                            <Dropdown inputProps={{
                                name: 'activitystatus',
                                hintText: this.state.activityStatusReady ? strings.CONTROLS.ACTIVITY_STATUS_PLACEHOLDER : 'Loading...',
                                floatingLabelText: strings.CONTROLS.ACTIVITY_STATUS_LABEL,
                                value: this.livestock.ActivityStatusId ? bufferToUUID(this.livestock.ActivityStatusId) : null
                            }}
                                eReq={strings.CONTROLS.ACTIVITY_STATUS_REQ_MESSAGE}
                                textField="NameCode" valueField="Id" dataSource={this.state.activityStatus}
                                isClicked={this.props.isClicked} ref="activitystatus" />
                        </div>
                        : null}
                    <div className="col-md-12">
                        <DateTimePicker inputProps={{
                            name: 'inductiondate',
                            placeholder: strings.CONTROLS.INDUCTIONDATE_PLACEHOLDER,
                            label: strings.CONTROLS.INDUCTIONDATE_LABEL,
                        }}
                            eReq={strings.CONTROLS.INDUCTIONDATE_REQ_MESSAGE}
                            defaultValue={this.livestock.InductionDate ?
                                new Date(this.livestock.InductionDate) : new Date()} timeFormat={false}
                            isClicked={this.props.isClicked} ref="inductiondate" />
                    </div>
                    <div className="col-md-12">
                        <DateTimePicker inputProps={{
                            name: 'scandate',
                            placeholder: strings.CONTROLS.SCANDATE_PLACEHOLDER,
                            label: strings.CONTROLS.SCANDATE_LABEL
                        }}
                            defaultValue={this.livestock['livestockattribute.ScanDate'] ?
                                new Date(this.livestock['livestockattribute.ScanDate']) : new Date()} timeFormat={false}
                            isClicked={this.props.isClicked} ref="scandate" />
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