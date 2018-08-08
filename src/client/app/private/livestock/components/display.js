'use strict';

/************************************************
 * Show all livestock
 ***********************************************/

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import { sum as _sum, map as _map, uniqBy as _uniqBy } from 'lodash';

import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';
import Grid from '../../../../lib/core-components/Grid';
import Button from '../../../../lib/core-components/Button';
import RadioButton from '../../../../lib/core-components/RadioButton';
import Dropdown from '../../../../lib/core-components/Dropdown';
import CheckBox from '../../../../lib/core-components/CheckBox';
import Input from '../../../../lib/core-components/Input';
import NumberInput from '../../../../lib/core-components/NumberInput';
import ColumnVisible from '../../../../lib/core-components/ColumnVisible';
import Livestock_Location from '../../../../lib/wrapper-components/GPSCoordiante/Livestock_Location';
import RecordLostTags from './popup/record-lost-tags';
import RecordTagReplacement from './popup/record-tag-replacement';

import { Scrollbars } from '../../../../../../assets/js/react-custom-scrollbars';
import { getForm, isValidForm } from '../../../../lib/wrapper-components/FormActions';
import { NOTIFY_SUCCESS, NOTIFY_ERROR, NOTIFY_WARNING } from '../../../common/actiontypes';

import {
    getLivestockFilterData, getLivestockFilterBySpecies, getAllLivestock, deleteLivestock,
    getLivestockByCondition
} from '../../../../services/private/livestock';
import { livestockLTEUStatus, livestockActivityStatusCodes, LocalStorageKeys } from '../../../../../shared/constants';
import { gridActionNotify } from '../../../../lib/wrapper-components/FormActions';

class Display extends Component {

    // constructor of component
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.resetFilter = {
            display: "1",
            activityStatus: null,
            species: null,
            breed: null,
            speciesType: null,
            maturity: null,
            gender: null,
            category: null,
            enclosure: null,
            livestockOrigin: null,
            financierOwned: false,
            dropBirthYear: null,
            ltStatus: "1",
            euStatus: "1"
        }

        this.filter = { ...this.resetFilter };
        this.pageSize = 10;

