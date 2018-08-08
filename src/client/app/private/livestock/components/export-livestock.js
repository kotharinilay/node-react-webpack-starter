'use strict';

/************************************************
 * Export livestock
 ***********************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { map, sortBy } from 'lodash';

import Grid from '../../../../lib/core-components/Grid';
import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';

import { NOTIFY_SUCCESS, NOTIFY_ERROR, NOTIFY_WARNING } from '../../../common/actiontypes';

import { exportLivestock } from '../../../../services/private/livestock';
import { currentDateTime } from '../../../../../shared/format/date';
import { getBrowserName } from '../../../../lib/index';
import { browserList } from '../../../../../shared/constants';

class ExportLivestock extends Component {

    // constructor of component
    constructor(props) {
        super(props);
        this.notifyToaster = this.props.notifyToaster;

        this.mobCount = 0;
        this.livestockCount = 0;
        this.selectedData = [];

        this.backToLivestock = this.backToLivestock.bind(this);

        if (localStorage.getItem('livestock_data') != null) {
            let data = JSON.parse(localStorage.getItem('livestock_data'));
            if (data.propertyId != this.props.topPIC.PropertyId || data.data.length == 0)
                this.backToLivestock();
            this.selectedData = data.data;
            this.selectedData.map(x => {
                if (x.IsMob)
                    this.mobCount++;
                this.livestockCount += x.NumberOfHead;
            });
        }
        else
            this.backToLivestock();

        this.livestockColumns = [
            { field: 'Mob', selected: true, displayName: 'Mob', columnName: 'l.Mob' },
            { field: 'EID', selected: true, displayName: 'EID', columnName: 'l.EID' },
            { field: 'NLISID', selected: true, displayName: 'NLIS', columnName: 'l.NLISID' },
            { field: 'SocietyId', selected: true, displayName: 'Society Id', columnName: 'l.SocietyId' },
            { field: 'VisualTag', selected: true, displayName: 'Visual Tag', columnName: 'l.VisualTag' },
            { field: 'LivestockWeight', selected: true, displayName: 'Livestock Weight', columnName: 'l.CurrentWeight as LivestockWeight' },
            { field: 'Age', displayName: 'Age', format: 'ageformat', columnName: 'l.BirthDate as Age' },
            { field: 'LivestockQuantity', displayName: 'Livestock Quantity', formatter: this.setMobCount, columnName: 'l.NumberOfHead as LivestockQuantity' },
            { field: 'EnclosureName', selected: true, displayName: 'Enclosure', columnName: 'e.Name as EnclosureName' },

            { field: 'SpeciesName', selected: true, displayName: 'Species', columnName: 'sd.SpeciesName' },
            { field: 'SpeciesTypeName', displayName: 'Species Type', columnName: 'std.SpeciesTypeName' },
            { field: 'BreedComposition', displayName: 'Breed Composition', columnName: 'BreedComposition' },
            { field: 'MaturityName', displayName: 'Maturity', columnName: 'md.MaturityName' },
            { field: 'GenderName', displayName: 'Gender', columnName: 'gd.GenderName' },
            { field: 'CategoryName', displayName: 'Category', columnName: 'lcd.CategoryName' },
            { field: 'ColourName', displayName: 'Colour', columnName: 'lcld.ColourName' },
            { field: 'BirthDate', displayName: 'Date of Birth', columnName: 'l.BirthDate', format: 'dateformat' },
            { field: 'Drop', displayName: 'Drop', columnName: 'la.Drop' },
            { field: 'BirthPIC', displayName: 'Birth PIC', columnName: 'l.BirthPIC' },
            { field: 'ScanDate', displayName: 'Scan Date', columnName: 'la.ScanDate' },
            { field: 'InductionDate', displayName: 'Induction Date', columnName: 'l.InductionDate', format: 'dateformat' },
            { field: 'EnclosureTypeName', displayName: 'Enclosure Type', columnName: 'etd.EnclosureTypeName' },
            { field: 'EarmarkText', displayName: 'Eartag', columnName: 'la.EarmarkText' },
            { field: 'BrandText', displayName: 'Brand', columnName: 'la.BrandText' },
            { field: 'OriginName', displayName: 'Livestock Origin', columnName: 'lod.OriginName' },
            { field: 'LivestockOriginReference', displayName: 'Livestock Origin Reference', columnName: 'la.LivestockOriginReference' },
            { field: 'LivestockOriginPIC', displayName: 'Livestock Origin PIC', columnName: 'la.LivestockOriginPIC' },
            { field: 'IsFinancierOwned', displayName: 'Financier Owned Livestock', columnName: 'l.IsFinancierOwned', format: 'booleanformat' },
            { field: 'IsPPSR', displayName: 'PPSR', columnName: 'la.IsPPSR', format: 'booleanformat' },
            { field: 'FinancierName', displayName: 'Financier Name', columnName: 'la.FinancierName' },

            { field: 'ManagementNo', displayName: 'Management No', columnName: 'la.ManagementNo' },
            { field: 'ManagementGroup', displayName: 'Management Group', columnName: 'la.ManagementGroup' },
            { field: 'NumberInBirth', displayName: 'Number In Birth', columnName: 'la.NumberInBirth' },
            { field: 'NumberInReared', displayName: 'Number In Reared', columnName: 'la.NumberInReared' },
            { field: 'DentitionName', displayName: 'Dentition', columnName: 'dd.DentitionName' },
            { field: 'BirthProductivity', displayName: 'Birth Productivity', columnName: 'la.BirthProductivity' },
            { field: 'Progeny', displayName: 'Progeny', columnName: 'la.Progeny' },
            { field: 'IsHGP', displayName: 'HGP', columnName: 'la.IsHGP', format: 'booleanformat' },
            { field: 'HGPText', displayName: 'HGP Reference Details', columnName: 'la.HGPText' },
            { field: 'EIDBatchNo', displayName: 'Batch Number', columnName: 'la.EIDBatchNo' },
            { field: 'LastMonthOfShearing', displayName: 'Last Month of Shearing', columnName: 'la.LastMonthOfShearing', format: 'monthformat' },
            { field: 'LastComment', displayName: 'Last Comment', columnName: 'la.LastComment' },
            { field: 'AdditionalTag', displayName: 'Additional Tag', columnName: 'la.AdditionalTag' },
            { field: 'FeedlotTag', displayName: 'Feedlot Tag', columnName: 'la.FeedlotTag' },
            { field: 'BreederTag', displayName: 'Breeder Tag', columnName: 'la.BreederTag' },
            { field: 'StudName', displayName: 'Stud Name', columnName: 'la.StudName' },
            { field: 'RegistrationDetail', displayName: 'Registration Detail', columnName: 'la.RegistrationDetail' },
            { field: 'WeighBridgeTicket', displayName: 'Weigh Bridge Ticket', columnName: 'la.WeighBridgeTicket' },
            { field: 'ReferenceId', displayName: 'Reference ID', columnName: 'la.ReferenceId' },
            { field: 'Name', displayName: 'Name', columnName: 'la.Name' },
            { field: 'ContemporaryGroupName', displayName: 'Contemporary Group', columnName: 'cgd.GroupName as ContemporaryGroupName' },
            { field: 'GeneticStatusName', displayName: 'Genetic Status', columnName: 'gsd.StatusName as GeneticStatusName' },
            { field: 'Appraisal', displayName: 'Appraisal', columnName: 'la.Appraisal' },
            { field: 'ConditionScoreName', displayName: 'Condition Score', columnName: 'csd.ScoreName as ConditionScoreName' },
            { field: 'LivestockGroupName', displayName: 'Group', columnName: 'lgd.GroupName as LivestockGroupName' },
            { field: 'ClassificationName', displayName: 'Classification', columnName: 'lclsd.ClassificationName' },
            { field: 'SupplyChain', displayName: 'Supply Chain', columnName: 'la.SupplyChain' },
            { field: 'ReminderNote', displayName: 'Reminder Note', columnName: 'la.ReminderNote' },
            { field: 'ReminderDate', displayName: 'Reminder Date', columnName: 'la.ReminderDate', format: 'datetimeformat' },
            { field: 'IsFreeMartin', displayName: 'Free-Martin', columnName: 'la.IsFreeMartin', format: 'booleanformat' },
            { field: 'DraftGroup', displayName: 'Draft Group', columnName: 'la.DraftGroup' },

            { field: 'GeneticSireText', displayName: 'Genetic Sire', columnName: 'la.GeneticSireText' },
            { field: 'GeneticDamText', displayName: 'Genetic Dam', columnName: 'la.GeneticDamText' },
            { field: 'FosterDamText', displayName: 'Foaster Dam', columnName: 'la.FosterDamText' },
            { field: 'RecipientDamText', displayName: 'Receipient Dam', columnName: 'la.RecipientDamText' },
            { field: 'MultiSireGroupName', displayName: 'MultiSire Group', columnName: 'mgd.GroupName as MultiSireGroupName' }
        ];

        this.state = {
            key: Math.random(),
            grid: {
                columns: [
                    { field: 'field', isKey: true, displayName: 'Id' },
                    { field: 'displayName', displayName: 'Attributes', visible: true }
                ],
                filterObj: {
                    columns: map([...this.livestockColumns], 'columnName'),
                    data: this.selectedData
                }
            }
        };

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.renderHeader = this.renderHeader.bind(this);
        this.renderContent = this.renderContent.bind(this);

        this.exportLivestock = this.exportLivestock.bind(this);
        this.resetSettings = this.resetSettings.bind(this);

    }

    componentWillReceiveProps(prevProps) {
        if (prevProps.topPIC.PropertyId != this.props.topPIC.PropertyId)
            this.backToLivestock();
    }

    // Handle cancel button events
    backToLivestock() {
        if (localStorage.getItem('livestock_data') != null)
            localStorage.removeItem('livestock_data');
        browserHistory.replace('/livestock');
    }
    myFunction() {
        if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
            alert('Opera');
        }
        else if (navigator.userAgent.indexOf("Chrome") != -1) {
            alert('Chrome');
        }
        else if (navigator.userAgent.indexOf("Safari") != -1) {
            alert('Safari');
        }
        else if (navigator.userAgent.indexOf("Firefox") != -1) {
            alert('Firefox');
        }
        else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) //IF IE > 10
        {
            alert('IE');
        }
        else {
            alert('unknown');
        }
    }
    // Handle export livestock button events
    exportLivestock() {
        if (this.refs.exportGrid.selectedRows.length > 0) {
            let filterObj = {
                displayName: map(this.refs.exportGrid.selectedRows, 'displayName'),
                columns: map(this.refs.exportGrid.selectedRows, 'columnName'),
                uuid: map(this.selectedData, 'Id')
            }
            let _this = this;
            return exportLivestock(filterObj).then(function (res) {
                if (res.success) {
                    let browserName = getBrowserName();
                    if (browserName == browserList.ie) {
                        window.navigator.msSaveOrOpenBlob(new Blob([res.data], { type: 'text/csv' }), 'Livestock_' + currentDateTime().DateTime.replace(/ /g, "_") + '.csv');
                    }
                    else {
                        let downloadLink = _this.refs.downloadLink;
                        var csvData = new Blob([res.data], { type: 'text/csv' });
                        var csvUrl = URL.createObjectURL(csvData);
                        downloadLink.download = 'Livestock_' + currentDateTime().DateTime.replace(/ /g, "_") + '.csv';
                        downloadLink.href = csvUrl;
                        downloadLink.click();
                    }
                    _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.SUCCESS });
                    return true;
                }
            }).catch(function (err) {
                _this.notifyToaster(NOTIFY_ERROR);
            });
        }
        else
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_AT_LEAST_ONE });
    }

    resetSettings() {
        this.setState({ key: Math.random() });
    }

    // render header part
    renderHeader() {
        return (
            <div className="dash-right-top">
                <div className="live-detail-main">
                    <div className="configure-head">
                        <span>{this.strings.TITLE}</span>
                        <a href="" ref="downloadLink" />
                    </div>
                    <div className="l-stock-top-btn">
                        <ul>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnCancel',
                                        label: this.strings.CONTROLS.CANCEL_LABEL,
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={this.backToLivestock}
                                ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnReset',
                                        label: this.strings.CONTROLS.RESET_LABEL,
                                        className: 'button3Style button30Style',
                                    }}
                                    onClick={this.resetSettings}
                                ></Button>
                            </li>
                            <li>
                                <BusyButton
                                    inputProps={{
                                        name: 'btnExport',
                                        label: this.strings.CONTROLS.EXPORT_LABEL,
                                        className: 'button2Style button30Style',
                                    }}
                                    loaderHeight={25}
                                    onClick={this.exportLivestock}
                                ></BusyButton>
                            </li>
                        </ul>
                    </div>
                </div>
            </div >);
    }

    // render content area
    renderContent() {
        let selectedRows = [];
        let selectedRowsObj = [];
        let resultData = this.livestockColumns;
        this.livestockColumns.map(s => {
            if (s.selected) {
                selectedRowsObj.push(s);
                selectedRows.push(s.field);
            }
        });

        let gridProps = {
            ...this.state.grid,
            isRemoteData: false,
            gridData: sortBy([...this.livestockColumns], ['selected', 'displayName']),
            pagination: false,
            selectedRows: selectedRowsObj,
            selected: selectedRows,
            height: 400
        }
        return (<div className="stock-list">
            <div className="stock-list-cover">
                <div className="livestock-content">
                    <div className="cattle-text">
                        <span>{this.livestockCount} Livestock(s)</span>
                        <span>{this.mobCount} Mob(s)</span>
                    </div>
                    <div className="clear" ></div>
                    <Grid ref="exportGrid" {...gridProps} />
                </div>
            </div>
        </div>);
    }

    // render component
    render() {
        return (
            <div className="row" key={this.state.key}>
                {this.renderHeader()}
                <div className="clear"></div>
                {this.renderContent()}
                <div className="clear"></div>
            </div>
        );
    }
}

export default ExportLivestock;