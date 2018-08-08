'use strict';

/**************************
 * Index page for setup species type
 * **************************** */

import React, { Component } from 'react';
import SpeciesTypeDetail from './speciestype_detail';
import SpeciesTypeDisplay from './speciestype_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class SpeciesType extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <SpeciesTypeDetail detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display species type records in grid
            component = <SpeciesTypeDisplay notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                  topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupSpeciesType', SpeciesType);