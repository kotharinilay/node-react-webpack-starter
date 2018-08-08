'use strict';

/**************************
 * Index page for setup chemical product
 * **************************** */

import React, { Component } from 'react';
import ChemicalProductDetail from './chemicalproduct_detail';
import ChemicalProductDisplay from './chemicalproduct_display';
import Decorator from '../../../../../lib/wrapper-components/AbstractDecorator';

class ChemicalProduct extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {strings} = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            // 'detail' parameter is 'new' for add mode and UUID for edit mode
            component = <ChemicalProductDetail detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}                
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            // display chemical product records in grid
            component = <ChemicalProductDisplay notifyToaster={this.props.notifyToaster}
            topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupChemicalProduct', ChemicalProduct);