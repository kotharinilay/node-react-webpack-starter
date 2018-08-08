'use strict';

/**************************
 * Index page for setup maturity
 * **************************** */

import React, { Component } from 'react';
import MaturityDetail from './maturity_detail';
import MaturityDisplay from './maturity_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class Maturity extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <MaturityDetail
                detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display maturity records in grid
            component = <MaturityDisplay
                notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                  topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupMaturity', Maturity);