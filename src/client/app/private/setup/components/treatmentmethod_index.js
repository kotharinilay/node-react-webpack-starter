'use strict';

/**************************
 * Index page for setup Treatment Method
 * **************************** */

import React, { Component } from 'react';
import TreatmentMethodDetail from './treatmentmethod_detail';
import TreatmentMethodDisplay from './treatmentmethod_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class TreatmentMethod extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <TreatmentMethodDetail detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display Treatment Method records in grid
            component = <TreatmentMethodDisplay notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                  topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupTreatmentMethod', TreatmentMethod);