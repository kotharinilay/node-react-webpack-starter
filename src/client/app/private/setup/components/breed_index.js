'use strict';

/**************************
 * Index page for setup breed
 * **************************** */

import React, { Component } from 'react';
import BreedDetail from './breed_detail';
import BreedDisplay from './breed_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class BreedIndex extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <BreedDetail
                detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display breed records in grid
            component = <BreedDisplay
                notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupBreed', BreedIndex);