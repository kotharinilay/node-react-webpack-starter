'use strict';

/**************************
 * Index page for setup unit of measure Conversion
 * **************************** */

import React, { Component } from 'react';
import UomConversionDetail from './uomconversion_detail';
import UomConversionDisplay from './uomconversion_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class UomConversion extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <UomConversionDetail detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display unit of measure records in grid
            component = <UomConversionDisplay notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('UomConversion', UomConversion);