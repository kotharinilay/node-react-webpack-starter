'use strict';

/**************************
 * sub tab for WHP records
 * **************************** */

import React, { Component } from 'react';
import { getAllChemicalProductActivity } from '../../../../../services/private/setup';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import NumberInput from '../../../../../lib/core-components/NumberInput';
import Grid from '../../../../../lib/core-components/Grid';
import Button from '../../../../../lib/core-components/Button';
import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../../common/actiontypes';
import { newUUID, bufferToUUID } from '../../../../../../shared/uuid';

class WHPTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.strings = this.props.strings;
        this.WHPSchema = ['chemicalproductactivity', 'species', 'numberOfDays'];
        this.WHPObj = {};

        this.state = {
            chemicalProductActivityData: [],
            addMode: false,
            isClicked: false,
            WHPData: [],
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'WHP Id' },
                { field: 'activityId', displayName: 'ActivityId' },
                { field: 'activityName', displayName: 'Product Activity', visible: true },
                { field: 'speciesId', displayName: 'SpeciesId' },
                { field: 'speciesName', displayName: 'Species', visible: true },
                { field: 'numberOfDays', displayName: 'No of Days', visible: true },
                { field: 'Id', displayName: 'Actions', visible: true, isSort: false, width: '100px', format: 'actionFormat' },
            ]
        }
        this.addWHP = this.addWHP.bind(this);
        this.onSpeciesChange = this.onSpeciesChange.bind(this);
        this.onActivityChange = this.onActivityChange.bind(this);
        this.deleteWHP = this.deleteWHP.bind(this);
        this.editWHP = this.editWHP.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        let objResponse = {};
        getAllChemicalProductActivity().then(function (res) {
            if (res.success) {
                objResponse.chemicalProductActivityData = res.data;
            }
        }).then(function (resPromise) {
            _this.stateSet({ chemicalProductActivityData: objResponse.chemicalProductActivityData });
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidMount() {
        if (this.props.chemicalProductWHP) {
            let gridData = [];
            this.props.chemicalProductWHP.map((whpObj) => {
                gridData.push({
                    Id: whpObj.Id,
                    activityId: bufferToUUID(whpObj.ActivityId.data),
                    activityName: whpObj.ActivityName,
                    speciesId: bufferToUUID(whpObj.SpeciesId.data),
                    speciesName: whpObj.SpeciesName,
                    numberOfDays: whpObj.NumberOfDays
                });
            });
            this.setState({
                WHPData: gridData
            })
        }
    }


    addWHP(e) {
        e.preventDefault();
        let isFormValid = isValidForm(this.WHPSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.setState({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        this.WHPObj.numberOfDays = this.refs.numberOfDays.fieldStatus.value;
        let gridData = this.state.WHPData
        if (this.WHPObj.Id) {
            let index = gridData.findIndex(x => x.Id == this.WHPObj.Id)
            if (index != -1)
                gridData.splice(index, 1);
        }
        this.WHPObj.Id = newUUID();

        gridData.push(this.WHPObj);
        this.stateSet({
            addMode: false,
            isClicked: false,
            WHPData: gridData
        });
        this.WHPObj = {};
    }

    onSpeciesChange(value, text) {
        this.WHPObj.speciesId = value;
        this.WHPObj.speciesName = text;
    }

    onActivityChange(value, text) {
        this.WHPObj.activityId = value;
        this.WHPObj.activityName = text;
    }

    editWHP(id) {
        this.WHPObj = this.state.WHPData.filter((WHP) => {
            return id == WHP.Id;
        })[0];
        this.setState({ addMode: true })
    }

    deleteWHP(id) {
        let gridData = this.state.WHPData.filter((WHP) => {
            return WHP.Id != id;
        });
        this.setState({ WHPData: gridData });
    }

    renderForm() {
        return (
            <form autoComplete="off" className="form-cover" onSubmit={this.addWHP}>
                <Dropdown inputProps={{
                    name: 'chemicalproductactivity',
                    hintText: this.strings.CONTROLS.WHP_ACTIVITY_PLACEHOLDER,
                    value: this.WHPObj.Id ? this.WHPObj.activityId : null
                }}
                    eReq={this.strings.CONTROLS.WHP_ACTIVITY_REQ_MESSAGE} onSelectionChange={this.onActivityChange}
                    textField="ActivityName" valueField="Id" dataSource={this.state.chemicalProductActivityData}
                    isClicked={this.state.isClicked} ref="chemicalproductactivity" />

                <Dropdown inputProps={{
                    name: 'species',
                    hintText: this.strings.CONTROLS.WHP_SPECIES_PLACEHOLDER,
                    value: this.WHPObj.Id ? this.WHPObj.speciesId : null
                }}
                    eReq={this.strings.CONTROLS.WHP_SPECIES_REQ_MESSAGE} onSelectionChange={this.onSpeciesChange}
                    textField="NameCode" valueField="Id" dataSource={this.props.speciesData}
                    isClicked={this.state.isClicked} ref="species" />

                <NumberInput inputProps={{
                    name: 'numberOfDays',
                    hintText: this.strings.CONTROLS.WHP_DAYS_PLACEHOLDER,
                    floatingLabelText: this.strings.CONTROLS.WHP_DAYS_LABEL
                }}
                    initialValue={this.WHPObj.Id ? this.WHPObj.numberOfDays.toString() : null}
                    maxLength={4} numberType="number"
                    eReq={this.strings.CONTROLS.WHP_DAYS_REQ_MESSAGE}
                    isClicked={this.state.isClicked} ref="numberOfDays" />

                <div className="mt15" style={{ textAlign: 'right' }}>
                    <Button inputProps={{
                        name: 'btnAddWHP',
                        label: this.strings.CONTROLS.SAVE_LABEL,
                        className: 'button2Style button30Style mr10',
                    }} onClick={this.addWHP}></Button>
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
                    <Grid ref="WHPGrid" columns={this.state.columns} isRemoteData={false} gridData={this.state.WHPData}
                        height="200px" selectRowMode="none" editClick={this.editWHP} deleteClick={this.deleteWHP} />
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

export default WHPTab;