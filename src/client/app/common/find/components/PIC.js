'use strict';

/******************************************
 * Find PIC - Component
 * Find PIC from Aglive database. 
 ******************************************/

import React, { Component } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';
import { each as _each } from 'lodash';

import Input from '../../../../lib/core-components/Input';
import Dropdown from '../../../../lib/core-components/Dropdown';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import Grid from '../../../../lib/core-components/Grid';
import SuburbAutoComplete from '../../../../lib/wrapper-components/SuburbAutoComplete';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_ERROR } from '../../actiontypes';
import { getAllPropertyTypes } from '../../../../services/private/setup';
import { findPIC } from '../../../../services/private/find';

class FindPIC extends Component {

    constructor(props) {
        super(props);
        let { GRID_COLUMNS } = this.props.strings;

        this.state = {
            key: new Date(),
            isClicked: false,
            error: null,
            propertyTypeData: [],
            grid: {
                columns: [
                    { field: 'UUID', isKey: true, isSort: false, displayName: 'PropertyId', visible: false },
                    { field: 'UUID', displayName: GRID_COLUMNS.ACTION, visible: true, isSort: false, width: '80px', format: 'selectformat' },
                    { field: 'PIC', displayName: GRID_COLUMNS.PIC, isKey: false, visible: true },
                    { field: 'Name', displayName: GRID_COLUMNS.PROPERTY_NAME, isKey: false, visible: true },
                    { field: 'Suburb', displayName: GRID_COLUMNS.SUBURB, isKey: false, visible: true }
                ],
                gridData: []
            }
        }

        this.findPICSchema = ['propertyName', 'PIC', 'contactName', 'businessName', 'companyName', 'propertyTypeId'];
        this.hideModal = this.hideModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.search = this.search.bind(this);
        this.searchNlis = this.searchNlis.bind(this);
        this.reset = this.reset.bind(this);
        this.selectClick = this.selectClick.bind(this);
    }

