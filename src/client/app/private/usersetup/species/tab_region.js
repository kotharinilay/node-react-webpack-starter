'use strict';

/**************************
 * Region tab to display species
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Grid from '../../../../lib/core-components/Grid';

class RegionTab extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.state = {
            columns: [
                { field: 'Id', isKey: true },
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
        let id = row.RegionId ? row.RegionId : row[0].RegionId;
        this.props.updateResult(selectedRow, row, isSelected, id, false, true);
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
        let resultData = this.props.data.resultData.region;
        row.expandData.map(s => {
            let rowObj = resultData.find(x => x.Region == row.expandData[0].RegionId && x.Id.length > 0 && x.Id.includes(s.Id));
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


    // Render region tab
    render() {
        let gridProps = {
            selectRowMode: 'none',
            columns: this.state.columns,
            isRemoteData: false,
            gridData: this.props.data.region,
            clickToExpand: true,
            expandableRow: this.expandableRow,
            expandComponent: this.expandComponent,
            expandColumnVisible: true
        }
        return (
            <div className="col-md-12">
                <Grid ref="regionGrid" {...gridProps} />
            </div>
        );
    }
}


export default RegionTab;