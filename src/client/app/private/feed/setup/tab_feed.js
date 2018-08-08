'use strict';

/**************************
 * add/update tab for feed
 * **************************** */

import React, { Component } from 'react';

import Input from '../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import Button from '../../../../lib/core-components/Button';
import Grid from '../../../../lib/core-components/Grid';
import CompanyHierarchy from '../../../common/companyhierarchy/index';

import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';
import { newUUID } from '../../../../../shared/uuid';
import { digitDecimal } from '../../../../../shared/format/number';
import { checkDuplicateFeed } from '../../../../services/private/feed';

class FeedTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.strings = this.props.strings;
        this.feedTypeSchema = ['Name', 'Value'];
        this.objFeedType = {};
        this.updateFeedCompDB = false; // Use this flag for edit mode at server side
        this.state = {
            feedTypeData: [], // Store all feed composition data
            addMode: false, // Check mode for feed composition
            isClicked: false,
            columns: [
                { field: 'Id', isKey: true, isSort: false, displayName: 'Gender Id' },
                { field: 'Name', displayName: 'Composition Name', visible: true },
                { field: 'Value', displayName: 'Value (%)', format: 'percentageformat', visible: true },
                { field: 'Id', displayName: 'Actions', visible: true, isSort: false, width: '100px', format: 'actionFormat' }
            ]
        }
        this.addFeedType = this.addFeedType.bind(this);
        this.editFeedType = this.editFeedType.bind(this);
        this.deleteFeedType = this.deleteFeedType.bind(this);
        this.getValues = this.getValues.bind(this);
        this.blurFeedName = this.blurFeedName.bind(this);
        this.cancelClick = this.cancelClick.bind(this);
        this.addNewClick = this.addNewClick.bind(this);
        this.checkValue = this.checkValue.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    // Set data of feedComposition
    componentWillMount() {
        this.mounted = true;
        if (this.props.feedCompositionData.length > 0) {
            this.setState({ feedTypeData: this.props.feedCompositionData });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // Handle blur event of feedname input
    blurFeedName(value) {
        let tbFeedName = this.refs.feedName;
        let _this = this;
        return checkDuplicateFeed(value, this.props.detail == 'new' ? null : this.props.detail).then(function (res) {
            if (res.success) {
                if (res.isDuplicateFeedName)
                    tbFeedName.updateInputStatus(_this.strings.DUPLICATE_FEED_NAME);
                else
                    tbFeedName.updateInputStatus();
            }
            else if (res.badRequest) {
                tbFeedName.updateInputStatus();
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });;
    }

    // Add feed type to grid
    addFeedType(e) {
        e.preventDefault();
        this.updateFeedCompDB = true;

        let isFormValid = isValidForm(this.feedTypeSchema, this.refs);
        if (!isFormValid) {
            if (!this.state.isClicked)
                this.stateSet({ isClicked: true });
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }

        let gridData = this.state.feedTypeData

        // Edit mode of grid data (Feed composition)
        if (this.objFeedType.Id) {
            let index = gridData.findIndex(x => x.Id == this.objFeedType.Id)
            if (index != -1)
                gridData.splice(index, 1);
        }

        this.objFeedType = getForm(this.feedTypeSchema, this.refs);
        this.objFeedType.Value = digitDecimal(this.objFeedType.Value);
        this.objFeedType.Id = newUUID();

        gridData.push(this.objFeedType);
        this.stateSet({ addMode: false, isClicked: false, feedTypeData: gridData });
        this.objFeedType = {};
    }

    // Edit feed type from grid
    editFeedType(id) {
        this.objFeedType = this.state.feedTypeData.filter((f) => {
            return id == f.Id;
        })[0];
        this.stateSet({ addMode: true })
    }

    // Delete feed type from grid
    deleteFeedType(id) {
        this.updateFeedCompDB = true;
        let gridData = this.state.feedTypeData.filter((f) => {
            return f.Id != id;
        });
        this.stateSet({ feedTypeData: gridData });
    }

    // return tab values to add/edit
    getValues() {
        let isFormValid = isValidForm(['feedName'], this.refs);
        if (!isFormValid) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        let objHierarchy = this.refs.hierarchy.getValues();
        if (objHierarchy == false) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.strings.COMMON.MANDATORY_DETAILS });
            return false;
        }
        else {
            return {
                feed: {
                    Name: this.refs.feedName.fieldStatus.value,
                    CompanyId: objHierarchy.id,
                    PropertyId: objHierarchy.propertyId
                },
                feedComposition: this.state.feedTypeData,
                updateFeedCompDB: this.updateFeedCompDB
            };
        }
    }

    cancelClick() {
        this.setState({ addMode: false, isClicked: false });
        this.objFeedType = {};
    }

    addNewClick() {
        this.setState({ addMode: true })
    }

    checkValue(value) {
        if (parseFloat(value) > 100)
            return this.strings.CONTROLS.VALUE_EXCEEDED;
        else
            return null;
    }

    // Render feed type form for feed composition
    renderForm() {
        let { strings } = this.props;
        return (
            <form autoComplete="off" className="form-cover" onSubmit={this.addFeedType}>
                <Input inputProps={{
                    name: 'feedType',
                    hintText: strings.CONTROLS.TYPE_PLACEHOLDER,
                    floatingLabelText: strings.CONTROLS.TYPE_LABEL
                }}
                    maxLength={50} initialValue={this.objFeedType.Id ? this.objFeedType.Name : ''}
                    eReq={strings.CONTROLS.TYPE_REQ_MESSAGE}
                    isClicked={this.state.isClicked} ref="Name" />
                <NumberInput inputProps={{
                    name: 'feedValue',
                    hintText: strings.CONTROLS.VALUE_PLACEHOLDER,
                    floatingLabelText: strings.CONTROLS.VALUE_LABEL
                }}
                    maxLength={5} numberType="decimal"
                    eReq={strings.CONTROLS.VALUE_REQ_MESSAGE}
                    eClientValidation={this.checkValue}
                    initialValue={this.objFeedType.Id ? this.objFeedType.Value.toString() : null}
                    isClicked={this.state.isClicked} ref="Value" />

                <div className="mt15" style={{ textAlign: 'right' }}>
                    <Button
                        inputProps={{
                            name: 'btnAdd',
                            label: this.objFeedType.Id ? strings.CONTROLS.UPDATE_LABEL : strings.CONTROLS.ADD_LABEL,
                            type: 'submit',
                            className: 'button2Style button30Style mr10'
                        }}
                        onClick={this.addFeedType} ></Button>
                    <Button
                        inputProps={{
                            name: 'btnCancel',
                            label: strings.CONTROLS.BACK_LABEL,
                            className: 'button1Style button30Style'
                        }} onClick={this.cancelClick}></Button>
                </div>
            </form>
        );
    }

    // Render feed type for feed composition
    renderGrid() {
        let gridProps = {
            columns: this.state.columns,
            isRemoteData: false,
            gridData: this.state.feedTypeData,
            selectRowMode: "none",
            editClick: this.editFeedType,
            deleteClick: this.deleteFeedType
        }
        return (<Grid {...gridProps} />);
    }

    // Render component
    render() {
        let feedData = this.props.feedData;
        return (
            <div className="col-md-12">
                <Input inputProps={{
                    name: 'feedName',
                    hintText: this.strings.CONTROLS.NAME_PLACEHOLDER,
                    floatingLabelText: this.strings.CONTROLS.NAME_LABEL
                }}
                    onBlurInput={this.blurFeedName}
                    maxLength={50} initialValue={feedData ? feedData.Name : ''}
                    eReq={this.strings.CONTROLS.NAME_REQ_MESSAGE}
                    isClicked={this.props.isClicked} ref="feedName" />
                <CompanyHierarchy
                    inputProps={{
                        id: feedData ? feedData.CompanyId : null,
                        name: feedData ? feedData.Company : null,
                        type: feedData ? feedData.Type : null,
                        propertyId: feedData ? feedData.PropertyId : null,
                        property: feedData ? feedData.Property : null
                    }}
                    {...this.props.hierarchyProps}
                    isClicked={this.props.isClicked} strings={{ ...this.strings.COMMON }} ref="hierarchy" />

                <div className="inner-tab-header">
                    {this.strings.FEED_COMPOSITION_LABEL}
                    {!this.state.addMode ? <Button
                        inputProps={{
                            name: 'btnAddNew',
                            label: this.strings.CONTROLS.ADDNEW_LABEL,
                            className: 'button1Style button30Style',
                        }}
                        onClick={this.addNewClick}
                    ></Button> : null}
                </div>
                <div className="inner-tab">
                    {this.state.addMode ? this.renderForm() : this.renderGrid()}
                </div>
            </div>
        );
    }
}

export default FeedTab;