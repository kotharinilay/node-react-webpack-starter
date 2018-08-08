'use strict';

/**************************
 * Index page for setup Treatment Type
 * **************************** */

import React, { Component } from 'react';
import TreatmentTypeDetail from './treatmenttype_detail';
import TreatmentTypeDisplay from './treatmenttype_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class TreatmentType extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <TreatmentTypeDetail detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display Treatment Type records in grid
            component = <TreatmentTypeDisplay notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                  topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupTreatmentType', TreatmentType);