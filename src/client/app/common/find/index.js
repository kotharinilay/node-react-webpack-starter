'use strict';

/******************************************
 * Find Popup Component
 * Global find components utility which can be used
 * over any form
 ******************************************/

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { notifyToaster, hideFindCompany, hideFindContact, hideFindPIC } from '../../common/actions';
import Decorator from '../../../lib/wrapper-components/AbstractDecorator';

import FindCompany from './components/Company';
import FindContact from './components/Contact';
import FindPIC from './components/PIC';

class FindIndex extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        let { strings } = this.props;
        let propertyComponent = null, contactComponent = null, companyComponent = null;

        if (this.props.property == true)
            propertyComponent = <FindPIC strings={strings.FIND_PIC} {...this.props.findPIC} notifyToaster={this.props.notifyToaster} hideFindPIC={this.props.hideFindPIC} />;
        if (this.props.company == true)
            companyComponent = <FindCompany strings={strings.FIND_COMPANY} {...this.props.findCompany} notifyToaster={this.props.notifyToaster} hideFindCompany={this.props.hideFindCompany} />;
        if (this.props.contact == true)
            contactComponent = <FindContact strings={strings.FIND_CONTACT} companyName={this.props.companyName} {...this.props.findContact} notifyToaster={this.props.notifyToaster} hideFindContact={this.props.hideFindContact} />;

        return (
            <div>
                {companyComponent}
                {propertyComponent}
                {contactComponent}
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        findCompany: state.common.findCompany,
        findContact: state.common.findContact,
        findPIC: state.common.findPIC
    }
}

let mapDispatchToProps = (dispatch) => {
    return {
        hideFindCompany: (payload) => { dispatch(hideFindCompany(payload)) },
        hideFindContact: (payload) => { dispatch(hideFindContact(payload)) },
        hideFindPIC: (payload) => { dispatch(hideFindPIC(payload)) },
        notifyToaster: (type, options) => { dispatch(notifyToaster(type, options)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Decorator('Common', FindIndex));