'use strict';

/****************************************
 * Move livestock & Mob to particular
 * Enclosure
 * **************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { ExportCSVButton } from 'react-bootstrap-table';
import { sumBy as _sumBy, map as _map, isEmpty as _isEmpty, isUndefined as _isUndefined } from 'lodash';

import Input from '../../../../lib/core-components/Input';
import Button from '../../../../lib/core-components/Button';
import Grid from '../../../../lib/core-components/Grid';
import { NOTIFY_ERROR, NOTIFY_SUCCESS, NOTIFY_WARNING } from '../../../common/actiontypes';
import { getFeedHistory } from '../../../../services/private/livestock';
import { LocalStorageKeys, reportList } from '../../../../../shared/constants';

class ShowFeedHistory extends Component {
    constructor(props) {
        super(props);

        this.columns = [
            { field: 'FeedDetailId', isKey: true, isSort: false, displayName: 'Key' },
            { field: 'DateOfFeed', isKey: false, isSort: true, displayName: 'Date of Feed', visible: true, width: '100px', format: 'datetimeFormatter' },
            { field: 'FeedType', isKey: false, isSort: true, displayName: 'Feed Type', visible: true, width: '100px' },
            { field: 'FeedQty', isKey: false, isSort: true, displayName: 'Feed Quantity', visible: true, width: '100px', format: 'qtyformat', dataAlign: 'right' },
            { field: 'FeedCost', isKey: false, isSort: true, displayName: 'Feed Cost', visible: true, width: '100px', format: 'currencyformat', dataAlign: 'right' },
            { field: 'FeededBy', isKey: false, isSort: true, displayName: 'Feeded By', visible: true, width: '120px' },
            { field: 'FeedOnPIC', isKey: false, isSort: true, displayName: 'Feed on PIC', visible: true, width: '120px' },
        ];
        this.state = {
            livestock: {
                Id: null,
                EID: null,
                NLISID: null,
                VisualTag: null,
                SocietyId: null,
                MobName: null,
                EnclosureName: null,
                SpeciesName: null
            },
            historyData: []
        }
        this.dataSource = [];

        this.siteURL = window.__SITE_URL__;
        this.strings = this.props.strings;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onExportCSV = this.onExportCSV.bind(this);
        this.onView = this.onView.bind(this);
    }

    componentWillMount() {
        let data = localStorage.getItem(LocalStorageKeys.LivestockData);

        if (data == null || (data != null && JSON.parse(data).data.length == 0)) {
            browserHistory.replace('/livestock');
        }
        else { this.mounted = true; }
    }

    componentWillUnmount() {
        this.mounted = false;
        localStorage.removeItem(LocalStorageKeys.LivestockData)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined) {
            return;
        }

        if (nextProps.topSearch.searchText) {
            let searchText = nextProps.topSearch.searchText.replace('*', '').replace('*', '');
            let filter = this.dataSource.filter(function (i) {
                return i.FeedType.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
            });

            this.stateSet({
                historyData: filter
            });
        }
        else {
            this.stateSet({
                historyData: this.dataSource
            });
        }
    }

    componentDidMount() {
        if (this.mounted) {
            let json = JSON.parse(localStorage.getItem(LocalStorageKeys.LivestockData)).data[0];
            if (json) {
                let _this = this;
                return getFeedHistory(json.Id).then(function (res) {
                    if (res.success && res.data) {
                        _this.dataSource = res.data.data;
                        if (res.data.livestock) {
                            _this.stateSet({
                                livestock: res.data.livestock
                            });
                        }
                        _this.stateSet({
                            historyData: res.data.data
                        });
                    }
                    else {
                        _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error.toString() });
                    }
                }).catch(function (err) {
                    _this.props.notifyToaster(NOTIFY_ERROR);
                });
            }
        }
    }

    stateSet(setObj) {
        if (this.mounted) {
            this.setState(setObj);
        }
    }

    onCancel() {
        browserHistory.push('/livestock');
    }

    onExportCSV() {
        if (this.state.historyData.length > 0) {
            this.refs.grid.handleExportToCSV();
        }
        else {
            this.props.notifyToaster(NOTIFY_WARNING, { message: this.strings.NO_HISTORY_MESSAGE });
        }
    }

    onView() {
        let name = reportList.feedHistory;
        let id = null;
        let param = 'name=' + name + '&id=' + this.state.livestock.Id + '&pic=' + this.props.topPIC.PIC;
        window.open(this.siteURL + '/report-viewer?' + param, '_blank');
    }

    // Render feed type for feed composition
    renderGrid() {
        let gridProps = {
            columns: this.columns,
            csvFileName: 'Feed History.csv',
            isRemoteData: false,
            gridData: this.state.historyData,
            selectRowMode: "none"
        }
        return (<Grid {...gridProps} ref="grid" />);
    }

    renderHeader() {
        return (
            <div className="dash-right-top">
                <div className="live-detail-main">
                    <div className="configure-head">
                        <span>{this.strings.TITLE}</span>
                    </div>
                    <div className="l-stock-top-btn">
                        <ul>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnCancel',
                                        label: this.strings.CONTROLS.CANCEL_LABEL,
                                        className: 'button1Style button30Style'
                                    }}
                                    onClick={this.onCancel} ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnView',
                                        label: this.strings.CONTROLS.VIEW_LABEL,
                                        className: 'button3Style button30Style'
                                    }}
                                    onClick={this.onView} ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnExport',
                                        label: this.strings.CONTROLS.EXPORT_LABEL,
                                        className: 'button3Style button30Style'
                                    }}
                                    onClick={this.onExportCSV} ></Button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>);
    }

    renderContent() {

        return (
            <div className="stock-list">
                <div className="stock-list-cover">
                    <div className="livestock-content">
                        <div className="cattle-text">
                            <span>{this.strings.DESCRIPTION}</span>
                            <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                        </div>
                        <div className="form-group">
                            <div className="row">
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'EID',
                                        hintText: this.strings.CONTROLS.EID_HINT,
                                        floatingLabelText: this.strings.CONTROLS.EID_HINT,
                                        disabled: true
                                    }}
                                        initialValue={this.state.livestock.EID}
                                        updateOnChange={true}
                                        ref="EID" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'NLISID',
                                        hintText: this.strings.CONTROLS.NLISID_HINT,
                                        floatingLabelText: this.strings.CONTROLS.NLISID_HINT,
                                        disabled: true
                                    }}
                                        initialValue={this.state.livestock.NLISID}
                                        updateOnChange={true}
                                        ref="NLISID" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'VisualTag',
                                        hintText: this.strings.CONTROLS.VISUALTAG_HINT,
                                        floatingLabelText: this.strings.CONTROLS.VISUALTAG_HINT,
                                        disabled: true
                                    }}
                                        initialValue={this.state.livestock.VisualTag}
                                        updateOnChange={true}
                                        ref="VisualTag" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'SocietyId',
                                        hintText: this.strings.CONTROLS.SOCIETYID_HINT,
                                        floatingLabelText: this.strings.CONTROLS.SOCIETYID_HINT,
                                        disabled: true
                                    }}
                                        initialValue={this.state.livestock.SocietyId}
                                        updateOnChange={true}
                                        ref="SocietyId" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'MobName',
                                        hintText: this.strings.CONTROLS.MOB_HINT,
                                        floatingLabelText: this.strings.CONTROLS.MOB_HINT,
                                        disabled: true
                                    }}
                                        initialValue={this.state.livestock.MobName}
                                        updateOnChange={true}
                                        ref="MobName" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'Enclosure',
                                        hintText: this.strings.CONTROLS.ENCLOSURE_HINT,
                                        floatingLabelText: this.strings.CONTROLS.ENCLOSURE_HINT,
                                        disabled: true
                                    }}
                                        initialValue={this.state.livestock.EnclosureName}
                                        updateOnChange={true}
                                        ref="Enclosure" />
                                </div>
                                <div className="col-md-3">
                                    <Input inputProps={{
                                        name: 'Species',
                                        hintText: this.strings.CONTROLS.SPECIES_HINT,
                                        floatingLabelText: this.strings.CONTROLS.SPECIES_HINT,
                                        disabled: true
                                    }}
                                        initialValue={this.state.livestock.SpeciesName}
                                        updateOnChange={true}
                                        ref="Species" />
                                </div>
                                <div className="col-md-3">
                                </div>
                            </div>
                            <div className="row" >
                                <div className="col-md-12 mt15" >
                                    {this.renderGrid()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="row">
                {this.renderHeader()}
                <div className="clear"></div>
                {this.renderContent()}
                <div className="clear"></div>
            </div>
        );
    }
}

export default ShowFeedHistory;