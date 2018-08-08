'use strict';

/******************************************
 * Find Company - Component
 * Find Company from Aglive database. 
 ******************************************/

import React, { Component } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from 'react-modal-bootstrap';
import { each as _each } from 'lodash';
import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import Dropdown from '../../../../lib/core-components/Dropdown';
import Grid from '../../../../lib/core-components/Grid';
import SuburbAutoComplete from '../../../../lib/wrapper-components/SuburbAutoComplete';
import { NOTIFY_ERROR } from '../../actiontypes';
import { getAllServiceTypes } from '../../../../services/private/setup';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { findCompany } from '../../../../services/private/find';

class FindCompany extends Component {

    constructor(props) {
        super(props);

        let { GRID_COLUMNS } = this.props.strings;

        this.state = {
            key: new Date(),
            isClicked: false,
            error: null,
            serviceTypeData: [],
            grid: {
                columns: [
                    { field: 'UUID', isKey: true, isSort: false, displayName: 'CompanyId', visible: false },
                    { field: 'UUID', displayName: GRID_COLUMNS.ACTION, visible: true, isSort: false, width: '80px', format: 'selectformat' },
                    { field: 'Name', displayName: GRID_COLUMNS.COMPANY_NAME, isKey: false, visible: true },
                    { field: 'ShortCode', displayName: GRID_COLUMNS.SHORT_CODE, isKey: false, visible: true },
                    { field: 'Suburb', displayName: GRID_COLUMNS.SUBURB, isKey: false, visible: true },
                    { field: 'Mobile', displayName: GRID_COLUMNS.MOBILE, isKey: false, visible: true },
                    { field: 'Email', displayName: GRID_COLUMNS.EMAIL, isKey: false, visible: true },
                ],
                gridData: []
            }
        }

        this.findCompanySchema = ['companyName', 'businessName', 'contactName', 'abn', 'acn', 'serviceTypeId'];
        this.hideModal = this.hideModal.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.search = this.search.bind(this);
        this.reset = this.reset.bind(this);
        this.selectClick = this.selectClick.bind(this);
    }

    hideModal(payload) {
        if (payload == undefined)
            payload = null;
        this.props.hideFindCompany({ TargetKey: this.props.TargetKey, Payload: payload });
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillMount() {
        let _this = this;
        getAllServiceTypes().then(function (response) {
            if (response.success) {
                _this.setState({ serviceTypeData: response.data });
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
        let isFormValid = isValidForm(this.findCompanySchema, this.refs);
        let obj = getForm(this.findCompanySchema, this.refs);
        let suburb = this.refs.businessSuburb.state;

        if (obj.companyName == null && obj.businessName == null && obj.contactName == null && obj.abn == null && obj.acn == null && obj.serviceTypeId == null && (suburb == null || suburb.suburbId == null)) {
            this.props.notifyToaster(NOTIFY_ERROR, { message: this.props.strings.CRITERIA_REQUIRED });
            return false;
        }

        obj.suburbId = suburb.suburbId;
        findCompany(obj).then(function (res) {
            if (res.success) {

                _each(res.data, function (i) {

                    let suburb = '';
                    if (i.BusinessSuburbName != null) {
                        suburb = i.BusinessSuburbName;
                    }
                    if (i.BusinessStateCode != null) {
                        suburb += suburb.length > 0 ? ", " + i.BusinessStateCode : i.BusinessStateCode;
                    }
                    if (i.BusinessPostCode != null) {
                        suburb += suburb.length > 0 ? ", " + i.BusinessPostCode : i.BusinessPostCode;
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
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.data });
                _this.setState({ grid: { gridData: [] } });
            }
        }).catch(function (err) {
            _this.setState({ grid: { gridData: [] } });
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
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
                                        name: 'companyName',
                                        hintText: CONTROLS.COMPANY_NAME_HINT_TEXT,
                                        floatingLabelText: CONTROLS.COMPANY_NAME_FLOATING_TEXT
                                    }}
                                        maxLength={250} initialValue=''
                                        isClicked={this.state.isClicked} ref="companyName" />
                                </div>
                                <div className="col-md-6">
                                    <Input inputProps={{
                                        name: 'businessName',
                                        hintText: CONTROLS.BUSINESS_NAME_HINT_TEXT,
                                        floatingLabelText: CONTROLS.BUSINESS_NAME_FLOATING_TEXT
                                    }}
                                        maxLength={250} initialValue=''
                                        isClicked={this.state.isClicked} ref="businessName" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'contactName',
                                                hintText: CONTROLS.CONTACT_NAME_HINT_TEXT,
                                                floatingLabelText: CONTROLS.CONTACT_NAME_FLOATING_TEXT
                                            }}
                                                maxLength={50} initialValue=''
                                                isClicked={this.state.isClicked} ref="contactName" />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <Dropdown inputProps={{
                                                name: 'serviceTypeId',
                                                hintText: CONTROLS.SERVICE_TYPE_HINT_TEXT,
                                                value: null
                                            }}
                                                textField="NameCode" valueField="Id" dataSource={this.state.serviceTypeData}
                                                isClicked={this.state.isClicked} ref="serviceTypeId" />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'abn',
                                                hintText: CONTROLS.ABN_HINT_TEXT,
                                                floatingLabelText: CONTROLS.ABN_FLOATING_TEXT
                                            }}
                                                maxLength={50} initialValue=''
                                                isClicked={this.state.isClicked} ref="abn" />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <Input inputProps={{
                                                name: 'acn',
                                                hintText: CONTROLS.ACN_HINT_TEXT,
                                                floatingLabelText: CONTROLS.ACN_FLOATING_TEXT
                                            }}
                                                maxLength={50} initialValue=''
                                                isClicked={this.state.isClicked} ref="acn" /></div>
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
                                            ref="businessSuburb"
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
                                    <Button
                                        inputProps={{
                                            name: 'btnReset',
                                            label: CONTROLS.BTN_RESET_LABEL,
                                            className: 'button1Style button30Style mr10'
                                        }}
                                        onClick={this.reset}
                                    ></Button>
                                </div>
                            </div>
                            <div className="clear"></div>
                        </div>
                        <Grid ref="findCompanyGrid" isRemoteData={false} selectRowMode={null} {...this.state.grid} selectClick={this.selectClick} />
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

export default FindCompany;