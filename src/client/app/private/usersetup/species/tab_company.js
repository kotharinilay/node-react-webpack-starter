'use strict';

/**************************
 * Company tab to display species
 * **************************** */

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import Grid from '../../../../lib/core-components/Grid';

class CompanyTab extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.state = {
            columns: [
                { field: 'Id', isKey: true },
                { field: 'SpeciesName', displayName: 'Species Name', visible: true },
                { field: 'SpeciesCode', displayName: 'Species Code', visible: true }
            ]
        }

        this.rowSelect = this.rowSelect.bind(this);
    }

    // Handle grid selection
    rowSelect(selectedRow, row, isSelected) {
        this.props.updateResult(selectedRow, row, isSelected, null, true);
    }

    // Render company tab
    render() {

        let selectedRows = [];
        let selectedRowsObj = [];
        let resultData = this.props.data.resultData.company;
        this.props.data.species.map(s => {
            let rowObj = resultData.find(x => x == s.Id);
            if (!rowObj) {
                selectedRowsObj.push(s);
                selectedRows.push(s.Id);
            }
        });

        let gridProps = {
            columns: this.state.columns,
            isRemoteData: false,
            gridData: this.props.data.species,
            onRowSelect: this.rowSelect,
            selectedRows: selectedRowsObj,
            selected: selectedRows
        }
        return (
            <div className="col-md-12">
                <Grid ref="companyGrid" {...gridProps} />
            </div>
        );
    }
}


export default CompanyTab;