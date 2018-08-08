'use strict';

/**************************
 * Index page for setup group
 * **************************** */

import React, { Component } from 'react';
import GroupDetail from './group_detail';
import GroupDisplay from './group_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class Group extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <GroupDetail
                detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display group records in grid
            component = <GroupDisplay
                notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupGroup', Group);