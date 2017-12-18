'use strict';

/***************************************************
 * Notification tab panel: All / Unread
 * Consists list of notifications
 * ************************************************ */

import React, { Component } from 'react';
import { map as _map } from 'lodash';
import Divider from 'material-ui/Divider';
import Checkbox from '../../../../lib/core-components/CheckBox';
import { Scrollbars } from '../../../../../../assets/js/react-custom-scrollbars';
import { formatDateTime } from '../../../../../shared/format/date';

class TabNotification extends Component {

    constructor(props) {
        super(props);
        this.setContent = this.setContent.bind(this);
    }

    // show notification html contents
    setContent(item) {
        this.props.setContentBody(item);
    }

    render() {
        let dataSource = this.props.dataSource;
        if (this.props.tabKey == 'tabUnread') {
            dataSource = dataSource.filter((ds) => {
                return !ds.MarkAsRead;
            });
        }
        if (dataSource.length > 0) {
            return (<Scrollbars autoHide autoHeight autoHeightMax={400}>
                {_map(dataSource, (item, index) =>
                    <div className="notifi-box" key={index} onClick={this.setContent.bind(this, item)} >
                        <div className="notifi-check" >
                            <Checkbox inputProps={{
                                name: 'chkbox' + index,
                                defaultChecked: item.IsSelected
                            }} onCheck={(value) => this.props.onCheckChanged(value, item.NotificationReceiverId)} />
                        </div>
                        <div className="notifi-desc">
                            <h3>{item.readFlag ? item.Subject : `( ${item.Subject})`}</h3>
                            <i>Sender: {item.Sender}</i>
                            <span>{formatDateTime(item.ReceivedDateTime).DateTime}</span>
                        </div>
                    </div>
                )}
            </Scrollbars>);
        }
        else
            return (<div>
                <h5>Not Available</h5>
            </div>);
    }
}

export default TabNotification;