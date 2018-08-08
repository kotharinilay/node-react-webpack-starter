'use strict';

/**************************
 * sub tab for ESI records
 * **************************** */

import React, { Component } from 'react';
import { getAllCountry } from '../../../../../services/private/setup';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import Grid from '../../../../../lib/core-components/Grid';
import Button from '../../../../../lib/core-components/Button';
import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../../common/actiontypes';
import { newUUID, bufferToUUID } from '../../../../../../shared/uuid';

class ESITab extends Component {
    constructor(props) {
        super(props);

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.strings = this.props.strings;
        this.ESISchema = ['country', 'species', 'numberOfDays'];
        this.ESIObj = {};

        this.state = {
            countryData: [],
            addMode: false,
            isClicked: false,
            dataFetch: false,
            ESIData: [],
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Gender Id' },
                { field: 'countryId', displayName: 'CountryId' },
                { field: 'countryName', displayName: 'Country', visible: true },
                { field: 'speciesId', displayName: 'SpeciesId' },
                { field: 'speciesName', displayName: 'Species', visible: true },
                { field: 'numberOfDays', displayName: 'No of Days', visible: true },
                { field: 'Id', displayName: 'Actions', visible: true, isSort: false, width: '100px', format: 'actionFormat' },
            ]
        }
        this.addESI = this.addESI.bind(this);
        this.onSpeciesChange = this.onSpeciesChange.bind(this);
        this.onCountryChange = this.onCountryChange.bind(this);
        this.deleteESI = this.deleteESI.bind(this);
        this.editESI = this.editESI.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        let objResponse = {};
        getAllCountry().then(function (res) {
            if (res.success) {
                objResponse.countryData = res.data;
            }
        }).then(function (resPromise) {
            _this.stateSet({ countryData: objResponse.countryData });
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        if (this.props.chemicalProductESI) {
            let gridData = [];
            this.props.chemicalProductESI.map((esiObj) => {
                gridData.push({
                    Id: esiObj.Id,
                    countryId: bufferToUUID(esiObj.CountryId.data),
                    countryName: esiObj.CountryName,
                    speciesId: bufferToUUID(esiObj.SpeciesId.data),
                    speciesName: esiObj.SpeciesName,
                    numberOfDays: esiObj.NumberOfDays
                });
            });
            this.stateSet({
                ESIData: gridData
            })
        }
    }


    addESI(e) {
        e.preventDefault();
        let isFormValid = isValidForm(this.ESISchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        this.ESIObj.numberOfDays = this.refs.numberOfDays.fieldStatus.value;
        let gridData = this.state.ESIData
        if (this.ESIObj.Id) {
            let index = gridData.findIndex(x => x.Id == this.ESIObj.Id)
            if (index != -1)
                gridData.splice(index, 1);
        }
        this.ESIObj.Id = newUUID();

        gridData.push(this.ESIObj);
        this.setState({
            addMode: false,
            isClicked: false,
            ESIData: gridData
        });
        this.ESIObj = {};
    }

    onSpeciesChange(value, text) {
        this.ESIObj.speciesId = value;
        this.ESIObj.speciesName = text;
    }

    onCountryChange(value, text) {
        this.ESIObj.countryId = value;
        this.ESIObj.countryName = text;
    }

    editESI(id) {
        this.ESIObj = this.state.ESIData.filter((ESI) => {
            return id == ESI.Id;
        })[0];
        this.setState({ addMode: true })
    }

    deleteESI(id) {
        let gridData = this.state.ESIData.filter((ESI) => {
            return ESI.Id != id;
        });
        this.setState({ ESIData: gridData });
    }

    renderForm() {
        return (
            <form autoComplete="off" className="form-cover" onSubmit={this.addESI}>

                <Dropdown inputProps={{
                    name: 'country',
                    hintText: this.strings.CONTROLS.ESI_COUNTRY_PLACEHOLDER,
                    value: this.ESIObj.Id ? this.ESIObj.countryId : null
                }}
                    eReq={this.strings.CONTROLS.ESI_COUNTRY_REQ_MESSAGE} onSelectionChange={this.onCountryChange}
                    textField="CountryName" valueField="Id" dataSource={this.state.countryData}
                    isClicked={this.state.isClicked} ref="country" />
                <Dropdown inputProps={{
                    name: 'species',
                    hintText: this.strings.CONTROLS.ESI_SPECIES_PLACEHOLDER,
                    value: this.ESIObj.Id ? this.ESIObj.speciesId : null
                }}
                    eReq={this.strings.CONTROLS.ESI_SPECIES_REQ_MESSAGE} onSelectionChange={this.onSpeciesChange}
                    textField="NameCode" valueField="Id" dataSource={this.props.speciesData}
                    isClicked={this.state.isClicked} ref="species" />

                <NumberInput inputProps={{
                    name: 'numberOfDays',
                    hintText: this.strings.CONTROLS.ESI_DAYS_PLACEHOLDER,
                    floatingLabelText: this.strings.CONTROLS.ESI_DAYS_LABEL,
                }}
                    initialValue={this.ESIObj.Id ? this.ESIObj.numberOfDays.toString() : null}
                    maxLength={4} numberType="number"
                    eReq={this.strings.CONTROLS.ESI_DAYS_REQ_MESSAGE}
                    isClicked={this.state.isClicked} ref="numberOfDays" />

                <div className="mt15" style={{ textAlign: 'right' }}>
                    <Button inputProps={{
                        name: 'btnAddESI',
                        label: this.strings.CONTROLS.SAVE_LABEL,
                        className: 'button2Style button30Style mr10',
                    }} onClick={this.addESI}></Button>
                    <Button inputProps={{
                        name: 'btnClear',
                        label: this.strings.CONTROLS.BACK_LABEL,
                        className: 'button1Style button30Style',
                    }} onClick={() => this.setState({ addMode: false })}></Button>
                </div>

            </form>
        );
    }

    renderGrid() {
        return (
            <div>
                <div className="l-stock-top-btn setup-top">
                    <ul>
                        <li>
                            <Button
                                inputProps={{
                                    name: 'btnAddNew',
                                    label: this.strings.CONTROLS.NEW_LABEL,
                                    className: 'button1Style button30Style',
                                }}
                                onClick={() => this.setState({ addMode: true })}
                            ></Button>
                        </li>
                    </ul>
                </div>
                <div className="clear"></div>
                <div className="mt5">
                    <Grid ref="ESIGrid" columns={this.state.columns} isRemoteData={false} gridData={this.state.ESIData}
                        height="200px" selectRowMode="none" editClick={this.editESI} deleteClick={this.deleteESI} />
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="col-md-12">
                {this.state.addMode ? this.renderForm() : this.renderGrid()}
            </div>
        );
    }
}

export default ESITab;