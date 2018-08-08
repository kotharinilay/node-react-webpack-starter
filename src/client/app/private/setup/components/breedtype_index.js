'use strict';

/**************************
 * Index page for setup breed type
 * **************************** */

import React, { Component } from 'react';
import BreedTypeDetail from './breedtype_detail';
import BreedTypeDisplay from './breedtype_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class BreedType extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <BreedTypeDetail
                detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display breed type records in grid
            component = <BreedTypeDisplay
                notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupBreedType', BreedType);