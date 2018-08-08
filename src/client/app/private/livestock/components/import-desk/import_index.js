'use strict';

/**************************
 * Index page for import facility
 * **************************** */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { openConfirmPopup, hideConfirmPopup, notifyToaster } from '../../../../common/actions';
import Decorator from '../../../../../lib/wrapper-components/AbstractDecorator';
import { importCSVComponent as componentSet } from '../../../../../../shared/csv';

class ImportDesk extends Component {
    constructor(props) {
        super(props);
        this.loadComponent = null;
        this.requireComponent = this.requireComponent.bind(this);
        // this.detailPage = this.props.params && this.props.params.detail ? this.props.params.detail : null;
    }

    componentWillMount() {
        this.requireComponent(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.requireComponent(nextProps);
    }

    requireComponent(props) {
        if (props.params && props.params.detail) {
            this.detailPage = props.params.detail;
            // Load component based on url
            this.loadComponent = require('./' + props.params.detail).default;
        }
        else {
            this.detailPage = 'import-desk';
            // Default load livestock display page
            this.loadComponent = require('./import-desk').default;
        }
    }

    render() {
        let defaultProps = {
            openConfirmPopup: this.props.openConfirmPopup,
            hideConfirmPopup: this.props.hideConfirmPopup,
            notifyToaster: this.props.notifyToaster,
            topPIC: this.props.topPIC
        }
        let { strings } = this.props;
        return (<div className="dash-right">
            <div className='col-md-12'>
                <this.loadComponent
                    CompanyId={this.props.CompanyId} IsAgliveSupportAdmin={this.props.IsAgliveSupportAdmin}
                    strings={{ ...strings.CONTROLS, ...strings.COMMON, ...strings[this.detailPage.toUpperCase()], COMMON: strings.COMMON }}
                    {...defaultProps} />
            </div>
        </div>);
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        openConfirmPopup: (info) => {
            dispatch(openConfirmPopup(info))
        },
        hideConfirmPopup: (info) => {
            dispatch(hideConfirmPopup(info))
        },
        notifyToaster: (type, options) => {
            dispatch(notifyToaster(type, options))
        }
    }
}

const mapStateToProps = (state) => {
    return {
        CompanyId: state.authUser.CompanyId,
        IsAgliveSupportAdmin: state.authUser.IsAgliveSupportAdmin,
        topPIC: state.header.topPIC,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Decorator('ImportDesk', ImportDesk));