        this.columnWidth = '170px';
        this.ignoreColumns = ['Id', 'SocietyId', 'DefaultGPS', 'Identifier'];
        this.livestockColumns = [
            { field: 'Id', isKey: true, displayName: 'Livestock Id', columnName: 'l.UUID as Id' },
            { field: 'IndFileIcon', width: '40px', visible: true, isSort: false, displayName: '', columnName: 'fi.FilePath as IndFileIcon, fm.FilePath as MobIcon', formatter: this.setIcon.bind(this) },
            { field: 'Mob', width: this.columnWidth, displayName: 'Mob', visible: true, columnName: 'l.Mob' },
            { field: 'EID', width: this.columnWidth, displayName: 'EID', visible: true, columnName: 'l.EID' },
            { field: 'NLISID', width: this.columnWidth, displayName: 'NLIS', visible: true, columnName: 'l.NLISID' },
            { field: 'VisualTag', width: this.columnWidth, displayName: 'Visual Tag', visible: true, columnName: 'l.VisualTag' },
            { field: 'LivestockWeight', width: this.columnWidth, displayName: 'Livestock Weight', visible: true, format: 'weightformat', columnName: 'l.CurrentWeight as LivestockWeight' },
            { field: 'Age', width: this.columnWidth, displayName: 'Age', visible: true, format: 'ageformat', columnName: 'l.BirthDate as Age' },
            { field: 'NumberOfHead', width: this.columnWidth, displayName: 'Livestock Quantity', visible: true, columnName: 'l.NumberOfHead as LivestockQuantity', formatter: this.manipulateQty.bind(this) },
            { field: 'EnclosureName', width: this.columnWidth, displayName: 'Enclosure', visible: true, columnName: 'e.Name as EnclosureName' },

            { field: 'SocietyId', width: this.columnWidth, displayName: 'Society Id', visible: false, columnName: 'l.SocietyId' },
            { field: 'Identifier', width: this.columnWidth, displayName: 'Identifier', visible: false, columnName: 'l.Identifier' },
            { field: 'DefaultGPS', width: this.columnWidth, displayName: 'Default GPS', visible: false, columnName: 'l.DefaultGPS' },

            { field: 'LivestockActivityStatus', width: this.columnWidth, displayName: 'Activity Status', visible: false, columnName: 'asd.StatusName as LivestockActivityStatus' },
            { field: 'SpeciesName', width: this.columnWidth, displayName: 'Species', visible: false, columnName: 'sd.SpeciesName' },
            { field: 'SpeciesTypeName', width: this.columnWidth, displayName: 'Species Type', visible: false, columnName: 'std.SpeciesTypeName' },
            { field: 'BreedComposition', width: this.columnWidth, displayName: 'Breed Composition', visible: false, columnName: 'BreedComposition' },
            { field: 'MaturityName', width: this.columnWidth, displayName: 'Maturity', visible: false, columnName: 'md.MaturityName' },
            { field: 'MaturityCode', width: this.columnWidth, displayName: 'Maturity Code', visible: false, columnName: 'MaturityCode' },
            { field: 'GenderName', width: this.columnWidth, displayName: 'Gender', visible: false, columnName: 'gd.GenderName' },
            { field: 'CategoryName', width: this.columnWidth, displayName: 'Category', visible: false, columnName: 'lcd.CategoryName' },
            { field: 'ColourName', width: this.columnWidth, displayName: 'Colour', visible: false, columnName: 'lcld.ColourName' },
            { field: 'BirthDt', width: this.columnWidth, displayName: 'Date of Birth', visible: false, columnName: 'l.BirthDate as BirthDt', format: 'dateformat' },
            { field: 'Drop', width: this.columnWidth, displayName: 'Drop', visible: false, columnName: 'la.Drop' },
            { field: 'BirthPIC', width: this.columnWidth, displayName: 'Birth PIC', visible: false, columnName: 'l.BirthPIC' },
            { field: 'ScanDate', width: this.columnWidth, displayName: 'Scan Date', visible: false, columnName: 'la.ScanDate', format: 'dateformat' },
            { field: 'InductionDt', width: this.columnWidth, displayName: 'Induction Date', visible: false, columnName: 'l.InductionDate as InductionDt', format: 'dateformat' },
            { field: 'EnclosureTypeName', width: this.columnWidth, displayName: 'Enclosure Type', visible: false, columnName: 'etd.EnclosureTypeName' },
            { field: 'EarmarkText', width: this.columnWidth, displayName: 'Eartag', visible: false, columnName: 'la.EarmarkText' },
            { field: 'BrandText', width: this.columnWidth, displayName: 'Brand', visible: false, columnName: 'la.BrandText' },
            { field: 'OriginName', width: this.columnWidth, displayName: 'Livestock Origin', visible: false, columnName: 'lod.OriginName' },
            { field: 'LivestockOriginReference', width: this.columnWidth, displayName: 'Livestock Origin Reference', visible: false, columnName: 'la.LivestockOriginReference' },
            { field: 'LivestockOriginPIC', width: this.columnWidth, displayName: 'Livestock Origin PIC', visible: false, columnName: 'la.LivestockOriginPIC' },
            { field: 'IsFinancierOwned', width: this.columnWidth, displayName: 'Financier Owned Livestock', visible: false, columnName: 'l.IsFinancierOwned', format: 'booleanformat' },
            { field: 'IsPPSR', width: this.columnWidth, displayName: 'PPSR', visible: false, columnName: 'la.IsPPSR', format: 'booleanformat' },
            { field: 'FinancierName', width: this.columnWidth, displayName: 'Financier Name', visible: false, columnName: 'la.FinancierName' },

            { field: 'ManagementNo', width: this.columnWidth, displayName: 'Management No', visible: false, columnName: 'la.ManagementNo' },
            { field: 'ManagementGroup', width: this.columnWidth, displayName: 'Management Group', visible: false, columnName: 'la.ManagementGroup' },
            { field: 'NumberInBirth', width: this.columnWidth, displayName: 'Number In Birth', visible: false, columnName: 'la.NumberInBirth' },
            { field: 'NumberInReared', width: this.columnWidth, displayName: 'Number In Reared', visible: false, columnName: 'la.NumberInReared' },
            { field: 'DentitionName', width: this.columnWidth, displayName: 'Dentition', visible: false, columnName: 'dd.DentitionName' },
            { field: 'BirthProductivity', width: this.columnWidth, displayName: 'Birth Productivity', visible: false, columnName: 'la.BirthProductivity' },
            { field: 'Progeny', width: this.columnWidth, displayName: 'Progeny', visible: false, columnName: 'la.Progeny' },
            { field: 'IsHGP', width: this.columnWidth, displayName: 'HGP', visible: false, columnName: 'la.IsHGP', format: 'booleanformat' },
            { field: 'HGPText', width: this.columnWidth, displayName: 'HGP Reference Details', visible: false, columnName: 'la.HGPText' },
            { field: 'EIDBatchNo', width: this.columnWidth, displayName: 'Batch Number', visible: false, columnName: 'la.EIDBatchNo' },
            { field: 'LastMonthOfShearing', width: this.columnWidth, displayName: 'Last Month of Shearing', visible: false, columnName: 'la.LastMonthOfShearing', format: 'monthformat' },
            { field: 'LastComment', width: this.columnWidth, displayName: 'Last Comment', visible: false, columnName: 'la.LastComment' },
            { field: 'AdditionalTag', width: this.columnWidth, displayName: 'Additional Tag', visible: false, columnName: 'la.AdditionalTag' },
            { field: 'FeedlotTag', width: this.columnWidth, displayName: 'Feedlot Tag', visible: false, columnName: 'la.FeedlotTag' },
            { field: 'BreederTag', width: this.columnWidth, displayName: 'Breeder Tag', visible: false, columnName: 'la.BreederTag' },
            { field: 'StudName', width: this.columnWidth, displayName: 'Stud Name', visible: false, columnName: 'la.StudName' },
            { field: 'RegistrationDetail', width: this.columnWidth, displayName: 'Registration Detail', visible: false, columnName: 'la.RegistrationDetail' },
            { field: 'WeighBridgeTicket', width: this.columnWidth, displayName: 'Weigh Bridge Ticket', visible: false, columnName: 'la.WeighBridgeTicket' },
            { field: 'ReferenceId', width: this.columnWidth, displayName: 'Reference ID', visible: false, columnName: 'la.ReferenceId' },
            { field: 'Name', width: this.columnWidth, displayName: 'Name', visible: false, columnName: 'la.Name' },
            { field: 'ContemporaryGroupName', width: this.columnWidth, displayName: 'Contemporary Group', visible: false, columnName: 'cgd.GroupName as ContemporaryGroupName' },
            { field: 'GeneticStatusName', width: this.columnWidth, displayName: 'Genetic Status', visible: false, columnName: 'gsd.StatusName as GeneticStatusName' },
            { field: 'Appraisal', width: this.columnWidth, displayName: 'Appraisal', visible: false, columnName: 'la.Appraisal' },
            { field: 'ConditionScoreName', width: this.columnWidth, displayName: 'Condition Score', visible: false, columnName: 'csd.ScoreName as ConditionScoreName' },
            { field: 'LivestockGroupName', width: this.columnWidth, displayName: 'Group', visible: false, columnName: 'lgd.GroupName as LivestockGroupName' },
            { field: 'ClassificationName', width: this.columnWidth, displayName: 'Classification', visible: false, columnName: 'lclsd.ClassificationName' },
            { field: 'SupplyChain', width: this.columnWidth, displayName: 'Supply Chain', visible: false, columnName: 'la.SupplyChain' },
            { field: 'ReminderNote', width: this.columnWidth, displayName: 'Reminder Note', visible: false, columnName: 'la.ReminderNote' },
            { field: 'ReminderDate', width: this.columnWidth, displayName: 'Reminder Date', visible: false, columnName: 'la.ReminderDate', format: 'datetimeformat' },
            { field: 'IsFreeMartin', width: this.columnWidth, displayName: 'Free-Martin', visible: false, columnName: 'la.IsFreeMartin', format: 'booleanformat' },
            { field: 'DraftGroup', width: this.columnWidth, displayName: 'Draft Group', visible: false, columnName: 'la.DraftGroup' },

            { field: 'GeneticSireText', width: this.columnWidth, visible: true, displayName: 'Genetic Sire', columnName: 'la.GeneticSireText' },
            { field: 'GeneticDamText', width: this.columnWidth, visible: true, displayName: 'Genetic Dam', columnName: 'la.GeneticDamText' },
            { field: 'FosterDamText', width: this.columnWidth, visible: true, displayName: 'Foaster Dam', columnName: 'la.FosterDamText' },
            { field: 'RecipientDamText', width: this.columnWidth, visible: true, displayName: 'Receipient Dam', columnName: 'la.RecipientDamText' },
            { field: 'MultiSireGroupName', width: this.columnWidth, visible: true, displayName: 'MultiSire Group', columnName: 'mgd.GroupName as MultiSireGroupName' }
        ];

