'use strict';

/**************************
 * Index page for setup gender
 * **************************** */

import React, { Component } from 'react';
import GenderDetail from './gender_detail';
import GenderDisplay from './gender_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class Gender extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <GenderDetail detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display gender records in grid
            component = <GenderDisplay
                notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                  topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupGender', Gender);