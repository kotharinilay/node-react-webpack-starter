
import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { map } from 'lodash';

import Button from '../../../../lib/core-components/Button';
import BusyButton from '../../../../lib/wrapper-components/BusyButton';
import ToggleSwitch from '../../../../lib/core-components/ToggleSwitch';
import LoadingIndicator from '../../../../lib/core-components/LoadingIndicator';

import { getPreferredWidgets, updatePreferredWidgets } from '../../../../services/private/dashboard';
import { NOTIFY_SUCCESS, NOTIFY_ERROR } from '../../../common/actiontypes';

class ConfigureDashboard extends Component {

    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.siteURL = window.__SITE_URL__;

        this.state = {
            dataFetch: false
        }
        this.widgets = [];
        this.maxOrder = 0;
        this.onSave = this.onSave.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onToggleChange = this.onToggleChange.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    // Handle save button click
    onSave() {
        let { strings } = this.props;
        let _this = this;
        let widgets = [];
        map(this.widgets, (d, index) => {
            if (d['Value'] == true) {
                d['Order'] = (d['Order'] == 0) ? (this.maxOrder += 1) : d['Order'];
                widgets.push(d['Key'], d['Order']);
            }
            else
                d['Order'] = 0;
        });
        return updatePreferredWidgets(widgets).then(function (res) {
            if (res.success) {
                _this.props.notifyToaster(NOTIFY_SUCCESS, { message: strings.SUCCESS });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings });
            }
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Handle back button click
    onBack() {
        browserHistory.push('/dashboard');
    }

    // Handle toggle change events
    onToggleChange(name, value) {
        map(this.widgets, (d, index) => {
            if (d['Key'] == name)
                d['Value'] = value;
        });
    }

    // Update widgets based on user selection (Get data using api)
    componentWillMount() {
        this.mounted = true;
        let { strings } = this.props;
        let _this = this;
        getPreferredWidgets(true).then(function (res) {
            if (res.success) {
                _this.maxOrder = res.maxOrder;
                _this.widgets = res.widgets;
                _this.stateSet({ dataFetch: true });
            }
            else if (res.badRequest) {
                _this.props.notifyToaster(NOTIFY_ERROR, { message: res.error, strings: strings });
                _this.maxOrder = 0;
                _this.widgets = [];
            }
        }).catch(function (err) {
            _this.stateSet({ dataFetch: true });
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Render widgets based on json file and user configure values
    renderWidgets(strings) {
        if (this.state.dataFetch) {
            return (map(this.widgets, (d, index) =>
                <div key={index} className="col-md-3">
                    <div className={"configure-livestock " + d['Bgclass']}>
                        <span>
                            {d['Image'] != "" ? <img src={this.siteURL + '/static/images/widgets/' + d['Image']} alt={d['Key']} /> : ''}
                            {strings.WIDGETS[d['Key']] ? strings.WIDGETS[d['Key']] : d['Title']}
                        </span>
                        <div className="togglebutton">
                            <label>
                                <ToggleSwitch inputProps={{
                                    name: d['Key']
                                }}
                                    initialValue={d['Value']}
                                    onToggleChange={this.onToggleChange} />
                            </label>
                        </div>
                    </div>
                </div>));
        }
        else {
            return <LoadingIndicator onlyIndicator={true} />;
        }
    }

    // Render widgets component
    render() {
        let { strings } = this.props;
        return (<div className="dash-right">
            <div className="dash-right-top">
                <div className="configured-main">
                    <div className="configure-head">
                        <span>{strings.TITLE}</span>
                    </div>
                    <div className="configure-right">
                        <Button
                            inputProps={{
                                name: 'btnBack',
                                label: strings.CONTROLS.BACK_LABEL,
                                className: 'button1Style button30Style mr10'
                            }}
                            onClick={this.onBack} ></Button>
                        <BusyButton
                            inputProps={{
                                name: 'btnSave',
                                label: strings.CONTROLS.SAVE_LABEL,
                                className: 'button2Style button30Style'
                            }}
                            loaderHeight={25}
                            onClick={this.onSave} ></BusyButton>
                    </div>
                </div>
            </div>
            <div className="configure-dash-cnt">
                <div className="configure-dash-cnt-inner">
                    {this.renderWidgets(strings)}
                </div>
            </div>
            <div className="clear"></div>
        </div>);
    }
}

export default ConfigureDashboard;