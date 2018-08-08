
import React, { Component } from 'react';
import AutoComplete from '../../lib/core-components/AutoComplete';
import Find from '../../app/common/find';
import { getForm, isValidForm } from '../../lib/wrapper-components/FormActions';

import MenuItem from 'material-ui/MenuItem';
import Highlight from 'react-highlighter';

class ContactAutoComplete extends Component {
    constructor(props) {
        super(props);
        this.state = {
            payload: null
        }
        this.contactItemTemplate = this.contactItemTemplate.bind(this);
        this.highlightTemplate = this.highlightTemplate.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.findContact) {
            let payload = nextProps.findContact.Payload;
            if (nextProps.findContact.TargetKey == this.props.targetKey && payload) {
                this.setState({ payload: payload });
            }
        }
    }

    // render contact item template from dataSource
    contactItemTemplate(data, value, valueField, textField) {
        data.map(d => {
            d[valueField] = <MenuItem className="manager-menu"
                value={d[valueField]} label={d[textField]}
                primaryText={this.highlightTemplate(d, value)} />
        });
        return data;
    }

    highlightTemplate(d, value) {
        let highlight = { backgroundColor: "#fec34e" };
        if (value && value.length > 0) {
            return (<div><Highlight search={value} matchStyle={highlight}>{d.Name}</Highlight><br />
                <span className="manager-role">{d.CompanyName}</span></div>);
        }
        else {
            return (<div>{d.Name}<br /><span className="manager-role">{d.CompanyName}</span></div>);
        }
    }

    // get value of auto complete
    getValue() {
        let schema = [this.props.targetKey || 'contact'];
        let isFormValid = isValidForm(schema, this.refs);
        if (!isFormValid) {
            return false;
        }
        let obj = getForm(schema, this.refs);
        return { ...obj[this.props.targetKey || 'contact'] };
    }

    componentWillMount() {

    }

    // render autocomplete component for contact
    render() {
        let props = { ...this.props, updateOnChange: true, searchIcon: true, textField: "Name", valueField: "Value", ref: this.props.targetKey || 'contact' };
        props.inputProps.className = "inputStyle inputStyle2";
        props.apiUrl = "/api/private/contact/getlist?search=$$$" + props.appendUrl;
        let payload = this.state.payload;
        if (payload) {
            props.selectedObj = {
                CompanyName: payload.CompanyName,
                Email: payload.Email,
                Id: payload.UUID,
                Mobile: payload.Mobile,
                Name: payload.ContactName,
                Value: payload.UUID,
            };
        }

        return (
            <div style={{ position: 'relative' }}>
                <AutoComplete  {...props} itemTemplate={this.contactItemTemplate} />
                <Find contact={true} companyName={this.props.companyName} />
            </div>);
    }
}

//Define defaultProps
ContactAutoComplete.defaultProps = {
    appendUrl: '',
    companyName: null
}

export default ContactAutoComplete;