

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import Button from '../../../../../lib/core-components/Button';
import Input from '../../../../../lib/core-components/Input';
import RadioButton from '../../../../../lib/core-components/RadioButton';

class ImportDeskIndex extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.strings = this.props.strings;

        this.onBack = this.onBack.bind(this);
        this.onProceed = this.onProceed.bind(this);
        this.importlist = [
            { Value: 'import-tag', Text: this.strings.CONTROLS.IMPORT_TAG_LABEL },
            { Value: 'import-carcass', Text: this.strings.CONTROLS.IMPORT_CARCASS_LABEL },
            { Value: 'import-deceased', Text: this.strings.CONTROLS.IMPORT_DECEASED_LABEL },
            { Value: 'import-property', Text: this.strings.CONTROLS.IMPORT_PROPERTY_LABEL }
        ];
        // this.importlist = [
        //     { Value: 'import-tag', Text: this.strings.CONTROLS.IMPORT_TAG_LABEL },
        //     { Value: 'import-livestock', Text: this.strings.CONTROLS.IMPORT_LIVESTOCK_LABEL },
        //     { Value: 'import-nvd-movement', Text: this.strings.CONTROLS.IMPORT_ENVD_MOVEMENT_LABEL },
        //     { Value: 'import-treatment', Text: this.strings.CONTROLS.IMPORT_TREATMENT_LABEL },
        //     { Value: 'import-carcass', Text: this.strings.CONTROLS.IMPORT_CARCASS_LABEL },
        //     { Value: 'import-deceased', Text: this.strings.CONTROLS.IMPORT_DECEASED_LABEL },
        //     { Value: 'import-trait', Text: this.strings.CONTROLS.IMPORT_TRAIT_LABEL },
        //     { Value: 'import-chemical-product', Text: this.strings.CONTROLS.IMPORT_CHEMICAL_PRODUCT_LABEL },
        //     { Value: 'import-grain-fodder', Text: this.strings.CONTROLS.IMPORT_GRAIN_FODDER_LABEL },
        //     { Value: 'import-company', Text: this.strings.CONTROLS.IMPORT_COMPANY_CONTACT_LABEL },
        //     { Value: 'import-property', Text: this.strings.CONTROLS.IMPORT_PROPERTY_LABEL },
        //     { Value: 'import-enclosure', Text: this.strings.CONTROLS.IMPORT_ENCLOSURE_LABEL },
        //     { Value: 'import-livestock-replacement', Text: this.strings.CONTROLS.IMPORT_LIVESTOCK_REPLACEMENT_LABEL },
        //     { Value: 'import-lost-tags', Text: this.strings.CONTROLS.IMPORT_LOST_TAGS_LABEL },
        // ];
    }

    onBack() {
        browserHistory.replace('/livestock');
    }

    onProceed() {
        this.refs.importlist;
        browserHistory.replace('/importdesk/' + this.refs.importlist.fieldStatus.value);
    }

    render() {
        return (
            <div className="row">
                <div className="dash-right-top">
                    <div className="live-detail-main">
                        <div className="configure-head"> <span>{this.strings.TITLE}</span> </div>
                        <div className="l-stock-top-btn">
                            <Button
                                inputProps={{
                                    name: 'btnCancel',
                                    label: this.strings.CONTROLS.CANCEL_LABEL,
                                    className: 'button1Style button30Style mr10'
                                }}
                                onClick={this.onBack} ></Button>
                            <Button
                                inputProps={{
                                    name: 'btnSave',
                                    label: this.strings.CONTROLS.PROCEED_LABEL,
                                    className: 'button2Style button30Style'
                                }}
                                onClick={this.onProceed} ></Button>
                        </div>
                    </div>
                </div>
                <div className="clear"></div>
                <div className="stock-list">
                    <div className="stock-list-cover">
                        <div className="livestock-content">
                            <div className="cattle-text">
                                <span>{this.strings.DESCRIPTION}</span>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <Input inputProps={{
                                        name: 'pic',
                                        hintText: this.strings.CONTROLS.PIC_PLACEHOLDER,
                                        floatingLabelText: this.strings.CONTROLS.PIC_PLACEHOLDER,
                                        disabled: true
                                    }}
                                        initialValue={this.props.topPIC.PIC}
                                        isClicked={false} ref="pic" />
                                </div>
                                <div className="col-md-6">
                                    <Input inputProps={{
                                        name: 'propertyName',
                                        hintText: this.strings.CONTROLS.PROPERTY_NAME_PLACEHOLDER,
                                        floatingLabelText: this.strings.CONTROLS.PROPERTY_NAME_LABEL,
                                        disabled: true
                                    }}
                                        initialValue={this.props.topPIC.Name}
                                        isClicked={false} ref="propertyName" />
                                </div>
                            </div>
                            <div className="clear"></div>
                            <div className="row">
                                <div className="col-md-12 mt15 mb15">
                                    {this.strings.CHOOSE_ACTION_MESSAGE}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <RadioButton inputGroupProps={{ name: 'importlist', defaultSelected: 'import-tag' }}
                                        dataSource={this.importlist}
                                        textField="Text" valueField="Value"
                                        isClicked={false} ref="importlist" />
                                </div>
                            </div>
                            <div className="clear"></div>
                        </div>
                    </div>
                    <div className="clear"></div>
                </div>
            </div >
        );
    }
}

export default ImportDeskIndex;