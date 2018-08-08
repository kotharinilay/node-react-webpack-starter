'use strict';

/**************************
 * Index page for setup species
 * **************************** */

import React, { Component } from 'react';
import SpeciesDetail from './species_detail';
import SpeciesDisplay from './species_display';
import Decorator from '../../../../lib/wrapper-components/AbstractDecorator';

class Species extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let { strings } = this.props;
        let component = null;
        if (this.props.params && this.props.params.detail) {
            component = <SpeciesDetail
                detail={this.props.params.detail}
                notifyToaster={this.props.notifyToaster}
                strings={{ ...strings.DETAIL, COMMON: strings.COMMON }} />;
        }
        else {
            component = <SpeciesDisplay
                notifyToaster={this.props.notifyToaster}
                openConfirmPopup={this.props.openConfirmPopup}
                hideConfirmPopup={this.props.hideConfirmPopup}
                openFindContact={this.props.openFindContact}
                topSearch={this.props.topSearch}
                strings={{ ...strings.DISPLAY, COMMON: strings.COMMON }} />
        }

        return (component);
    }
}

export default Decorator('SetupSpecies', Species);