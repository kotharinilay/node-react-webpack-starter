'use strict';

/**************************
 * tab component of LPA Questionnaire
 * **************************** */

import React, { Component } from 'react';

import TabLPACattle from './tab_lpa_cattle';
import TabLPAEUCattle from './tab_lpa_eucattle';
import TabLPAGoat from './tab_lpa_goat';
import TabLPASheep from './tab_lpa_sheep';
import TabLPABobbyCalves from './tab_lpa_bobbycalves';

import { getForm, isValidForm } from '../../../../../lib/wrapper-components/FormActions';
import { nvdTypes } from '../../../../../../shared/constants';

class TabLPA extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.getValues = this.getValues.bind(this);
    }

    getValues() {
        if (this.props.nvdType == nvdTypes.Cattle)
            return this.refs.tabLPACattle.getValues();
        if (this.props.nvdType == nvdTypes.Goat)
            return this.refs.tabLPAGoat.getValues();
        if (this.props.nvdType == nvdTypes.Sheep)
            return this.refs.tabLPASheep.getValues();
        if (this.props.nvdType == nvdTypes.EUCattle)
            return this.refs.tabLPAEUCattle.getValues();
        if (this.props.nvdType == nvdTypes['Bobby Calves'])
            return this.refs.tabLPABobbyCalves.getValues();
        else return null;
    }

    render() {
        let defaultProps = {
            notifyToaster: this.notifyToaster,
            isClicked: this.props.isClicked,
            disableAll: this.props.disableAll
        }
        if (this.props.nvdType == nvdTypes.Cattle) {
            return <TabLPACattle ref="tabLPACattle" {...defaultProps}
                editData={this.props.editData} strings={{ ...this.strings.CATTLE, COMMON: this.strings.COMMON }} />;
        }
        else if (this.props.nvdType == nvdTypes.Goat) {
            return <TabLPAGoat ref="tabLPAGoat" {...defaultProps}
                editData={this.props.editData} strings={{ ...this.strings.GOAT, COMMON: this.strings.COMMON }} />;
        }
        else if (this.props.nvdType == nvdTypes.Sheep) {
            return <TabLPASheep ref="tabLPASheep" {...defaultProps}
                editData={this.props.editData} strings={{ ...this.strings.SHEEP, COMMON: this.strings.COMMON }} />;
        }
        else if (this.props.nvdType == nvdTypes.EUCattle) {
            return <TabLPAEUCattle ref="tabLPAEUCattle" {...defaultProps}
                editData={this.props.editData} strings={{ ...this.strings.EUCATTLE, COMMON: this.strings.COMMON }} />;
        }
        else if (this.props.nvdType == nvdTypes['Bobby Calves']) {
            return <TabLPABobbyCalves ref="tabLPABobbyCalves" {...defaultProps}
                editData={this.props.editData} strings={{ ...this.strings.BOBBYCALVES, COMMON: this.strings.COMMON }} />;
        }
        else return null;
    }
}
export default TabLPA;