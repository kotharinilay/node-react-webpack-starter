'use strict';

/**************************
 * Display issues in grid
 * **************************** */

import React, { Component } from 'react';
import Grid from '../../../../../lib/core-components/Grid';
import firebaseInit from '../../../../../firebase-setup';

class ImportProperty extends Component {
    constructor(props) {
        super(props);

        this.importDataCount = 0;
        this.state = {
            invalidData: []
        }

        this.invalidDataColumns = [
            { field: 'line', width: '150px', displayName: 'Line Number', visible: true, isKey: true },
            { field: 'issues', displayName: 'Issues', visible: true }
        ];

        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentDidMount() {
        let _this = this;
        firebaseInit.firebaseObj.ref().child(this.props.path).on("child_added", function (row) {
            let invalidData = _this.state.invalidData;
            let firebaseData = row.val();
            invalidData = invalidData.concat(firebaseData);
            _this.stateSet({ invalidData: invalidData });
        });
    }

    componentWillUnmount() {
        this.mounted = false;
        firebaseInit.firebaseObj.ref().child(this.props.path).off("child_added", function (row) {
            //console.log(row);
        });
    }

    render() {
        this.importDataCount = this.props.totalRecords - this.state.invalidData.length - 1;
        return (<div>
            {this.props.displayMsg ?
                <span className="control-label picture-lbl">
                    After validation, {this.importDataCount} records will be imported. {this.state.invalidData.length} records has reported below issues.<br />
                    You can correct issues in CSV file and import again after going back to previous screen or press "Next" button to continuew on.
            </span> : null}
            <Grid minHeight="300px" isRemoteData={false} selectRowMode="none"
                columns={this.invalidDataColumns} gridData={this.state.invalidData} />
        </div>);
    }
}

export default ImportProperty;