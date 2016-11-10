import React, { Component } from 'react';
import Render from 'react-dom';
var Multiselect = require('react-bootstrap-multiselect');

class ColumnVisible extends Component {
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
        debugger;
        var data = [];
        this.props.columns.map(column => {
            data.push({ value: column.field, label: column.displayName, selected: column.visible });
        });
        return data;
    }

    onChange(event) {
        debugger;
        this.props.changeEvent(event.context.value, event.get()[0].selected)
    }

    // bindHTML() {
    //     return (this.props.columns.map(column => {
    //         if (!column.isKey) {
    //             return <label key={column.field} ><input type="checkbox" ref={column.field}
    //                 name={column.field} checked={column.visible}
    //                 onChange={this.onChange.bind(this)} />
    //                 {column.displayName}
    //             </label>
    //         }
    //     }));
    // }

    render() {
        return (
            <span className="multiselect-native-select">
                <Multiselect onChange={this.onChange.bind(this)} data={this.state.dataSource} maxHeight={200} multiple
                    buttonText={function (options, select) {
                        return 'Visible Columns';
                    } } />
            </span>
        )
    }
}

export default ColumnVisible