    hideModal(payload) {

        if (payload == undefined)
            payload = null;
        this.props.hideFindPIC({ TargetKey: this.props.TargetKey, Payload: payload });
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillMount() {
        let _this = this;
        getAllPropertyTypes().then(function (response) {
            if (response.success) {
                _this.setState({ propertyTypeData: response.data });
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        this.reset();
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(e) {
        if (e.keyCode === 27) {
            this.hideModal();
            e.preventDefault();
        }
    }

    search(e) {
        e.preventDefault();
        let _this = this;
        let isFormValid = isValidForm(this.findPICSchema, this.refs);
        let obj = getForm(this.findPICSchema, this.refs);
        let suburb = this.refs.suburb.state;

        if (obj.propertyName == null && obj.PIC == null && obj.companyName == null && obj.businessName == null && obj.contactName == null && obj.propertyTypeId == null && (suburb == null || suburb.suburbId == null)) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.props.strings.CRITERIA_REQUIRED });
            return false;
        }

        obj.suburbId = suburb.suburbId;
        findPIC(obj).then(function (res) {
            if (res.success) {
                _each(res.data, function (i) {
                    let suburb = '';
                    if (i.SuburbName != null) {
                        suburb = i.SuburbName;
                    }
                    if (i.StateCode != null) {
                        suburb += suburb.length > 0 ? ", " + i.StateCode : i.StateCode;
                    }
                    if (i.PostCode != null) {
                        suburb += suburb.length > 0 ? ", " + i.PostCode : i.PostCode;
                    }
                    i.Suburb = suburb;
                });
                _this.setState({
                    grid: {
                        gridData: res.data
                    }
                });
            }
            else {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error });
                _this.setState({ grid: { gridData: [] } });
            }
        }).catch(function (data) {
            _this.setState({ grid: { gridData: [] } });
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    searchNlis(e) {
        e.preventDefault();
        this.props.notifyToaster(NOTIFY_ERROR, { message: "Not implemented yet !" });
    }

    reset() {
        this.setState({ grid: { gridData: [] }, key: new Date() });
    }

    selectClick(cell) {
        this.hideModal(cell);
    }

    render() {
        let { CONTROLS } = this.props.strings;

        return (
            <Modal isOpen={this.props.isOpen} keyboard={false} size="modal-lg">
                <ModalHeader>
                    <ModalClose onClick={this.hideModal} />
                    <h2>{this.props.strings.TITLE}</h2>
                </ModalHeader>
                <ModalBody>
                    <form autoComplete="off" className="form-cover" onSubmit={this.search}>
                        <div key={this.state.key} className="mb5">
                            <div className="row">
                                <div className="col-md-6">
                                    <Input inputProps={{
                                        name: 'propertyName',
                                        hintText: CONTROLS.PROPERTY_NAME_HINT_TEXT,
                                        floatingLabelText: CONTROLS.PROPERTY_NAME_FLOATING_TEXT
                                    }}
                                        maxLength={250} initialValue=''
                                        isClicked={this.state.isClicked} ref="propertyName" />
                                </div>
                                <div className="col-md-6">
                                    <Input inputProps={{
                                        name: 'PIC',
                                        hintText: CONTROLS.PIC_HINT_TEXT,
                                        floatingLabelText: CONTROLS.PIC_FLOATING_TEXT
                                    }}
                                        maxLength={10} initialValue=''
                                        isClicked={this.state.isClicked} ref="PIC" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <Dropdown inputProps={{
                                        name: 'propertyTypeId',
                                        hintText: CONTROLS.PROPERTY_TYPE_HINT_TEXT,
                                        value: null
                                    }}
                                        textField="NameCode" valueField="Id" dataSource={this.state.propertyTypeData}
                                        isClicked={this.state.isClicked} ref="propertyTypeId" />
                                </div>
                                <div className="col-md-6 dropdown-input">
                                    <Input inputProps={{
                                        name: 'contactName',
                                        hintText: CONTROLS.CONTACT_NAME_HINT_TEXT,
                                        floatingLabelText: CONTROLS.CONTACT_NAME_FLOATING_TEXT
                                    }}
                                        maxLength={100} initialValue=''
                                        isClicked={this.state.isClicked} ref="contactName" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'companyName',
                                                hintText: CONTROLS.COMPANY_NAME_HINT_TEXT,
                                                floatingLabelText: CONTROLS.COMPANY_NAME_FLOATING_TEXT
                                            }}
                                                maxLength={250} initialValue=''
                                                isClicked={this.state.isClicked} ref="companyName" />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'businessName',
                                                hintText: CONTROLS.BUSINESS_NAME_HINT_TEXT,
                                                floatingLabelText: CONTROLS.BUSINESS_NAME_FLOATING_TEXT
                                            }}
                                                maxLength={250} initialValue=''
                                                isClicked={this.state.isClicked} ref="businessName" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="row">
                                        <SuburbAutoComplete suburbName='suburb' componentClass='col-md-12'
                                            suburbHintText={CONTROLS.SUBURB_HINT_TEXT}
                                            suburbfloatingLabelText={CONTROLS.SUBURB_FLOATING_TEXT}
                                            stateHintText={CONTROLS.STATE_HINT_TEXT}
                                            statefloatingLabelText={CONTROLS.STATE_FLOATING_TEXT}
                                            postcodeHintText={CONTROLS.POSTCODE_HINT_TEXT}
                                            postcodefloatingLabelText={CONTROLS.POSTCODE_FLOATING_TEXT}
                                            ref="suburb"
                                            isClicked={this.state.isClicked}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="row mt10 text-center">
                                    <BusyButton
                                        inputProps={{
                                            name: 'btnSearch',
                                            label: CONTROLS.BTN_SEARCH_LABEL,
                                            className: 'button2Style button30Style mr10'
                                        }}
                                        loaderHeight={25}
                                        onClick={this.search} ></BusyButton>
                                    <BusyButton
                                        inputProps={{
                                            name: 'btnSearchNLIS',
                                            label: CONTROLS.BTN_SEARCH_NLIS_LABEL,
                                            className: 'button2Style button30Style mr10'
                                        }}
                                        loaderHeight={25}
                                        onClick={this.searchNlis} ></BusyButton>
                                    <Button
                                        inputProps={{
                                            name: 'btnReset',
                                            label: CONTROLS.BTN_RESET_LABEL,
                                            className: 'button1Style button30Style'
                                        }}
                                        onClick={this.reset}
                                    ></Button>
                                </div>
                            </div>
                            <div className="clear"></div>
                        </div>
                        <Grid ref="findPICGrid" isRemoteData={false} selectRowMode={null} {...this.state.grid} selectClick={this.selectClick} />
                    </form>

                </ModalBody>
                <ModalFooter>
                    <div className="search-btn-main">
                        <Button
                            inputProps={{
                                name: 'btnClose',
                                label: CONTROLS.BTN_CLOSE_LABEL,
                                className: 'button2Style button30Style'
                            }}
                            onClick={this.hideModal}></Button>
                    </div>
                </ModalFooter>
            </Modal>
        );
    }
}

export default FindPIC;