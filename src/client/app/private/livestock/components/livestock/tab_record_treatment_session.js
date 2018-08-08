'use strict';

/**************************
 * session listing tab component for record treatment
 * **************************** */

import React, { Component } from 'react';
import Grid from '../../../../../lib/core-components/Grid';

class TabSession extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.columns = [
            { field: 'Id', isKey: true, isSort: false, displayName: 'Session Id' },
            { field: 'SessionName', displayName: 'Session', visible: true },
            { field: 'Disease', displayName: 'Disease', visible: true },
            { field: 'Chemicals', displayName: 'Chemicals/Treats', visible: true, formatter: this.concatChemicalsTreats },
            { field: 'LastUsedOn', displayName: 'Last Used', visible: true, format: 'datetimeformat' }
        ];

        this.getSelectedSession = this.getSelectedSession.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // concate chemicals and treats columns
    concatChemicalsTreats(cell, row) {
        let chemTreats = '';
        if (row['Chemicals'])
            chemTreats += row['Chemicals'];
        if (row['Treats'])
            chemTreats += (chemTreats.length > 0 ? "<br />" : "") + row['Treats'];
        return "<div>" + chemTreats + "</div>";
    }

    // get selected rows from grid
    getSelectedSession() {
        return this.refs.sessionGrid.selectedRows;
    }

    render() {
        let gridProps = {
            columns: this.columns,
            filterObj: { companyId: this.props.companyId },
            functionName: 'treatmentsession/getdataset',
            sortOrder: 'asc',
            sortColumn: 'SessionName'
        }

        return (
            <div className="col-md-12">
                <div className="cattle-text">
                    <span>{this.strings.DESCRIPTION}</span>
                    <a href="#"><img src={this.siteURL + "/static/images/quest-mark-icon.png"} alt="icon" />{this.strings.HELP_LABEL}</a>
                </div>
                <div className="clear" ></div>
                <Grid {...gridProps} ref="sessionGrid" />
            </div>
        );
    }
}

export default TabSession;