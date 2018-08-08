'use strict';

/**************************
 * Prepare Livestock step for e-NVD
 * **************************** */

import React, { Component } from 'react';
import { map as _map, includes as _includes, intersection as _intersection } from 'lodash';

import TabLPA from './questionnaire/tab_lpa';
import TabNT from './questionnaire/tab_nt';
import TabHealth from './questionnaire/tab_health';
import TabMSA from './questionnaire/tab_msa';
import TabOBE from './questionnaire/tab_obe';
import TabNFAS from './questionnaire/tab_nfas';
import TabSA from './questionnaire/tab_sa';
import TabAUSMEAT from './questionnaire/tab_aus_meat';
import TabDocuments from './questionnaire/tab_documents';
import Button from '../../../../lib/core-components/Button';
import { NOTIFY_ERROR, NOTIFY_SUCCESS, NOTIFY_INFO } from '../../../common/actiontypes';

import { getQuestionnaireData, useLastAnswers } from '../../../../services/private/envd';
import { accreditationProgramCodes, nvdAccredQue } from '../../../../../shared/constants';
import { downloadFile } from '../../../../services/private/common';

import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
require('rc-tabs/assets/index.css');

class Questionnaire extends Component {

    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.mounted = false;
        this.stateSet = this.stateSet.bind(this);

        this.strings = { ...this.props.strings.QUESTIONNAIRE, COMMON: this.props.strings.COMMON };
        this.notifyToaster = this.props.notifyToaster;

        this.msaProgramId = null;
        this.nfasProgramId = null;
        this.obeProgramId = null;
        this.ausMeatProgramId = null;

        this.state = {
            useLastAnswersClicked: false,
            useLastAnswers: Math.random(),
            isClicked: false,
            tabKey: 'tabLPA',
            accreditationProgramCode: [],
            dentition: []
        }

        this.editData = { ...this.props.editData };


        this.isModifyNVD = this.props.eNVDCommonDetails.isModifyNVD;
        this.SupportedAccreditations = this.editData.nvdData.SupportedAccreditations;
        this.disableAll = this.editData.nvdData.disableAll;
        this.displayNT = this.isModifyNVD && this.SupportedAccreditations.indexOf(this.strings.TAB_NT_LABEL) != -1;
        this.displaySA = this.isModifyNVD && this.SupportedAccreditations.indexOf(this.strings.TAB_SA_LABEL) != -1;
        this.displayNFAS = this.isModifyNVD && this.SupportedAccreditations.indexOf(this.strings.TAB_NFAS_LABEL) != -1;
        this.displayMSA = this.isModifyNVD && this.SupportedAccreditations.indexOf(this.strings.TAB_MSA_LABEL) != -1;
        this.displayOBE = this.isModifyNVD && this.SupportedAccreditations.indexOf(this.strings.TAB_OBE_LABEL) != -1;
        this.displayAUSMEAT = this.isModifyNVD && this.SupportedAccreditations.indexOf(this.strings.TAB_AUS_MEAT_LABEL) != -1;

        this.accreditationProgram = null;
        this.tabChanged = this.tabChanged.bind(this);

        this.getNTData = this.getNTData.bind(this);
        this.getHealthData = this.getHealthData.bind(this);
        this.getMSAData = this.getMSAData.bind(this);
        this.getNFASData = this.getNFASData.bind(this);
        this.getOBEData = this.getOBEData.bind(this);
        this.getSAData = this.getSAData.bind(this);
        this.getAUSMEATData = this.getAUSMEATData.bind(this);
        this.getDocuments = this.getDocuments.bind(this);

