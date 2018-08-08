'use strict';

/**************************
 * display accessible PIC to user
 * **************************** */

import React, { Component } from 'react';
import Grid from '../../../../lib/core-components/Grid';
import { formatDateTime } from '../../../../../shared/format/date';

class AccessiblePICsTab extends Component {
    constructor(props) {
        super(props);

        this.strings = this.props.strings;

        this.state = {
            columns: [
                { field: 'UUID', isKey: true, isSort: false, displayName: 'Property Id' },
                { field: 'PIC', displayName: 'PIC', isSort: false, visible: true },
                { field: 'Name', displayName: 'Property Name', isSort: false, visible: true },
                { field: 'Suburb', displayName: 'Suburb', isSort: false, visible: true },
                { field: 'Role', displayName: 'Role', isSort: false, visible: true },
                { field: 'ValidFromDate', displayName: 'ValidFromDate', isSort: false },
                { field: 'ValidToDate', displayName: 'ValidToDate' },
                { field: '', displayName: 'Period', visible: true, isSort: false, formatter: this.formatPeriod },
            ],
            functionName: 'user/accessiblepics',
            filterObj: this.props.detail
        }
    }

    formatPeriod(cell, row) {
        if (row.ValidFromDate && row.ValidToDate) {
            let fromDate = formatDateTime(row.ValidFromDate).ShortDate;
            let toDate = formatDateTime(row.ValidToDate).ShortDate;
            return `${fromDate} to ${toDate}`;
        }
        return '';
    }

    render() {
        return (
            <div className="col-md-12">
                <Grid ref="accessiblePICsGrid" {...this.state} pagination={false}
                    minHeight="300px" selectRowMode="none" />
            </div>
        );
    }
}

export default AccessiblePICsTab;