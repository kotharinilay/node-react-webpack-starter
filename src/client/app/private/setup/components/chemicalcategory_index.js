'use strict';

/**************************
 * Index page for setup chemical category
 * **************************** */

import React, { Component } from 'react';
import ChemicalCategoryDetail from './chemicalcategory_detail';
import ChemicalCategoryDisplay from './chemicalcategory_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class ChemicalCategory extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <ChemicalCategoryDetail
                detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display chemical category records in grid
            component = <ChemicalCategoryDisplay
                notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                  topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupChemicalCategory', ChemicalCategory);