        this.getDisplayColumns = this.getDisplayColumns.bind(this);
        let displayColumns = this.getDisplayColumns();

        this.state = {
            selectAll: false,
            selectedData: [],

            isClicked: false,
            displayFilter: false,
            dataFetch: false,

            filterText: '',
            livestockData: '',
            mobCount: 0,
            livestockCount: 0,

            renderFilter: Math.random(),
            renderSpeciesFilter: Math.random(),
            renderGrid: Math.random(),

            grid: {
                columns: displayColumns,
                filterObj: {
                    columns: _map(displayColumns, 'columnName'),
                    propertyId: this.props.topPIC.PropertyId,
                    filter: this.filter,
                    pageSize: this.pageSize
                }
            },

            openRecordLost: false,
            openRecordReplacement: false
        };

        this.data = {
            activityStatus: [],
            species: [],
            breed: [],
            speciesType: [],
            maturity: [],
            gender: [],
            category: [],
            enclosure: [],
            livestockOrigin: []
        }

        this.filterSchema = ['display', 'activityStatus', 'species', 'breed',
            'speciesType', 'maturity', 'gender', 'category', 'enclosure', 'livestockOrigin',
            'financierOwned', 'dropBirthYear', 'ltStatus', 'euStatus'];

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.stateSet = this.stateSet.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.toggleSelection = this.toggleSelection.bind(this);

        this.renderHeader = this.renderHeader.bind(this);
        this.renderFilter = this.renderFilter.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.exportLivestock = this.exportLivestock.bind(this);
        this.validateAtLeastOne = this.validateAtLeastOne.bind(this);
        this.validateOnlyMobOrEid = this.validateOnlyMobOrEid.bind(this);
        this.validateOnlyEid = this.validateOnlyEid.bind(this);
        this.validateActivityStatus = this.validateActivityStatus.bind(this);
        this.validateActiveStatus = this.validateActiveStatus.bind(this);
        this.checkForSameType = this.checkForSameType.bind(this);
        this.checkForSameSpecies = this.checkForSameSpecies.bind(this);

        this.onSpeciesChange = this.onSpeciesChange.bind(this);
        this.generateFilterText = this.generateFilterText.bind(this);
        this.getGridData = this.getGridData.bind(this);
        this.columnVisibleChnage = this.columnVisibleChnage.bind(this);
        this.getDDLColumn = this.getDDLColumn.bind(this);

        this.rowSelect = this.rowSelect.bind(this);

        this.moveToEnclosure = this.moveToEnclosure.bind(this);
        // this.setLocalStorage = this.setLocalStorage.bind(this);
        this.deleteLivestock = this.deleteLivestock.bind(this);
        this.deleteLivestockClick = this.deleteLivestockClick.bind(this);
        this.modifyLivestockClick = this.modifyLivestockClick.bind(this);
        this.splitMob = this.splitMob.bind(this);
        this.mergeMob = this.mergeMob.bind(this);
        this.showTags = this.showTags.bind(this);
        this.recordScan = this.recordScan.bind(this);
        this.recordDeceased = this.recordDeceased.bind(this);
        this.recordLostTags = this.recordLostTags.bind(this);
        this.recordTagReplacement = this.recordTagReplacement.bind(this);
        this.recordCarcass = this.recordCarcass.bind(this);
        this.recordTreatment = this.recordTreatment.bind(this);
        this.showFeedHistory = this.showFeedHistory.bind(this);
        this.showTreatHistory = this.showTreatHistory.bind(this);
        this.showWeightHistory = this.showWeightHistory.bind(this);
        this.showTracebility = this.showTracebility.bind(this);
        this.starteNVD = this.starteNVD.bind(this);