        this.useLastAnswersClick = this.useLastAnswersClick.bind(this);
    }
    stateSet(setObj) {
        if (this.mounted)
            this.setState(setObj);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillMount() {
        this.mounted = true;
        let _this = this;
        getQuestionnaireData(this.props.topPIC).then(function (res) {
            
            if (res.success) {
                _this.accreditationProgram = res.data.accreditationProgram;
                let accreditationProgramCode = _map(res.data.accreditationProgram, 'AccreditationProgramCode');
                _this.stateSet({ accreditationProgramCode: accreditationProgramCode, dentition: res.data.dentition });
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    // Change tab selection
    tabChanged(key) {
        this.setState({ tabKey: key });
    }

    getData() {
        let { tabLPA } = this.refs;
        if (!tabLPA)
            this.setState({ tabKey: 'tabLPA' });

        let { LPA, MSA, AUSMEAT, NFAS, OBE } = accreditationProgramCodes;
        let supportedAccreditations = _intersection(this.state.accreditationProgramCode, [MSA, NFAS, OBE, AUSMEAT]);

        if (this.props.isNTState)
            supportedAccreditations.push('NT');
        if (this.props.isSAState)
            supportedAccreditations.push('SA');

        let supportedAccreditationIds = this.accreditationProgram.filter((accr) => {
            if (supportedAccreditations.indexOf(accr.AccreditationProgramCode) != -1 ||
                accr.AccreditationProgramCode == LPA || accr.AccreditationProgramCode == 'HEALTH') {
                return accr.Id;
            }
        });

        let isValid = tabLPA.getValues();
        if (!isValid) return false;

        return {
            SupportedAccreditations: [LPA, 'HEALTH', ...supportedAccreditations],
            SupportedAccreditationIds: supportedAccreditationIds,
            LPA: tabLPA.getValues(),
            Documents: this.getDocuments(),
            NT: this.getNTData(),
            Health: this.getHealthData(),
            MSA: this.getMSAData(),
            NFAS: this.getNFASData(),
            OBE: this.getOBEData(),
            SA: this.getSAData(),
            AUSMEAT: this.getAUSMEATData()
        };
    }
    getDocuments() {
        if (this.refs.tabDocuments)
            return this.refs.tabDocuments.getValues();
        else {
            if (!this.isModifyNVD) {
                return [];
            }
            else
                return null;
        }
    }
    getNTData() {
        if (this.refs.tabNT)
            return this.refs.tabNT.getValues();
        else {
            let schema = [nvdAccredQue.ntLastAccess, nvdAccredQue.ntMovementToArea, nvdAccredQue.ntMovementFor,
            nvdAccredQue.ntSignatureDate, nvdAccredQue.ntPhoneNumber, nvdAccredQue.ntBiosecurityOfficer, nvdAccredQue.ntSignature];

            if (this.state.useLastAnswersClicked) {
                let finalObj = [];
                this.editData.accreditationQuestionnireData.map(d => {
                    if (_includes(schema, d.DataId)) {

                        // download file from s3 for storage
                        if (d.AccreditaionFileName) {
                            downloadFile(d.AccreditaionFilePath, d.AccreditaionFileName, d.MimeType).then(function (res) { })
                        }

                        let newObj = {
                            AccreditationProgramId: null,
                            DataId: d.DataId,
                            Value: d.Value,
                            AgliveFile: d.AccreditaionFileName ? {
                                deletedFile: null,
                                file: {
                                    name: d.AccreditaionFileName,
                                    type: d.MimeType
                                },
                                fileId: null
                            } : null,
                            AgliveFileId: null
                        }
                        finalObj.push(newObj);
                    }
                });

                return {
                    data: finalObj,
                    summaryData: []
                };
            }
            else if (!this.isModifyNVD) {

                let finalObj = [];
                schema.map(d => {
                    let newObj = {
                        AccreditationProgramId: null,
                        DataId: d,
                        Value: null,
                        AgliveFile: null,
                        AgliveFileId: null
                    }
                    finalObj.push(newObj);
                });

                return {
                    data: finalObj,
                    summaryData: []
                };
            }
            else
                return null;
        }
    }
    getHealthData() {
        if (this.refs.tabHealth)
            return this.refs.tabHealth.getValues();
        else {
            if (this.state.useLastAnswersClicked) {
                let finalObj = [];
                this.editData.accreditationQuestionnireData.map(d => {
                    if (_includes([nvdAccredQue.healthBRD], d.DataId)) {
                        let newObj = {
                            AccreditationProgramId: null,
                            DataId: d.DataId,
                            Value: d.Value,
                            AgliveFile: null,
                            AgliveFileId: null
                        }
                        finalObj.push(newObj);
                    }
                });
                return finalObj;
            }
            else if (!this.isModifyNVD) {
                let finalObj = [];
                let newObj = {
                    AccreditationProgramId: null,
                    DataId: nvdAccredQue.healthBRD,
                    Value: null,
                    AgliveFile: null,
                    AgliveFileId: null
                }
                finalObj.push(newObj);
                return finalObj;
            }
            else
                return null;
        }
    }
    getMSAData() {
        if (this.refs.tabMSA)
            return this.refs.tabMSA.getValues();
        else {

            let schema = [nvdAccredQue.msaMilkFedVealers, nvdAccredQue.msaSoldThroughMSAAccredited,
            nvdAccredQue.msaHighestTropicalBreed, nvdAccredQue.msaComment];

            if (this.state.useLastAnswersClicked) {
                let finalObj = [];
                this.editData.accreditationQuestionnireData.map(d => {
                    if (_includes(schema, d.DataId)) {
                        let newObj = {
                            AccreditationProgramId: this.msaProgramId,
                            DataId: d.DataId,
                            Value: d.Value,
                            AgliveFile: null,
                            AgliveFileId: null
                        }
                        finalObj.push(newObj);
                    }
                });
                return finalObj;
            }
            else if (!this.isModifyNVD) {
                let finalObj = [];
                schema.map(d => {
                    let newObj = {
                        AccreditationProgramId: this.msaProgramId,
                        DataId: d,
                        Value: null,
                        AgliveFile: null,
                        AgliveFileId: null
                    }
                    finalObj.push(newObj);
                });
                return finalObj;
            }
            else
                return null;
        }
    }
    getNFASData() {
        if (this.refs.tabNFAS)
            return this.refs.tabNFAS.getValues();
        else {
            let schema = [nvdAccredQue.nfasFedAtNFASFeelot, nvdAccredQue.nfasCertiNo,
            nvdAccredQue.nfasDate, nvdAccredQue.nfasSlaughterDate, nvdAccredQue.nfasName, nvdAccredQue.nfasSignature];

            if (this.state.useLastAnswersClicked) {
                let finalObj = [];
                this.editData.accreditationQuestionnireData.map(d => {
                    if (_includes(schema, d.DataId)) {

                        // download file from s3 for storage
                        if (d.AccreditaionFileName) {
                            downloadFile(d.AccreditaionFilePath, d.AccreditaionFileName, d.MimeType).then(function (res) { })
                        }

                        let newObj = {
                            AccreditationProgramId: this.nfasProgramId,
                            DataId: d.DataId,
                            Value: d.Value,
                            AgliveFile: d.AccreditaionFileName ? {
                                deletedFile: null,
                                file: {
                                    name: d.AccreditaionFileName,
                                    type: d.MimeType
                                },
                                fileId: null
                            } : null,
                            AgliveFileId: null
                        }
                        finalObj.push(newObj);
                    }
                });

                return {
                    data: finalObj,
                    summaryData: []
                };
            }
            else if (!this.isModifyNVD) {
                let finalObj = [];
                schema.map(d => {
                    let newObj = {
                        AccreditationProgramId: this.nfasProgramId,
                        DataId: d,
                        Value: null,
                        AgliveFile: null,
                        AgliveFileId: null
                    }
                    finalObj.push(newObj);
                });
                return {
                    data: finalObj,
                    summaryData: []
                };
            }
            else
                return null;
        }
    }
    getOBEData() {
        if (this.refs.tabOBE)
            return this.refs.tabOBE.getValues();
        else {
            if (this.state.useLastAnswersClicked) {
                let finalObj = [];
                this.editData.accreditationQuestionnireData.map(d => {
                    if (_includes([nvdAccredQue.obeOrganic], d.DataId)) {
                        let newObj = {
                            AccreditationProgramId: this.obeProgramId,
                            DataId: d.DataId,
                            Value: d.Value,
                            AgliveFile: null,
                            AgliveFileId: null
                        }
                        finalObj.push(newObj);
                    }
                });
                return finalObj;
            }
            else if (!this.isModifyNVD) {
                let finalObj = [];
                let newObj = {
                    AccreditationProgramId: this.obeProgramId,
                    DataId: nvdAccredQue.obeOrganic,
                    Value: null,
                    AgliveFile: null,
                    AgliveFileId: null
                }
                finalObj.push(newObj);
                return finalObj;
            }
            else
                return null;
        }
    }
    getSAData() {
        if (this.refs.tabSA)
            return this.refs.tabSA.getValues();
        else {
            if (!this.isModifyNVD) {
                return [];
            }
            else
                return null;
        }
    }
    getAUSMEATData() {
        if (this.refs.tabAUSMEAT)
            return this.refs.tabAUSMEAT.getValues();
        else {
            let schema = [nvdAccredQue.ausMeatRecordDays, nvdAccredQue.ausMeatDate,
            nvdAccredQue.ausMeatName, nvdAccredQue.ausMeatSlaughterDate, nvdAccredQue.ausMeatSignature];

            if (this.state.useLastAnswersClicked) {
                let finalObj = [];
                this.editData.accreditationQuestionnireData.map(d => {
                    if (_includes(schema, d.DataId)) {

                        // download file from s3 for storage
                        if (d.AccreditaionFileName) {
                            downloadFile(d.AccreditaionFilePath, d.AccreditaionFileName, d.MimeType).then(function (res) { })
                        }

                        let newObj = {
                            AccreditationProgramId: this.ausMeatProgramId,
                            DataId: d.DataId,
                            Value: d.Value,
                            AgliveFile: d.AccreditaionFileName ? {
                                deletedFile: null,
                                file: {
                                    name: d.AccreditaionFileName,
                                    type: d.MimeType
                                },
                                fileId: null
                            } : null,
                            AgliveFileId: null
                        }
                        finalObj.push(newObj);
                    }
                });

                return finalObj;
            }
            else if (!this.isModifyNVD) {

                let finalObj = [];
                schema.map(d => {
                    let newObj = {
                        AccreditationProgramId: this.ausMeatProgramId,
                        DataId: d,
                        Value: null,
                        AgliveFile: null,
                        AgliveFileId: null
                    }
                    finalObj.push(newObj);
                });
                return finalObj;
            }
            else
                return null;
        }
    }

    useLastAnswersClick(propertyId) {
        let _this = this;
        useLastAnswers(propertyId, this.props.eNVDCommonDetails.nvdType).then(function (res) {
            if (res.success) {
                let { lpaQuestionnaireData, accreditationQuestionnireData, documentData } = res.data;
                if (lpaQuestionnaireData.length > 0)
                    _this.editData.lpaQuestionnaireData = lpaQuestionnaireData;
                else
                    _this.editData.lpaQuestionnaireData = [];
                if (accreditationQuestionnireData.length > 0)
                    _this.editData.accreditationQuestionnireData = accreditationQuestionnireData;
                else
                    _this.editData.accreditationQuestionnireData = [];
                if (lpaQuestionnaireData.length > 0 || accreditationQuestionnireData.length > 0) {
                    _this.stateSet({ useLastAnswersClicked: true, useLastAnswers: Math.random() });
                    _this.notifyToaster(NOTIFY_SUCCESS, { message: _this.strings.PREV_ANSWER_REC_MESSAGE });
                }
                else {
                    _this.notifyToaster(NOTIFY_INFO, { message: _this.strings.NO_PREV_ANSWER_REC_MESSAGE });
                }
            }
        }).catch(function (err) {
            _this.notifyToaster(NOTIFY_ERROR);
        });
    }

    render() {
        this.msaProgramId = null;
        this.nfasProgramId = null;
        this.obeProgramId = null;
        this.ausMeatProgramId = null;
        if (this.accreditationProgram) {
            let msaProgram = this.accreditationProgram.find(x => x.AccreditationProgramCode == accreditationProgramCodes.MSA);
            if (msaProgram)
                this.msaProgramId = msaProgram.Id;

            let nfasProgram = this.accreditationProgram.find(x => x.AccreditationProgramCode == accreditationProgramCodes.NFAS);
            if (nfasProgram)
                this.nfasProgramId = nfasProgram.Id;

            let obeProgram = this.accreditationProgram.find(x => x.AccreditationProgramCode == accreditationProgramCodes.OBE);
            if (obeProgram)
                this.obeProgramId = obeProgram.Id;

            let ausMeatProgram = this.accreditationProgram.find(x => x.AccreditationProgramCode == accreditationProgramCodes.AUSMEAT);
            if (ausMeatProgram)
                this.ausMeatProgramId = ausMeatProgram.Id;
        }

        let lpaProps = {
            strings: { ...this.strings.LPA, COMMON: this.props.strings.COMMON },
            notifyToaster: this.notifyToaster,
            isClicked: this.state.isClicked,
            editData: this.editData.lpaQuestionnaireData,
            disableAll: this.disableAll
        }

        let ntProps = {
            strings: { ...this.strings.NT, COMMON: this.props.strings.COMMON },
            livestockSummaryData: this.props.livestockSummaryData,
            notifyToaster: this.notifyToaster,
            isClicked: this.state.isClicked,
            topPIC: this.props.topPIC,
            speciesId: this.props.eNVDCommonDetails.species.Id,
            companyId: this.props.authUser.CompanyId,
            companyName: this.props.authUser.CompanyName,
            findContact: this.props.findContact,
            openFindContact: this.props.openFindContact,
            isModifyNVD: this.isModifyNVD,
            editData: {
                accreditationQuestionnireData: this.editData.accreditationQuestionnireData,
                livestockSummaryData: this.editData.livestockSummaryData
            },
            disableAll: this.disableAll
        }

        let healthProps = {
            strings: { ...this.strings.HEALTH, COMMON: this.props.strings.COMMON },
            notifyToaster: this.notifyToaster,
            isClicked: this.state.isClicked,
            editData: this.editData.accreditationQuestionnireData || [],
            disableAll: this.disableAll
        }

        let msaProps = {
            strings: { ...this.strings.MSA, COMMON: this.props.strings.COMMON },
            accreditationProgramId: this.msaProgramId,
            notifyToaster: this.notifyToaster,
            isClicked: this.state.isClicked,
            editData: this.editData.accreditationQuestionnireData,
            disableAll: this.disableAll
        }

        let nfasProps = {
            strings: { ...this.strings.NFAS, COMMON: this.props.strings.COMMON },
            accreditationProgramId: this.nfasProgramId,
            notifyToaster: this.notifyToaster,
            isClicked: this.state.isClicked,
            dentition: this.state.dentition,
            topPIC: this.props.topPIC,
            livestockSummaryData: this.props.livestockSummaryData,
            companyId: this.props.authUser.CompanyId,
            companyName: this.props.authUser.CompanyName,
            findContact: this.props.findContact,
            openFindContact: this.props.openFindContact,
            isModifyNVD: this.isModifyNVD,
            editData: {
                accreditationQuestionnireData: this.editData.accreditationQuestionnireData,
                livestockSummaryData: this.editData.livestockSummaryData
            },
            disableAll: this.disableAll
        }

        let docProps = {
            strings: { ...this.strings.DOCUMENTS, COMMON: this.props.strings.COMMON },
            notifyToaster: this.notifyToaster,
            isClicked: this.state.isClicked,
            editData: this.editData.documentData || [],
            disableAll: this.disableAll
        }

        let obeProps = {
            strings: { ...this.strings.OBE, COMMON: this.props.strings.COMMON },
            accreditationProgramId: this.obeProgramId,
            notifyToaster: this.notifyToaster,
            isClicked: this.state.isClicked,
            editData: this.editData.accreditationQuestionnireData,
            disableAll: this.disableAll
        }

        let saProps = {
            strings: { ...this.strings.SA, COMMON: this.props.strings.COMMON },
            livestockSummaryData: this.props.livestockSummaryData,
            notifyToaster: this.notifyToaster,
            isClicked: this.state.isClicked,
            isModifyNVD: this.isModifyNVD,
            editData: {
                accreditationQuestionnireData: this.editData.accreditationQuestionnireData,
                livestockSummaryData: this.editData.livestockSummaryData
            },
            disableAll: this.disableAll
        }

        let ausMeatProps = {
            strings: { ...this.strings.AUSMEAT, COMMON: this.props.strings.COMMON },
            accreditationProgramId: this.ausMeatProgramId,
            notifyToaster: this.notifyToaster,
            isClicked: this.state.isClicked,
            isModifyNVD: this.isModifyNVD,
            editData: this.editData.accreditationQuestionnireData,
            disableAll: this.disableAll
        }

        return (
            <Tabs key={this.state.useLastAnswers}
                activeKey={this.state.tabKey}
                onChange={this.tabChanged}
                renderTabBar={() => <ScrollableInkTabBar />}
                renderTabContent={() => <TabContent animated={false} />} >
                <TabPane tab={this.strings.TAB_LPA_LABEL} key="tabLPA">
                    <TabLPA nvdType={this.props.eNVDCommonDetails.nvdType} {...lpaProps}
                        editData={this.editData.lpaQuestionnaireData} ref="tabLPA" />
                    <div className="clearfix">
                    </div>
                </TabPane>
                {this.props.isNTState || this.displayNT ?
                    <TabPane tab={this.strings.TAB_NT_LABEL} key="tabNT">
                        <TabNT {...ntProps} ref="tabNT" />
                        <div className="clearfix">
                        </div>
                    </TabPane> : null}
                {this.props.isSAState || this.displaySA ?
                    <TabPane tab={this.strings.TAB_SA_LABEL} key="tabSA">
                        <TabSA {...saProps} ref="tabSA" />
                        <div className="clearfix">
                        </div>
                    </TabPane> : null}
                {this.nfasProgramId || this.displayNFAS ?
                    <TabPane tab={this.strings.TAB_NFAS_LABEL} key="tabNFAS">
                        <TabNFAS {...nfasProps} ref="tabNFAS" />
                        <div className="clearfix">
                        </div>
                    </TabPane> : null}
                {this.msaProgramId || this.displayMSA ?
                    <TabPane tab={this.strings.TAB_MSA_LABEL} key="tabMSA">
                        <TabMSA {...msaProps} ref="tabMSA" />
                        <div className="clearfix">
                        </div>
                    </TabPane> : null}
                {this.obeProgramId || this.displayOBE ?
                    <TabPane tab={this.strings.TAB_OBE_LABEL} key="tabOBE">
                        <TabOBE {...obeProps} ref="tabOBE" />
                        <div className="clearfix">
                        </div>
                    </TabPane> : null}
                {this.ausMeatProgramId || this.displayAUSMEAT ?
                    <TabPane tab={this.strings.TAB_AUS_MEAT_LABEL} key="tabAUSMEAT">
                        <TabAUSMEAT {...ausMeatProps} ref="tabAUSMEAT" />
                        <div className="clearfix">
                        </div>
                    </TabPane> : null}
                <TabPane tab={this.strings.TAB_HEALTH_LABEL} key="tabHealth">
                    <TabHealth {...healthProps} ref="tabHealth" />
                    <div className="clearfix">
                    </div>
                </TabPane>
                <TabPane tab={this.strings.TAB_DOCUMENTS_LABEL} key="tabDocuments">
                    <TabDocuments {...docProps} ref="tabDocuments" />
                    <div className="clearfix">
                    </div>
                </TabPane>
            </Tabs >
        );
    }
}

export default Questionnaire;