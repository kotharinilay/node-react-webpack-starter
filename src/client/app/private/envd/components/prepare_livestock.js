'use strict';

/**************************
 * Prepare Livestock step for e-NVD
 * **************************** */

import React, { Component } from 'react';
import { SET_COMMON_DETAILS } from '../actiontypes';

import Dropdown from '../../../../lib/core-components/Dropdown';
import Input from './../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import RadioButton from '../../../../lib/core-components/RadioButton';
import PICAutoComplete from '../../../../lib/wrapper-components/PICAutoComplete';
import SuburbAutoComplete from '../../../../lib/wrapper-components/SuburbAutoComplete';
import Grid from '../../../../lib/core-components/Grid';

import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../../common/actiontypes';
import { getAllSpecies } from '../../../../services/private/setup';
import { getPrepareLivestockData } from '../../../../services/private/envd';
import { getPropertyByCondition } from '../../../../services/private/property';
import { bufferToUUID, newUUID } from '../../../../../shared/uuid';
import { speciesCodes, nvdTypes, MLASchemaVersions } from '../../../../../shared/constants';

class PrepareLivestock extends Component {
    constructor(props) {
        super(props);

        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.strings = { ...this.props.strings.PREPARE_LIVESTOCK, COMMON: this.props.strings.COMMON }
        this.notifyToaster = this.props.notifyToaster;

        this.livestockIds = [];
        this.prepareLivestockSchema = ['species', 'ownerOfLivestock', 'ownerPIC', 'journeyCommencedAddress',
            'numberOfEarTags', 'numberOfRumens', 'numberOfEIDs'];

        this.state = {
            species: [],
            speciesReady: false,
            ConsignedFromPIC: '',
            ownerPIC: '',
            ownerOfLivestock: '',
            journeyCommencedAddress: '',
            suburbId: null,
            countryId: null,
            summaryData: [],
            displayRadio: !this.props.initialDetail.isLivestockSelected ? true : false
        }
        if (this.props.initialDetail.isLivestockSelected || this.props.initialDetail.isModifyNVD) {
            this.summaryColums = [
                { field: 'SummaryId', displayName: 'SummaryId', visible: false, isKey: true },
                { field: 'LivestockId', displayName: 'LivestockId', visible: false },
                { field: 'SpeciesName', displayName: 'Species Name', visible: true, width: '150px' },
                { field: 'Mob', displayName: 'Mob', visible: true, width: '80px' },
                { field: 'NumberOfHead', displayName: 'Number of livestock', visible: true, width: '170px' },
                { field: 'Description', displayName: 'Description', visible: true, width: '150px' },
                { field: 'EarmarkText', displayName: 'Earmark Text', visible: true, width: '150px' },
                { field: 'BrandText', displayName: 'Brand Text', visible: true, width: '150px' },
                { field: 'MaturityId', displayName: 'MaturityId', visible: false },
                { field: 'GenderId', displayName: 'GenderId', visible: false },
                { field: 'BreedId', displayName: 'BreedId', visible: false },
            ];
            if (this.props.initialDetail.livestocks) {
                this.IsMobNVD = this.props.initialDetail.livestocks[0].IsMob;
                this.props.initialDetail.livestocks.forEach(function (element) {
                    this.livestockIds.push(element.Id);
                }, this);
            }
        }
        else {
            let mobFileds = ['mob', 'numberOfLivestock', 'livestockDescription', 'eatTag', 'brand'];
            this.prepareLivestockSchema = this.prepareLivestockSchema.concat(mobFileds);
            this.IsMobNVD = 1;
        }
        this.selectPIC = this.selectPIC.bind(this);
        this.onSpeciesChange = this.onSpeciesChange.bind(this);
        this.getData = this.getData.bind(this);
        this.onRadioChange = this.onRadioChange.bind(this);
        this.setNVDType = this.setNVDType.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        if (!this.props.initialDetail.isModifyNVD) {
            getPrepareLivestockData(this.props.initialDetail.propertyId, this.props.topPIC, this.livestockIds).then(function (res) {
                if (res.success) {
                    let propertyData = res.data.propertyData.length > 0 ? res.data.propertyData[0] : {};

                    if (propertyData.NLISUsername && propertyData.NLISPassword) {
                        _this.props.changeParentState({ nlisUserStatus: _this.strings.NLIS_UER_ENTERED });
                    } else {
                        _this.props.changeParentState({ nlisUserStatus: _this.strings.NLIS_UER_NOT_ENTERED });
                    }
                    _this.stateSet({
                        species: res.data.species, speciesReady: true,
                        ConsignedFromPIC: propertyData.PIC, ownerPIC: propertyData.PropertyName,
                        ownerOfLivestock: propertyData.PropertyName, journeyCommencedAddress: propertyData.Address || '',
                        suburbId: propertyData.SuburbId, countryId: bufferToUUID(propertyData.CountryId),
                        summaryData: res.data.livestockSummaryData ? res.data.livestockSummaryData : []
                    });
                    _this.ConsignedFromPIC = propertyData.PIC;
                    _this.ConsignedFromPICId = propertyData.PropertyId;
                    _this.PropertyManagerId = propertyData.PropertyManagerId;

                    if (_this.props.initialDetail.species && _this.props.initialDetail.species.Id) {
                        _this.selectedSpeices = res.data.species.filter((specy) => {
                            return specy.Id == _this.props.initialDetail.species.Id;
                        })[0];
                    }
                }
            }).catch(function (err) {
                _this.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            getAllSpecies().then(function (res) {
                if (res.success) {
                    if (_this.props.editData.nvdData.NLISUsername && _this.props.editData.nvdData.NLISPassword) {
                        _this.props.changeParentState({ nlisUserStatus: _this.strings.NLIS_UER_ENTERED });
                    } else {
                        _this.props.changeParentState({ nlisUserStatus: _this.strings.NLIS_UER_NOT_ENTERED });
                    }
                    _this.ConsignedFromPIC = _this.props.editData.nvdData.ConsignerPIC;
                    _this.ConsignedFromPICId = _this.props.editData.nvdData.ConsignerPropertyId ?
                        bufferToUUID(_this.props.editData.nvdData.ConsignerPropertyId) : null;
                    _this.PropertyManagerId = _this.props.editData.nvdData.PropertyManagerId ?
                        bufferToUUID(_this.props.editData.nvdData.PropertyManagerId) : null;
                    _this.selectedSpeices = res.data.filter((specy) => {
                        return specy.Id == _this.props.editData.nvdData.SpeciesId;
                    })[0];
                    _this.stateSet({
                        species: res.data, speciesReady: true,
                        ConsignedFromPIC: _this.props.editData.nvdData.ConsignerPIC,
                        ownerPIC: _this.props.editData.nvdData.ConsignerPICOwner,
                        ownerOfLivestock: _this.props.editData.nvdData.ConsignerPropertyName,
                        journeyCommencedAddress: _this.props.editData.nvdData.ConsignerPropertyAddress,
                        suburbId: _this.props.editData.nvdData.ConsignerPropertySuburbId,
                        countryId: bufferToUUID(_this.props.editData.nvdData.ConsignerCountryId),
                        summaryData: _this.props.editData.livestockSummaryData
                    });
                    _this.props.setNVDCommonDetail(SET_COMMON_DETAILS, { species: _this.selectedSpeices });
                }
            });
        }
    }

    // make scan on pic selected from PICAutoComplete component
    selectPIC(payload) {
        if (payload != null) {
            if (this.ConsignedFromPIC != payload.PIC && this.ConsignedFromPICId != payload.Id) {
                this.ConsignedFromPIC = payload.PIC;
                this.ConsignedFromPICId = payload.Id;
                if (this.ConsignedFromPICId) {
                    let where = ` p.UUID = '${this.ConsignedFromPICId}'`;
                    let select = `p.UUID AS PropertyId, p.PIC, p.Address, p.AuditLogId AS PropertyAuditId,
                      p.PropertyManagerId,  concat(con.FirstName, ' ', con.LastName) as Name, 
                      p.Name AS PropertyName, p.NLISUsername, p.NLISPassword, 
                      s.UUID AS SuburbId, s.Name AS SuburbName, c.BusinessCountryId AS CountryId`;
                    let joins = ` LEFT JOIN suburb s ON p.SuburbId = s.Id LEFT JOIN company c ON p.CompanyId = c.Id 
                                  LEFT JOIN contact con ON p.PropertyManagerId = con.Id `;
                    let _this = this;
                    getPropertyByCondition(select, joins, where).then(function (res) {
                        if (res.success) {
                            let propertyData = res.response[0];
                            if (propertyData.NLISUsername && propertyData.NLISPassword) {
                                _this.props.changeParentState({ nlisUserStatus: _this.strings.NLIS_UER_ENTERED });
                            } else {
                                _this.props.changeParentState({ nlisUserStatus: _this.strings.NLIS_UER_NOT_ENTERED });
                            }
                            _this.stateSet({
                                ConsignedFromPIC: propertyData.PIC, journeyCommencedAddress: propertyData.Address || '',
                                ownerPIC: propertyData.PropertyName,
                                ownerOfLivestock: propertyData.PropertyName,
                                suburbId: propertyData.SuburbId, countryId: bufferToUUID(propertyData.CountryId)
                            });
                            _this.PropertyManagerId = propertyData.PropertyManagerId;
                        }
                    }).catch(function (err) {
                        _this.notifyToaster(NOTIFY_ERROR);
                    });
                }
                else {
                    this.stateSet({
                        ConsignedFromPIC: this.ConsignedFromPIC, journeyCommencedAddress: '',
                        ownerPIC: '', ownerOfLivestock: '',
                        suburbId: null, countryId: bufferToUUID(this.props.authUser.CountryId)
                    });
                }
            }
        }
        else {
            this.ConsignedFromPIC = null;
            this.ConsignedFromPICId = null;
            this.stateSet({
                ConsignedFromPIC: '', journeyCommencedAddress: '',
                suburbId: null, countryId: bufferToUUID(this.props.authUser.CountryId),
                ownerPIC: '', ownerOfLivestock: ''
            });
        }
    }

    // handle change event of species drop down
    onSpeciesChange(value, text) {
        if (value) {
            this.selectedSpeices = this.state.species.filter((specy) => {
                return specy.Id == value;
            })[0];
            this.props.setNVDCommonDetail(SET_COMMON_DETAILS, { species: this.selectedSpeices });
            if (this.selectedSpeices && speciesCodes.Cattle == this.selectedSpeices.SystemCode)
                this.stateSet({ displayRadio: true });
            else
                this.stateSet({ displayRadio: false });

            if (this.selectedSpeices.SystemCode == speciesCodes.Cattle) {
                this.setNVDType(nvdTypes.Cattle);
            }
            else if (this.selectedSpeices.SystemCode == speciesCodes.Goat) {
                this.setNVDType(nvdTypes.Goat);
            }
            else if (this.selectedSpeices.SystemCode == speciesCodes.Sheep) {
                this.setNVDType(nvdTypes.Sheep);
            }
            else {
                this.setNVDType(null);
            }
        }
        else {
            this.selectedSpeices = {};
        }
    }

    onRadioChange(value, text) {
        this.setNVDType(value);
    }

    setNVDType(nvdType) {
        let nvdTypeName = Object.keys(nvdTypes).find(key => nvdTypes[key] === nvdType);
        let mlaSchemaVersion = MLASchemaVersions[nvdTypeName];
        this.props.changeParentState({ nvdType: nvdTypeName, mlaSchemaVersion: mlaSchemaVersion });
        this.props.setNVDCommonDetail(SET_COMMON_DETAILS, {
            nvdType: nvdType,
            nvdTypeName: nvdTypeName,
            mlaSchemaVersion: mlaSchemaVersion
        });
    }

    getData() {
        let isFormValid = isValidForm(this.prepareLivestockSchema, this.refs);
        if (!isFormValid || !this.ConsignedFromPICId) {
            this.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let prepareLivestockObj = getForm(this.prepareLivestockSchema, this.refs);
        prepareLivestockObj.cattleType = this.refs.type ? this.refs.type.fieldStatus.value : null;
        prepareLivestockObj.selectedSpeices = this.selectedSpeices;
        prepareLivestockObj.isNewMob = !this.props.initialDetail.isLivestockSelected;
        prepareLivestockObj.IsMobNVD = this.IsMobNVD;
        prepareLivestockObj.PropertyManagerId = this.PropertyManagerId ? bufferToUUID(this.PropertyManagerId) : null;
        let suburbData = { suburb: this.refs.suburb.state };
        let livestockSummaryData = {
            livestockSummaryData: this.refs.livestockSummaryGrid ?
                this.refs.livestockSummaryGrid.props.gridData : [{
                    SummaryId: newUUID(),
                    BrandText: prepareLivestockObj.brand,
                    BreedId: null,
                    Description: prepareLivestockObj.livestockDescription,
                    EarmarkText: prepareLivestockObj.eatTag,
                    GenderId: null,
                    IsMob: 1,
                    LivestockId: newUUID(),
                    MaturityId: null,
                    Mob: prepareLivestockObj.mob,
                    NumberOfHead: prepareLivestockObj.numberOfLivestock,
                    SpeciesId: prepareLivestockObj.species,
                    SpeciesName: prepareLivestockObj.selectedSpeices.SpeciesName
                }]
        };
        let consignedFromPIC = {
            ConsignedFromPIC: this.ConsignedFromPIC,
            ConsignedFromPICId: this.ConsignedFromPICId
        }
        Object.assign(prepareLivestockObj, suburbData, livestockSummaryData, consignedFromPIC);
        return prepareLivestockObj;
    }

    render() {
        let strings = this.strings.CONTROLS;
        return (
            <div className="row">
                <div className='col-md-6'>
                    <div className="row">
                        <div className='col-md-12'>
                            {this.state.displayRadio && !this.props.initialDetail.isModifyNVD ?
                                <RadioButton inputGroupProps={{ name: 'type', defaultSelected: null }}
                                    disabled={this.props.initialDetail.isLivestockSelected}
                                    dataSource={[{ Value: nvdTypes.EUCattle, Text: strings.EU_CATTLE_LABEL },
                                    { Value: nvdTypes['Bobby Calves'], Text: strings.BOBBY_CALVES_LABEL }]}
                                    textField="Text" valueField="Value" horizontalAlign={true}
                                    onChange={this.onRadioChange}
                                    isClicked={this.props.isClicked} ref="type" /> : null}
                        </div>
                        <div className='col-md-12'>
                            <Dropdown inputProps={{
                                name: 'species',
                                hintText: this.state.speciesReady ? strings.SPECIES_PLACEHOLDER : 'Loading...',
                                floatingLabelText: strings.SPECIES_LABEL,
                                value: this.props.initialDetail.species ? this.props.initialDetail.species.Id :
                                    this.props.editData.nvdData.SpeciesId,
                                disabled: this.props.initialDetail.isLivestockSelected || this.props.initialDetail.isModifyNVD
                            }}
                                eReq={strings.SPECIES_REQ_MESSAGE}
                                onSelectionChange={this.onSpeciesChange} callOnChange={true}
                                textField="NameCode" valueField="Id" dataSource={this.state.species}
                                isClicked={this.props.isClicked} ref="species" />
                        </div>
                        <div className="col-md-12">
                            <PICAutoComplete
                                inputProps={{
                                    hintText: strings.CONSIGNED_FROM_PIC_PLACEHOLDER,
                                    floatingLabelText: strings.CONSIGNED_FROM_PIC_LABEL,
                                    disabled: this.props.initialDetail.isLivestockSelected || this.props.initialDetail.isModifyNVD
                                }}
                                eReq={strings.CONSIGNED_FROM_PIC_REQ_MESSAGE}
                                isClicked={this.props.isClicked}
                                initialValue={this.state.ConsignedFromPIC}
                                targetKey="ConsignedFromPIC" showDetail={false}
                                findPIC={this.props.findPIC}
                                openFindPIC={this.props.openFindPIC}
                                selectPIC={this.selectPIC}
                                notifyToaster={this.notifyToaster} />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'ownerOfLivestock',
                                hintText: strings.OWNER_OF_LIVESTOCK_PLACEHOLDER,
                                floatingLabelText: strings.OWNER_OF_LIVESTOCK_LABEL
                            }}
                                maxLength={50} initialValue={this.state.ownerOfLivestock} updateOnChange={true}
                                isClicked={this.props.isClicked} ref="ownerOfLivestock" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'ownerPIC',
                                hintText: strings.OWNER_PIC_PLACEHOLDER,
                                floatingLabelText: strings.OWNER_PIC_LABEL
                            }}
                                maxLength={50} initialValue={this.state.ownerPIC} updateOnChange={true}
                                isClicked={this.props.isClicked} ref="ownerPIC" />
                        </div>
                        <div className="col-md-12">
                            <Input inputProps={{
                                name: 'journeyCommencedAddress',
                                hintText: strings.JOURNEY_COMMENCED_ADDRESS_PLACEHOLDER,
                                floatingLabelText: strings.JOURNEY_COMMENCED_ADDRESS_LABEL
                            }}
                                maxLength={200} initialValue={this.state.journeyCommencedAddress}
                                multiLine={true} updateOnChange={true}
                                isClicked={this.props.isClicked} ref="journeyCommencedAddress" />
                        </div>
                        <div className="col-md-12">
                            <SuburbAutoComplete suburbName='suburb' ref='suburb'
                                countryId={this.state.countryId} strings={this.strings.COMMON}
                                suburbSelectedValue={this.state.suburbId} fatchData={true}
                                isClicked={this.props.isClicked} />
                        </div>
                    </div>
                </div>
                <div className='col-md-6'>
                    <div className="row">
                        {this.props.initialDetail.isLivestockSelected || this.props.initialDetail.isModifyNVD ?
                            <div className="col-md-12">
                                <Grid ref="livestockSummaryGrid" columns={this.summaryColums} pagination={false}
                                    height="300px" isRemoteData={false} selectRowMode="none"
                                    gridData={this.state.summaryData} />
                            </div>
                            :
                            <div>
                                <div className="col-md-12">
                                    <Input inputProps={{
                                        name: 'mob',
                                        hintText: strings.MOB_PLACEHOLDER,
                                        floatingLabelText: strings.MOB_LABEL
                                    }}
                                        eReq={strings.MOB_REQ_MESSAGE}
                                        maxLength={50} initialValue=''
                                        isClicked={this.props.isClicked} ref="mob" />
                                </div>
                                <div className="col-md-12">
                                    <NumberInput inputProps={{
                                        name: 'numberOfLivestock',
                                        hintText: strings.NUMBER_OF_LIVESTOCK_PLACEHOLDER,
                                        floatingLabelText: strings.NUMBER_OF_LIVESTOCK_LABEL
                                    }}
                                        eReq={strings.NUMBER_OF_LIVESTOCK_REQ_MESSAGE}
                                        maxLength={5} initialValue=''
                                        isClicked={this.props.isClicked} ref="numberOfLivestock" />
                                </div>
                                <div className="col-md-12">
                                    <Input inputProps={{
                                        name: 'livestockDescription',
                                        hintText: strings.LIVESTOCK_DESCRIPTION_PLACEHOLDER,
                                        floatingLabelText: strings.LIVESTOCK_DESCRIPTION_LABEL
                                    }}
                                        maxLength={150} initialValue=''
                                        isClicked={this.props.isClicked} ref="livestockDescription" />
                                </div>
                                <div className="col-md-12">
                                    <Input inputProps={{
                                        name: 'eatTag',
                                        hintText: strings.EAR_TAG_PLACEHOLDER,
                                        floatingLabelText: strings.EAR_TAG_LABEL
                                    }}
                                        maxLength={50} initialValue=''
                                        isClicked={this.props.isClicked} ref="eatTag" />
                                </div>
                                <div className="col-md-12">
                                    <Input inputProps={{
                                        name: 'brand',
                                        hintText: strings.BRAND_PLACEHOLDER,
                                        floatingLabelText: strings.BRAND_LABEL
                                    }}
                                        maxLength={50} initialValue=''
                                        isClicked={this.props.isClicked} ref="brand" />
                                </div>
                            </div>
                        }
                        <div className="col-md-12">
                            <NumberInput inputProps={{
                                name: 'numberOfEarTags',
                                hintText: strings.NUMBER_OF_EARTAGS_PLACEHOLDER,
                                floatingLabelText: strings.NUMBER_OF_EARTAGS_LABEL
                            }}
                                maxLength={5} initialValue={this.props.editData.nvdData.NumberOfEarTags || ''}
                                isClicked={this.props.isClicked} ref="numberOfEarTags" />
                        </div>
                        <div className="col-md-12">
                            <NumberInput inputProps={{
                                name: 'numberOfRumens',
                                hintText: strings.NUMBER_OF_RUMENS_PLACEHOLDER,
                                floatingLabelText: strings.NUMBER_OF_RUMENS_LABEL
                            }}
                                maxLength={5} initialValue={this.props.editData.nvdData.NumberOfRumenDevices || ''}
                                isClicked={this.props.isClicked} ref="numberOfRumens" />
                        </div>
                        <div className="col-md-12">
                            <NumberInput inputProps={{
                                name: 'numberOfEIDs',
                                hintText: strings.NUMBER_OF_EIDS_PLACEHOLDER,
                                floatingLabelText: strings.NUMBER_OF_EIDS_LABEL
                            }}
                                maxLength={5} initialValue={this.props.editData.nvdData.NumberOfEID || ''}
                                isClicked={this.props.isClicked} ref="numberOfEIDs" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default PrepareLivestock;