'use strict';

/**************************
 * add/update tab for chemical product
 * **************************** */

import React, { Component } from 'react';
import WHPTab from './WHP_tabcomponent';
import ESITab from './ESI_tabcomponent';
import Input from '../../../../../lib/core-components/Input';
import Multipicker from '../../../../../lib/core-components/Multipicker';
import Dropdown from '../../../../../lib/core-components/Dropdown';
import { getAllChemicalCategory, getAllSpecies } from '../../../../../services/private/setup';
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import { bufferToUUID } from '../../../../../../shared/uuid';
import LoadingIndicator from '../../../../../lib/core-components/LoadingIndicator';

class ChemicalProductTab extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);
        this.strings = this.props.strings;
        this.addMode = (this.props.detail == 'new');
        this.state = {
            chemicalCategoryData: [],
            speciesData: [],
            tabKey: 'tabWHP',
            dataFetch: false
        }
        this.tabChanged = this.tabChanged.bind(this);
    }

    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        let objResponse = {};
        return Promise.all([
            getAllSpecies().then(function (res) {
                if (res.success) {
                    objResponse.speciesData = res.data;
                }
            }),
            getAllChemicalCategory().then(function (res) {
                if (res.success) {
                    objResponse.chemicalCategoryData = res.data;
                }
            })
        ]).then(function (resPromise) {
            _this.stateSet({
                speciesData: objResponse.speciesData,
                chemicalCategoryData: objResponse.chemicalCategoryData,
                dataFetch: true
            });
        }).catch(function (err) {
            _this.props.notifyToaster(NOTIFY_ERROR);
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    tabChanged(key) {
        this.setState({ tabKey: key });
    }

    renderForm() {
        if (this.state.dataFetch) {
            return (<div>
                <div className="col-md-6">
                    <Input inputProps={{
                        name: 'chemicalproductName',
                        hintText: this.strings.CONTROLS.CHEMICALPRODUCT_PLACEHOLDER,
                        floatingLabelText: this.strings.CONTROLS.CHEMICALPRODUCT_LABEL
                    }}
                        maxLength={50} initialValue={this.props.chemicalProduct ? this.props.chemicalProduct.Name : ''}
                        eReq={this.strings.CONTROLS.CHEMICALPRODUCT_REQ_MESSAGE}
                        isClicked={this.props.isClicked} ref="chemicalproductName" />

                    <Dropdown inputProps={{
                        name: 'chemicalcategory',
                        hintText: this.strings.CONTROLS.CHEMICALPRODUCT_CHEMICALCATEGORY_PLACEHOLDER,
                        value: this.props.chemicalProduct ? bufferToUUID(this.props.chemicalProduct.ProductCategoryId.data) : null
                    }}
                        textField="NameCode" valueField="Id" dataSource={this.state.chemicalCategoryData}
                        isClicked={this.props.isClicked} ref="chemicalcategory" />

                    <Multipicker inputProps={{
                        name: 'species',
                        placeholder: this.strings.CONTROLS.CHEMICALPRODUCT_SPECIES_PLACEHOLDER,
                        defaultValue: this.props.chemicalProduct ? this.props.chemicalProduct.Species : []
                    }}
                        eReq={this.strings.CONTROLS.CHEMICALPRODUCT_SPECIES_REQ_MESSAGE}
                        textField="NameCode" valueField="Id"
                        dataSource={this.state.speciesData}
                        isClicked={this.props.isClicked} ref="species" />
                </div>
                <div className="col-md-6">
                    <Input inputProps={{
                        name: 'chemicalproductCode',
                        hintText: this.strings.CONTROLS.CHEMICALPRODUCT_CODE_PLACEHOLDER,
                        floatingLabelText: this.strings.CONTROLS.CHEMICALPRODUCT_CODE_LABEL
                    }}
                        maxLength={20} initialValue={this.props.chemicalProduct ? this.props.chemicalProduct.Code : ''}
                        eReq={this.strings.CONTROLS.CHEMICALPRODUCT_CODE_REQ_MESSAGE}
                        isClicked={this.props.isClicked} ref="chemicalproductCode" />

                    <Input inputProps={{
                        name: 'disposalNotes',
                        hintText: this.strings.CONTROLS.CHEMICALPRODUCT_DISPOSALNOTES_PLACEHOLDER,
                        floatingLabelText: this.strings.CONTROLS.CHEMICALPRODUCT_DISPOSALNOTES_LABEL
                    }}
                        multiLine={true} maxLength={250} rows={2} initialValue={this.props.chemicalProduct ? this.props.chemicalProduct.DisposalNotes : ''}
                        isClicked={this.props.isClicked} ref="disposalNotes" />
                </div>
                <div className="col-md-12 mt15" style={{ paddingBottom: '40px' }}>
                    <Tabs
                        activeKey={this.state.tabKey}
                        onChange={this.tabChanged}
                        renderTabBar={() => <ScrollableInkTabBar />}
                        renderTabContent={() => <TabContent animated={false} />} >
                        <TabPane tab={this.strings.WHP_TAB_LABEL} key="tabWHP">
                            <WHPTab strings={{ ...this.strings.WHP, COMMON: this.strings.COMMON }}
                                speciesData={this.state.speciesData} notifyToaster={this.props.notifyToaster}
                                ref="WHPTab" chemicalProductWHP={this.props.chemicalProductWHP} />
                        </TabPane>
                        <TabPane tab={this.strings.ESI_TAB_LABEL} key="tabESI">
                            <ESITab strings={this.strings.ESI}
                                speciesData={this.state.speciesData} notifyToaster={this.props.notifyToaster}
                                ref="ESITab" chemicalProductESI={this.props.chemicalProductESI} />
                        </TabPane>
                    </Tabs>
                </div>
            </div >);
        }
        else {
            return <LoadingIndicator className="ml10" onlyIndicator={true} />;
        }
    }

    render() {
        return (
            this.renderForm()
        );
    }
}

export default ChemicalProductTab;