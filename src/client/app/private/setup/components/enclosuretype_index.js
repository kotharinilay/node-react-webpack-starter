'use strict';

/**************************
 * Index page for setup enclosure type
 * **************************** */

import React, { Component } from 'react';
import EnclosureTypeDetail from './enclosuretype_detail';
import EnclosureTypeDisplay from './enclosuretype_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class EnclosureType extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <EnclosureTypeDetail detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display enclosure type records in grid
            component = <EnclosureTypeDisplay notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupEnclosureType', EnclosureType);