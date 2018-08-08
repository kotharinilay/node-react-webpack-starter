'use strict';

/**************************
 * Index page for setup Death Reason
 * **************************** */

import React, { Component } from 'react';
import DeathReasonDetail from './deathreason_detail';
import DeathReasonDisplay from './deathreason_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class DeathReason extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <DeathReasonDetail detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display Death Reason records in grid
            component = <DeathReasonDisplay notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                  topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupDeathReason', DeathReason);