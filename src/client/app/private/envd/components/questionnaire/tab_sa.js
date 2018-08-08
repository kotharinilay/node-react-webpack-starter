'use strict';

/**************************
 * tab component of SA
 * **************************** */

import React, { Component } from 'react';
import FileUpload from '../../../../../lib/wrapper-components/FileUpload';
import { bufferToUUID } from '../../../../../../shared/uuid';

class TabSA extends Component {

    constructor(props) {
        super(props);
        this.strings = this.props.strings;
        this.notifyToaster = this.props.notifyToaster;

        this.getValues = this.getValues.bind(this);
        this.summaryData = this.props.isModifyNVD ? this.props.editData.livestockSummaryData : this.props.livestockSummaryData;
    }

    getValues() {
        return this.summaryData;
    }

    render() {
        return <div className="tbl-questionnaire">
            <table className="mt30 table table-hover table-bordered">
                <thead>
                    <tr>
                        <th>Mob</th>
                        <th>Number of Livestock</th>
                        <th>Description</th>
                        <th>Prefix Tattoo</th>
                    </tr>
                </thead>
                <tbody>
                    {this.summaryData.map((d, i) => {
                        let fileObj = {
                            FileId: d.SA_PrefixTattooId ? bufferToUUID(d.SA_PrefixTattooId) : null,
                            FileName: d.SA_PrefixTattooName || '',
                            MimeType: d.MimeType || '',
                            FilePath: d.SA_PrefixTattooPath || ''
                        }
                        return <tr key={i}>
                            <td>{d.Mob}</td>
                            <td>{d.NumberOfHead}</td>
                            <td>{d.Description}</td>
                            <td>
                                <FileUpload
                                    strings={this.strings.COMMON} isDisabled={this.props.disableAll}
                                    notifyToaster={this.notifyToaster}
                                    getDataOnUpload={(obj) => { d.PrefixTattoo = obj; }}
                                    data={fileObj}
                                    picDelSuccess={this.strings.TATTOO_DELETE_SUCCESS} ref={"tattoo" + d.SummaryId} />
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    }
}
export default TabSA;