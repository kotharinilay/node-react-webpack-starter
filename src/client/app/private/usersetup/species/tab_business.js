'use strict';

/**************************
 * Business tab to display species
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Grid from '../../../../lib/core-components/Grid';

class BusinessTab extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.state = {
            columns: [
                { field: 'Id', isKey: true },
                { field: 'BusinessName', displayName: 'Business', visible: true },
                { field: 'RegionName', displayName: 'Region', visible: true }
            ],
            subColumns: [
                { field: 'Id', isKey: true },
                { field: 'SpeciesName', displayName: 'Species Name', visible: true },
                { field: 'SpeciesCode', displayName: 'Species Code', visible: true }
            ]
        }

        this.rowSelect = this.rowSelect.bind(this);

        this.expandableRow = this.expandableRow.bind(this);
        this.expandComponent = this.expandComponent.bind(this);
    }

    // Handle grid selection
    rowSelect(selectedRow, row, isSelected) {
        let id = row.BusinessId ? row.BusinessId : row[0].BusinessId;
        this.props.updateResult(selectedRow, row, isSelected, id, false, false, true);
    }


    /*--------- Bind nested grid start --------------*/

    // Return for bind nested grid
    expandableRow(row) {
        return true;
    }

    // Bind nested grid
    expandComponent(row) {

        let selectedRows = [];
        let selectedRowsObj = [];
        let resultData = this.props.data.resultData.business;
        row.expandData.map(s => {
            let rowObj = resultData.find(x => x.Business == row.expandData[0].BusinessId && x.Id.length > 0 && x.Id.includes(s.Id));
            if (!rowObj) {
                selectedRowsObj.push(s);
                selectedRows.push(s.Id);
            }
        });

        let gridProps = {
            columns: this.state.subColumns,
            isRemoteData: false,
            gridData: row.expandData,
            onRowSelect: this.rowSelect,
            selectedRows: selectedRowsObj,
            selected: selectedRows
        }

        return (<Grid {...gridProps} />);
    }

    /*--------- Bind nested grid end --------------*/


    // Render business tab
    render() {
        let gridProps = {
            selectRowMode: 'none',
            columns: this.state.columns,
            isRemoteData: false,
            gridData: this.props.data.business,
            clickToExpand: true,
            expandableRow: this.expandableRow,
            expandComponent: this.expandComponent,
            expandColumnVisible: true
        }
        return (
            <div className="col-md-12">
                <Grid ref="businessGrid" {...gridProps} />
            </div>
        );
    }
}


export default BusinessTab;