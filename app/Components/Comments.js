import React, { Component } from 'react';
import Render from 'react-dom';

import Grid from './BGrid';
import Photos from './Photos';

class Comments extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [{
                field: 'id',
                isKey: true,
                isSort: true,
                displayName: 'Comment ID',
                visible: false,
                filter: { type: "NumberFilter" }
            }, {
                field: 'name',
                isKey: false,
                isSort: true,
                displayName: 'Comment Name',
                visible: true,
                filter: { type: "TextFilter" }
            }, {
                field: 'email',
                isKey: false,
                isSort: true,
                displayName: 'E Mail',
                visible: true,
                filter: { type: "TextFilter" }
            }, {
                field: 'body',
                isKey: false,
                isSort: true,
                displayName: 'Body',
                visible: true,
                filter: { type: "TextFilter" }
            }],
            functionName: 'comments'
        }
    }

    render() {
        return (<div>
            <Grid {...this.state} />
        </div>
        )
    }
}

export default Comments