        this.toggleRecordLost = this.toggleRecordLost.bind(this);
        this.toggleRecordTagReplacement = this.toggleRecordTagReplacement.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.topSearch == undefined) {
            return;
        }
        this.refs.livestockGrid.onSearchChange(nextProps.topSearch.searchText);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getLivestockFilterData(this.props.topPIC, this.state.grid.filterObj).then(function (res) {
            if (res.success) {

                _this.data.activityStatus = res.data.activityStatus;
                _this.data.species = res.data.species;
                _this.data.gender = res.data.gender;
                _this.data.livestockOrigin = res.data.livestockOrigin;
                _this.data.category = res.data.category;
                _this.data.enclosure = res.data.enclosure;
                _this.filter = res.data.filter;
                _this.pageSize = res.data.pageSize;
                _this.columns = res.data.columns;

                _this.livestockColumns.map(column => {
                    if (_this.columns.includes(column.columnName) && !_this.ignoreColumns.includes(column.field))
                        column.visible = true;
                    else if (column.visible != undefined)
                        column.visible = false;
                });

                let displayColumns = _this.getDisplayColumns();

                let grid = { ..._this.state.grid };
                grid.columns = displayColumns;
                grid.filterObj = {
                    columns: _map(displayColumns, 'columnName'),
                    propertyId: _this.props.topPIC.PropertyId,
                    filter: _this.filter,
                    pageSize: _this.pageSize
                };
                _this.stateSet({ dataFetch: true, grid: grid, filterText: _this.generateFilterText() });
            }
        }).catch(function (err) {
            _this.stateSet({ dataFetch: true });
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Handle change event of column filter
    columnVisibleChnage(field, value) {
        let fieldObj = this.livestockColumns.find(column => column.field == field);
        fieldObj.visible = value;

        let grid = { ...this.state.grid };

        grid.columns = this.getDisplayColumns();

        grid.filterObj.columns = _map(grid.columns, 'columnName');
        this.stateSet({ renderGrid: Math.random(), grid: grid });
    }

    // get column list to display in grid
    getDisplayColumns() {
        let displayColumns = [...this.livestockColumns]
        displayColumns = displayColumns.filter(column => {
            return (column.visible || this.ignoreColumns.includes(column.field));
        });
        return displayColumns;
    }

    // get column list for column filter dropdown
    getDDLColumn() {
        let columns = [...this.livestockColumns]
        columns = columns.filter(column => {
            return (!this.ignoreColumns.includes(column.field));
        })
        return columns;
    }

    // handle change event of species drop down
    onSpeciesChange(value, text) {
        let _this = this;
        getLivestockFilterBySpecies(value, this.props.topPIC).then(function (res) {
            if (res.success) {
                _this.data.breed = res.data.breed;
                _this.data.maturity = res.data.maturity;
                _this.data.speciesType = res.data.speciesType;

                _this.filter.breed = null;
                _this.filter.speciesType = null;
                _this.filter.maturity = null;
                _this.stateSet({ renderSpeciesFilter: Math.random() });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    // get livestock data of grid response
    getGridData(data) {
        let text = '';
        if (data.livestockData) {
            data.livestockData.map(d => {
                if (d.SpeciesName)
                    text += '<span>' + d.Total + ' ' + d.SpeciesName + '(s)</span>';
            });
        }
        this.stateSet({ livestockData: text, mobCount: data.mobCount, livestockCount: data.livestockCount });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.topPIC.PropertyId != this.props.topPIC.PropertyId)
            this.clearFilter();
    }

    // clear filter and load all data
    clearFilter() {
        this.filter = { ...this.resetFilter };
        let grid = { ...this.state.grid };
        grid.filterObj = {
            columns: _map(grid.columns, 'columnName'),
            propertyId: this.props.topPIC.PropertyId,
            filter: this.filter,
            pageSize: this.pageSize
        }
        this.refs.livestockGrid.onSelectAll(false, []);
        this.stateSet({ renderFilter: Math.random(), filterText: '', grid: { ...grid }, selectedData: [], selectAll: false });
    }

    // show/hide filter screen
    toggleFilter() {
        let filterState = this.state.displayFilter;
        this.stateSet({ displayFilter: !filterState });
    }

    // generate filter text to display
    generateFilterText() {
        let filterText = '';
        let { CONTROLS } = this.props.strings;
        let { display, activityStatus, species, breed, speciesType, maturity, gender, category,
            enclosure, livestockOrigin, financierOwned, dropBirthYear, ltStatus, euStatus } = this.filter;

        if (display == 2)
            filterText += 'Show Only EID, ';
        else if (display == 3)
            filterText += 'Show Only Mob, ';

        if (activityStatus) {
            let obj = this.data.activityStatus.find(x => x.Id == activityStatus);
            if (obj)
                filterText += `<b>${CONTROLS.ACTIVITY_STATUS_TEXT}:</b> ${obj.NameCode}, `;
        }
        if (species) {
            let obj = this.data.species.find(x => x.Id == species);
            if (obj)
                filterText += `<b>${CONTROLS.SPECIES_TEXT}:</b> ${obj.NameCode}, `;
        }
        if (breed) {
            let obj = this.data.breed.find(x => x.Id == breed);
            if (obj)
                filterText += `<b>${CONTROLS.BREED_TEXT}:</b> ${obj.NameCode}, `;
        }
        if (speciesType) {
            let obj = this.data.speciesType.find(x => x.Id == speciesType);
            if (obj)
                filterText += `<b>${CONTROLS.SPECIES_TYPE_TEXT}:</b> ${obj.Name}, `;
        }
        if (maturity) {
            let obj = this.data.maturity.find(x => x.Id == maturity);
            if (obj)
                filterText += `<b>${CONTROLS.MATURITY_TEXT}:</b> ${obj.NameCode}, `;
        }
        if (gender) {
            let obj = this.data.gender.find(x => x.Id == gender);
            if (obj)
                filterText += `<b>${CONTROLS.GENDER_TEXT}:</b> ${obj.NameCode}, `;
        }
        if (category) {
            let obj = this.data.category.find(x => x.Id == category);
            if (obj)
                filterText += `<b>${CONTROLS.CATEGORY_TEXT}:</b> ${obj.NameCode}, `;
        }
        if (enclosure) {
            let obj = this.data.enclosure.find(x => x.Id == enclosure);
            if (obj)
                filterText += `<b>${CONTROLS.ENCLOSURE_TEXT}:</b> ${obj.NameCode}, `;
        }
        if (livestockOrigin) {
            let obj = this.data.livestockOrigin.find(x => x.Id == livestockOrigin);
            if (obj)
                filterText += `<b>${CONTROLS.LIVESTOCK_ORIGIN_TEXT}:</b> ${obj.NameCode}, `;
        }
        if (financierOwned)
            filterText += `<b>${CONTROLS.FINANCIER_OWNED_LABEL}:</b> Yes, `;
        if (dropBirthYear && dropBirthYear.length == 4)
            filterText += `<b>${CONTROLS.DROP_BIRTH_YEAR_TEXT}:</b> ${dropBirthYear}, `;

        if (ltStatus == 2)
            filterText += `<b>${CONTROLS.LT_STATUS_TEXT}:</b> Yes, `;
        else if (ltStatus == 3)
            filterText += `<b>${CONTROLS.LT_STATUS_TEXT}:</b> No, `;

        if (euStatus == 2)
            filterText += `<b>${CONTROLS.EU_STATUS_TEXT}:</b> Yes, `;
        else if (euStatus == 3)
            filterText += `<b>${CONTROLS.EU_STATUS_TEXT}:</b> No, `;

        filterText == "" ? "" : filterText = "<b>Filter:</b> " + filterText.trim().slice(0, -1);
        return filterText;
    }

    applyFilter() {
        let newObj = getForm(this.filterSchema, this.refs);
        this.filter = { ...newObj };
        let grid = { ...this.state.grid };
        grid.filterObj = {
            columns: _map(grid.columns, 'columnName'),
            propertyId: this.props.topPIC.PropertyId,
            filter: this.filter,
            pageSize: this.pageSize
        }
        this.refs.livestockGrid.onSelectAll(false, []);
        this.stateSet({ filterText: this.generateFilterText(), grid: { ...grid }, selectedData: [], selectAll: false });
    }

    // check whether atleast one livestock selected to perform 
    // an action
    validateAtLeastOne() {
        if (this.state.selectedData.length > 0) {
            this.setLocalStorage();
            return true;
        }

        this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_AT_LEAST_ONE });
        return false;
    }

    validateOnlyMobOrEid() {
        if (this.state.selectedData.length > 0) {
            let compareType = this.state.selectedData[0].IsMob;
            // check if any EID is selected
            let res = this.state.selectedData.every(function (f) {
                return f.IsMob == compareType;
            });
            if (!res) this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.ONLY_EID_OR_MOB });
            return res;
        }

        this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_AT_LEAST_ONE });
        return false;
    }

    validateOnlyEid() {
        if (this.state.selectedData.length > 0) {
            // check if any EID is selected
            let res = this.state.selectedData.every((livestock) => {
                return livestock.IsMob == 0;
            });
            if (!res) this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_ONLY_EID });
            return res;
        }
        this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_AT_LEAST_ONE });
        return false;
    }

    // validate if livestock activity status is 
    // deceased/killed/lost
    validateActivityStatus() {
        let res = this.state.selectedData.every((livestock) => {
            return !(livestock.ActivitySystemCode == livestockActivityStatusCodes.Deceased ||
                livestock.ActivitySystemCode == livestockActivityStatusCodes.Killed ||
                livestock.ActivitySystemCode == livestockActivityStatusCodes.Lost);
        });
        if (!res) this.notifyToaster(NOTIFY_WARNING, { message: this.strings.INVALID_RECORD_LOST_STATUS });
        return res;
    }

    validateActiveStatus() {
        let res = this.state.selectedData.every((livestock) => {
            return (livestock.ActivitySystemCode == livestockActivityStatusCodes.Available);
        });
        if (!res) this.notifyToaster(NOTIFY_WARNING, { message: this.strings.ALLOW_ONLY_AVAILABLE_STATUS });
        return res;
    }

    // check if selected record are of individual/mob
    checkForSameType() {
        let type = this.state.selectedData[0].IsMob;
        let res = this.state.selectedData.every((livestock) => {
            return livestock.IsMob == type;
        });
        if (!res) this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_SAME_TYPE });
        return res;
    }

    // check if selected records have same species
    checkForSameSpecies() {
        let species = this.state.selectedData[0].SpeciesId;
        let res = this.state.selectedData.every((livestock) => {
            return livestock.SpeciesId == species;
        });
        if (!res) this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_SAME_SPECIES });
        return res;
    }

    // export selected livstocks to csv file
    exportLivestock() {
        if (this.validateAtLeastOne()) {
            browserHistory.replace('/livestock/export-livestock');
        }
    }

    // perform internal enclosure movement
    moveToEnclosure() {
        if (this.validateAtLeastOne()) {
            browserHistory.replace('/livestock/move-to-enclosure');
        }
    }

    // record scan result
    recordScan() {
        if (this.validateAtLeastOne()) {
            if (this.checkForSameSpecies()) {
                browserHistory.replace('/livestock/record-scan');
            }
        }
    }

    // record deceased
    recordDeceased() {
        // check if multiple mob is selected
        let mobs = this.state.selectedData.filter(function (f) {
            return f.IsMob == 1;
        });
        if (mobs.length > 1) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_ONLY_ONE });
            return false;
        }

        if (this.checkForSameType()) {
            this.setLocalStorage();
            browserHistory.replace('/livestock/record-deceased');
        }
    }

    // record lost tags
    recordLostTags() {
        if (this.validateAtLeastOne() && this.validateActivityStatus()) {
            this.stateSet({ openRecordLost: true });
        }
    }

    // record tag replacement
    recordTagReplacement() {
        if (this.validateOnlyEid()) {
            if (this.state.selectedData.length != 1) {
                this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_ONLY_ONE });
                return;
            }
            this.setLocalStorage();
            this.stateSet({ openRecordReplacement: true });
        }
    }

    recordCarcass() {
        if (this.state.selectedData.length != 1) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_ONLY_ONE });
            return;
        }
        if ((this.state.selectedData[0].ActivitySystemCode == livestockActivityStatusCodes.Deceased ||
            this.state.selectedData[0].ActivitySystemCode == livestockActivityStatusCodes.Killed)) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.INVALID_RECORD_CARCASS_STATUS });
            return;
        }
        this.setLocalStorage();
        browserHistory.replace('/livestock/record-carcass');
    }

    // record treatment on mob or livestock
    recordTreatment() {
        if (this.validateAtLeastOne() && this.checkForSameSpecies()) {
            browserHistory.replace('/livestock/record-treatment');
        }
    }

    // modify selected livestock or mob
    modifyLivestockClick() {
        if (this.validateAtLeastOne()) {
            if (this.state.selectedData.length > 1) {
                if (this.checkForSameType()) {
                    browserHistory.replace('/livestock/livestock-detail/modify-multiple');
                }
            }
            else {
                browserHistory.replace('/livestock/livestock-detail/modify');
            }
        }
    }

    // add new livestock or mob
    newLivestockClick() {
        browserHistory.replace('/livestock/livestock-detail/add');
    }

    // toggle selection of grid rows
    toggleSelection() {
        let selectAll = !this.state.selectAll;
        let grid = { ...this.state.grid };
        if (selectAll) {
            let _this = this;
            getAllLivestock(this.state.grid.filterObj, this.props.topSearch ? this.props.topSearch.searchText : null).then(function (res) {
                if (res.success) {
                    _this.refs.livestockGrid.onSelectAll(selectAll, []);
                    _this.stateSet({ selectedData: res.data, selectAll: selectAll });
                }
            }).catch(function (err) {
                _this.notifyToaster(NOTIFY_ERROR);
            });
        }
        else {
            this.refs.livestockGrid.onSelectAll(selectAll, []);
            this.stateSet({ selectedData: [], selectAll: selectAll });
        }
    }

    // Set row background color
    setBGColor(row) {
        return row["IsMob"] == 1 ? '#d0d0d0' : '#878787';
    }

    manipulateQty(cell, row) {
        return row["IsMob"] == 1 ? row['NumberOfHead'] : null
    }

    // display mob/livestock icon
    setIcon(cell, row) {
        let fileIcon = row["IsMob"] == 1 ? row['MobIcon'] : row['IndFileIcon'];
        return fileIcon ?
            <Livestock_Location
                propertyId={this.props.topPIC.PropertyId} notifyToaster={this.props.notifyToaster}
                mapNotExist={this.strings.MAP_NOT_EXIST}
                centerCords={row['DefaultGPS']} icon={fileIcon} /> : null;
    }

    // Handle grid selection
    rowSelect(selectedRow, row, isSelected) {
        let selectedData = [...this.state.selectedData];
        if (row.Id) {
            if (isSelected) {
                let obj = selectedData.find(r => r.Id == row.Id);
                if (!obj)
                    selectedData.push(row);
            }
            else
                selectedData = selectedData.filter(r => r.Id != row.Id);
        } else {
            if (isSelected)
                row.map(r => selectedData.push(r));
            else {
                row.map(r => {
                    let objIndex = selectedData.findIndex(x => x.Id == r.Id);
                    if (objIndex != -1)
                        selectedData.splice(objIndex, 1);
                });
            }
        }

        selectedData = _uniqBy(selectedData, 'Id');
        if (selectedData.length == 0)
            this.stateSet({ selectedData: [], selectAll: false });
        else
            this.stateSet({ selectedData: selectedData });
    }

    // selectedSpecies if operation to be on same specise livestock
    setLocalStorage(selectedSpecies) {
        localStorage.setItem(LocalStorageKeys.LivestockData, JSON.stringify({
            data: this.state.selectedData,
            propertyId: this.props.topPIC.PropertyId,
            Species: selectedSpecies
        }));
    }

    deleteLivestock() {
        let auditLogIds = [];
        let uuids = [];
        let selectedRows = this.state.selectedData;
        selectedRows.map(function (r) {
            uuids.push(r.Id);
            auditLogIds.push(r.AuditLogId);
        });

        this.props.hideConfirmPopup();
        let _this = this;
        deleteLivestock(uuids, auditLogIds).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: (_this.strings.DELETE_SUCCESS).replace('{{deletedCount}}', res.deletedCount).replace('{{totalCount}}', res.totalCount) });
                _this.refs.livestockGrid.onSelectAll(false, []);
                _this.refs.livestockGrid.refreshDatasource();
                _this.stateSet({ selectedData: [], selectAll: false });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: _this.strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    deleteLivestockClick() {
        if (gridActionNotify(this.strings, this.notifyToaster, this.state.selectedData.length, true)) {
            // pass custom payload with popup
            let payload = {
                confirmText: this.strings.DELETE_CONFIRMATION_MESSAGE,
                strings: this.strings.CONFIRMATION_POPUP_COMPONENT,
                onConfirm: this.deleteLivestock
            };
            this.props.openConfirmPopup(payload);
        }
    }

    // handle split mob action events
    splitMob() {
        if (this.state.selectedData.length != 1) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_ONLY_ONE });
            return true;
        }
        if (this.state.selectedData[0].IsMob == 0) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.SELECT_MOB_TO_SPLIT });
            return true;
        }
        if (this.state.selectedData[0].NumberOfHead < 2) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.INVALID_MOB_TO_SPLIT });
            return true;
        }
        browserHistory.replace('/livestock/split-mob/' + this.state.selectedData[0].Id);
    }

    // handle merge mob action events
    mergeMob() {
        if (this.state.selectedData.length < 2) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_AT_LEAST_TWO });
            return false;
        }
        if (this.checkForSameType() && this.checkForSameSpecies()) {
            this.setLocalStorage();
            browserHistory.replace('/livestock/merge-mob');
        }
    }

    showTags() {
        browserHistory.replace('/livestock/show-tags');
    }

    toggleRecordLost() {
        localStorage.removeItem(LocalStorageKeys.LivestockData);
        this.refs.livestockGrid.cleanSelected();
        this.stateSet({ selectedData: [] });
        this.stateSet({ openRecordLost: false });
    }

    toggleRecordTagReplacement() {
        localStorage.removeItem(LocalStorageKeys.LivestockData);
        this.refs.livestockGrid.cleanSelected();
        this.stateSet({ selectedData: [] });
        this.stateSet({ openRecordReplacement: false });
    }

    showFeedHistory() {
        if (this.state.selectedData.length == 0) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_AT_LEAST_ONE });
            return false;
        }
        if (this.state.selectedData.length > 1) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_ONLY_ONE });
            return false;
        }

        this.setLocalStorage();
        browserHistory.replace('/livestock/show-feed-history');
    }

    showTreatHistory() {
        if (this.state.selectedData.length == 0) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_AT_LEAST_ONE });
            return false;
        }
        if (this.state.selectedData.length > 1) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_ONLY_ONE });
            return false;
        }

        this.setLocalStorage();
        browserHistory.replace('/livestock/show-treat-history');
    }

    showWeightHistory() {
        if (this.state.selectedData.length == 0) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_AT_LEAST_ONE });
            return false;
        }
        if (this.state.selectedData.length > 1) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_ONLY_ONE });
            return false;
        }

        this.setLocalStorage();
        browserHistory.replace('/livestock/show-weight-history');
    }

    showTracebility() {
        if (this.state.selectedData.length == 0) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_AT_LEAST_ONE });
            return false;
        }
        if (this.state.selectedData.length > 1) {
            this.notifyToaster(NOTIFY_WARNING, { message: this.strings.COMMON.SELECT_ONLY_ONE });
            return false;
        }

        this.setLocalStorage();
        browserHistory.replace('/livestock/show-tracebility');
    }

    starteNVD() {
        if (this.state.selectedData.length > 0) {
            if (this.checkForSameSpecies() && this.validateOnlyMobOrEid() && this.validateActiveStatus()) {
                let selectedSpeices = this.data.species.filter((specy) => {
                    return specy.Id == this.state.selectedData[0].SpeciesId;
                })[0];
                this.setLocalStorage(selectedSpeices);
            }
            else
                return false;
        }

        browserHistory.replace('/envd/envd-detail');
    }

    // render header part
    renderHeader() {
        let filterCount = this.state.filterText != "" ? this.state.filterText.split(',').length : 0;
        let livestockCount = this.state.selectedData.length == 0 ? 0 : _sum(_map(this.state.selectedData, 'NumberOfHead'));
        return (
            <div className="dash-right-top">
                <div className="live-detail-main">
                    <div className="configure-head">
                        <span>{this.strings.TITLE}</span>
                    </div>
                    {this.state.dataFetch ? <div className="l-stock-top-btn">
                        <ul>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnFilter',
                                        label: (filterCount == 0 ? "" : "(" + filterCount + ") ").concat(this.strings.CONTROLS.FILTER_LABEL),
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={this.toggleFilter}
                                ></Button>
                            </li>
                            <li>
                                <Button
                                    inputProps={{
                                        name: 'btnSelectAll',
                                        label: this.state.selectAll == false ? this.strings.COMMON.SELECT_ALL : this.strings.COMMON.CLEAR,
                                        className: 'button3Style button30Style',
                                    }}
                                    onClick={this.toggleSelection}
                                ></Button>
                            </li>
                            {/*<li>
                                <Button
                                    inputProps={{
                                        name: 'btnActions',
                                        label: (livestockCount == 0 ? "" : livestockCount + " ").concat(this.strings.CONTROLS.ACTIONS_LABEL),
                                        className: 'button1Style button30Style',
                                    }}
                                    onClick={this.recordTreatment}
                                ></Button>
                            </li>*/}
                            <li>
                                <a href="javascript:void(0)" className="ripple-effect search-btn" data-toggle="dropdown">Actions</a>
                                <a href="javascript:void(0)" className="ripple-effect dropdown-toggle caret2" data-toggle="dropdown"> <span><img src={this.siteURL + "/static/images/caret-white.png"} /></span></a>
                                <ul className="dropdown-menu mega-dropdown-menu action-menu">
                                    <li className="col-md-3">
                                        <ul>
                                            <li><a href="javascript:void(0)" onClick={this.newLivestockClick}> New Livestock</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.modifyLivestockClick}> Modify Livestock</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.deleteLivestockClick}> Delete Livestock</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.exportLivestock}> Export Livestock</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.showTags}>Show Tags</a></li>
                                        </ul>
                                        <ul>
                                            <li className="dropdown-header">Desk</li>
                                            <li><a href="javascript:void(0)" onClick={() => browserHistory.replace('/importdesk')}> Import Desk</a></li>
                                            <li><a href="javascript:void(0)" onClick={() => browserHistory.replace('/importdesk/import-tag')}>Import Tags</a></li>
                                            {/*<li><a href="#"> NLIS Desk</a></li>*/}
                                        </ul>
                                    </li>
                                    <li className="col-md-3">
                                        <ul>
                                            <li className="dropdown-header">Record</li>
                                            <li><a href="javascript:void(0)" onClick={this.recordScan}>Record Scan</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.recordCarcass} >Record Carcass</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.recordTreatment} >Record Treatment</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.recordDeceased}>Record Deceased</a></li>
                                            <li><a href="javascript:void(0)" onClick={() => browserHistory.replace('/feed/record')}>Record Feed</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.recordLostTags}>Record Lost Tags</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.recordTagReplacement}>Record Tag Replacement</a></li>
                                        </ul>
                                        <ul>
                                            <li className="dropdown-header">Movement</li>
                                            <li><a href="javascript:void(0)" onClick={this.moveToEnclosure}>Move to Enclosure</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.starteNVD}>Start eNVD</a></li>
                                        </ul>
                                    </li>
                                    <li className="col-md-3">
                                        <ul>
                                            <li className="dropdown-header">Mob</li>
                                            <li><a href="javascript:void(0)" onClick={this.mergeMob}>Merge Mob</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.splitMob}>Split Mob</a></li>
                                        </ul>
                                    </li>
                                    <li className="col-md-3">
                                        <ul>
                                            <li className="dropdown-header">Show History</li>
                                            <li><a href="javascript:void(0)" onClick={this.showTracebility}> Show Traceability</a></li>
                                            <li><a href="javascript:void(0)" onClick={this.showWeightHistory}> Show Weigh History</a></li>
                                            {/*<li><a href="javascript:void(0)" onClick={this.showTreatHistory}> Show Treat History</a></li>*/}
                                            <li><a href="javascript:void(0)" onClick={this.showFeedHistory}> Show Feed History</a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div> : null}
                </div>
            </div >);
    }

    // render filter screen
    renderFilter() {
        let { CONTROLS } = this.props.strings;

        let filter = this.filter;
        return (<div className={"filter-open-box " + (this.state.displayFilter ? 'show' : 'hidden')}
            key={this.state.renderFilter}>
            <h2><img src={this.siteURL + "/static/images/filter-head-icon.png"} alt="icon" />
                {this.strings.COMMON.FILTERS_LABEL}
                <div className="f-close" onClick={this.toggleFilter}>
                    <img src={this.siteURL + "/static/images/close-icon2.png"} alt="close-icon" />
                </div>
            </h2>
            <div className="clearfix"></div>

            <Scrollbars autoHide autoHeight
                autoHeightMax={(typeof document === 'undefined') ? 500 : (document.body.clientHeight - 220)}>

                <RadioButton inputGroupProps={{ name: 'display', defaultSelected: filter.display }}
                    dataSource={[{ Value: '1', Text: 'Show All' },
                    { Value: '2', Text: 'Show Only EID' },
                    { Value: '3', Text: 'Show Only Mob' }]}
                    textField="Text" valueField="Value"
                    isClicked={this.state.isClicked} ref="display" />

                <Dropdown inputProps={{
                    name: 'activityStatus',
                    hintText: CONTROLS.ACTIVITY_STATUS_PLACEHOLDER,
                    floatingLabelText: CONTROLS.ACTIVITY_STATUS_TEXT,
                    value: filter.activityStatus
                }}
                    textField="NameCode" valueField="Id" dataSource={this.data.activityStatus}
                    isClicked={this.state.isClicked} ref="activityStatus" />

                <Dropdown inputProps={{
                    name: 'species',
                    hintText: CONTROLS.SPECIES_PLACEHOLDER,
                    floatingLabelText: CONTROLS.SPECIES_TEXT,
                    value: filter.species
                }}
                    textField="NameCode" valueField="Id" dataSource={this.data.species}
                    onSelectionChange={this.onSpeciesChange}
                    isClicked={this.state.isClicked} ref="species" />

                <div key={this.state.renderSpeciesFilter}>

                    <Dropdown inputProps={{
                        name: 'breed',
                        hintText: CONTROLS.BREED_PLACEHOLDER,
                        floatingLabelText: CONTROLS.BREED_TEXT,
                        value: filter.breed
                    }}
                        textField="NameCode" valueField="Id" dataSource={this.data.breed}
                        isClicked={this.state.isClicked} ref="breed" />


                    <Dropdown inputProps={{
                        name: 'speciesType',
                        hintText: CONTROLS.SPECIES_TYPE_PLACEHOLDER,
                        floatingLabelText: CONTROLS.SPECIES_TYPE_TEXT,
                        value: filter.speciesType
                    }}
                        textField="Name" valueField="Id" dataSource={this.data.speciesType}
                        isClicked={this.state.isClicked} ref="speciesType" />


                    <Dropdown inputProps={{
                        name: 'maturity',
                        hintText: CONTROLS.MATURITY_PLACEHOLDER,
                        floatingLabelText: CONTROLS.MATURITY_TEXT,
                        value: filter.maturity
                    }}
                        textField="NameCode" valueField="Id" dataSource={this.data.maturity}
                        isClicked={this.state.isClicked} ref="maturity" />

                </div>

                <Dropdown inputProps={{
                    name: 'gender',
                    hintText: CONTROLS.GENDER_PLACEHOLDER,
                    floatingLabelText: CONTROLS.GENDER_TEXT,
                    value: filter.gender
                }}
                    textField="NameCode" valueField="Id" dataSource={this.data.gender}
                    isClicked={this.state.isClicked} ref="gender" />


                <Dropdown inputProps={{
                    name: 'category',
                    hintText: CONTROLS.CATEGORY_PLACEHOLDER,
                    floatingLabelText: CONTROLS.CATEGORY_TEXT,
                    value: filter.category
                }}
                    textField="NameCode" valueField="Id" dataSource={this.data.category}
                    isClicked={this.state.isClicked} ref="category" />


                <Dropdown inputProps={{
                    name: 'enclosure',
                    hintText: CONTROLS.ENCLOSURE_PLACEHOLDER,
                    floatingLabelText: CONTROLS.ENCLOSURE_TEXT,
                    value: filter.enclosure
                }}
                    textField="NameCode" valueField="Id" dataSource={this.data.enclosure}
                    isClicked={this.state.isClicked} ref="enclosure" />


                <Dropdown inputProps={{
                    name: 'livestockOrigin',
                    hintText: CONTROLS.LIVESTOCK_ORIGIN_PLACEHOLDER,
                    floatingLabelText: CONTROLS.LIVESTOCK_ORIGIN_TEXT,
                    value: filter.livestockOrigin
                }}
                    textField="NameCode" valueField="Id" dataSource={this.data.livestockOrigin}
                    isClicked={this.state.isClicked} ref="livestockOrigin" />

                <CheckBox inputProps={{
                    name: 'financierOwned',
                    label: CONTROLS.FINANCIER_OWNED_LABEL,
                    defaultChecked: filter.financierOwned
                }}
                    className='auth-sign'
                    isClicked={this.state.isClicked} ref="financierOwned" />

                <NumberInput inputProps={{
                    name: 'dropBirthYear',
                    hintText: CONTROLS.DROP_BIRTH_YEAR_PLACEHOLDER,
                    floatingLabelText: CONTROLS.DROP_BIRTH_YEAR_TEXT
                }}
                    maxLength={4}
                    isClicked={this.state.isClicked} ref="dropBirthYear" />
                <br />

                <span>{CONTROLS.LT_STATUS_TEXT}</span>
                <RadioButton inputGroupProps={{ name: 'ltStatus', defaultSelected: filter.ltStatus }}
                    dataSource={livestockLTEUStatus}
                    textField="Text" valueField="Value" horizontalAlign={true}
                    isClicked={this.state.isClicked} ref="ltStatus" />
                <br />

                <span>{CONTROLS.EU_STATUS_TEXT}</span>
                <RadioButton inputGroupProps={{ name: 'euStatus', defaultSelected: filter.euStatus }}
                    dataSource={livestockLTEUStatus}
                    textField="Text" valueField="Value" horizontalAlign={true}
                    isClicked={this.state.isClicked} ref="euStatus" />
                <br />

            </Scrollbars>
            <div className="f-btn">
                <Button
                    inputProps={{
                        name: 'btnApplyFilter',
                        label: this.strings.CONTROLS.APPLY_FILTER_LABEL,
                        className: 'button1Style button30Style',
                    }}
                    fullWidth={true}
                    onClick={this.applyFilter}
                ></Button>
            </div>
            <div className="f-btn mt5">
                <Button
                    inputProps={{
                        name: 'btnClearFilter',
                        label: this.strings.CONTROLS.CLEAR_FILTER_LABEL,
                        className: 'button3Style button30Style',
                    }}
                    fullWidth={true}
                    onClick={this.clearFilter}
                ></Button>
            </div>
        </div >);
    }

    renderContent() {
        if (this.state.dataFetch) {
            let gridProps = {
                ...this.state.grid,
                selectAll: this.state.selectAll,
                functionName: 'livestock/getdataset',
                sortColumn: 'EID',
                sortOrder: 'asc',
                sizePerPageList: [10, 50, 100, 500, 1000],
                pageSize: this.pageSize,
                getExternalData: this.getGridData,
                searchText: this.props.topSearch ? this.props.topSearch.searchText : null,
                //setBGColor: this.setBGColor,

                // Settings for handle Select All button
                onRowSelect: this.rowSelect,
                selectedAllData: this.state.selectedData
            }
            return (
                <div className="stock-list">
                    <div className={"stock-list-cover " + (this.state.displayFilter ? 'filter-open' : '')}>
                        <div className="livestock-content">
                            <div className="cattle-text">
                                <span>{this.strings.DESCRIPTION}</span>
                                <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                            </div>
                            <div className="clear" ></div>
                            <div className="cattle-text">
                                <span dangerouslySetInnerHTML={{ __html: this.state.livestockData }}></span>
                                <span>{this.state.mobCount} Mob(s)</span>
                                <span>{this.state.livestockCount} Livestock(s)</span>
                            </div>
                            <div className="clear" ></div>
                            {this.state.filterText ? <div><div className="cattle-text">
                                <span dangerouslySetInnerHTML={{ __html: this.state.filterText }} ></span>
                                <Button inputProps={{
                                    name: 'btnClearFilter',
                                    label: this.strings.CONTROLS.CLEAR_FILTER_LABEL1,
                                    className: 'button3Style button30Style pull-right'
                                }} onClick={this.clearFilter}></Button>
                            </div><div className="clear" ></div></div> : null}
                            <ColumnVisible ref="columnVisible" columns={this.getDDLColumn()} changeEvent={this.columnVisibleChnage} />
                            <div key={this.state.renderGrid}>
                                <Grid ref="livestockGrid" {...gridProps} />
                            </div>
                        </div>
                        {this.renderFilter()}
                    </div>
                </div>)
        }
        else return <LoadingIndicator />;
    }

    render() {
        return (
            <div className="row">
                {this.renderHeader()}
                <div className="clear"></div>
                {this.renderContent()}
                <div className="clear"></div>
                {this.state.openRecordLost ?
                    <RecordLostTags
                        notifyToaster={this.props.notifyToaster}
                        strings={{ ...this.strings['RECORD-LOST-TAGS'], COMMON: this.strings.COMMON }}
                        toggleRecordLost={this.toggleRecordLost} />
                    : null}

                {this.state.openRecordReplacement ?
                    <RecordTagReplacement
                        notifyToaster={this.props.notifyToaster}
                        strings={{ ...this.strings['RECORD-TAG-REPLACEMENT'], COMMON: this.strings.COMMON }}
                        toggleRecordTagReplacement={this.toggleRecordTagReplacement} />
                    : null}
            </div>
        );
    }
}

export default Display;