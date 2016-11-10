import React, { Component } from 'react';
import Render from 'react-dom';

import Grid from './Grid';

class Photos extends Component {
    constructor() {
        super();

        this.state = {

            columns: [{
                field: 'id',
                isKey: true,
                isSort: true,
                displayName: 'Comment ID',
                visible: false,
                filter: { type: "NumberFilter" }
            }, {
                field: 'title',
                isKey: false,
                isSort: true,
                displayName: 'Title',
                visible: true,
                filter: { type: "TextFilter" }
            }, {
                field: 'thumbnailUrl',
                isKey: false,
                isSort: true,
                displayName: 'Image',
                format: 'imageFormat',
                visible: true
            }],
            functionName: 'photos'
        }
    }

    render() {
        return (
            <Grid {...this.state} />
        )
    }
}

export default Photos