import React, { Component } from 'react';
import Render from 'react-dom';
import PureComponent from '../wrapper-components/PureComponent';
import Multiselect from 'react-bootstrap-multiselect';
//var Multiselect = require('react-bootstrap-multiselect');

class ColumnVisible extends PureComponent {
    constructor(props) {
        super(props);
        this.props = props;
        var dataSource = this.getDataSource();
        this.state = {
            dataSource: dataSource
        };
        //that.refs.myRef.syncData();
    }

    getDataSource() {
        var data = [];
        this.props.columns.map(column => {
            if (!column.isKey && column.displayName)
                data.push({ value: column.field, label: column.displayName, selected: column.visible });
        });
        return data;
    }

    onChange(event) {
        this.props.changeEvent(event.get()[0].value, event.get()[0].selected)
    }

    render() {
        return (
            <span className="multiselect-native-select">
                <Multiselect onChange={this.onChange.bind(this)} data={this.state.dataSource} maxHeight={200} multiple
                    buttonText={function (options, select) {
                        return 'Columns Filter';
                    }} />
            </span>
        )
    }
}

export default ColumnVisible