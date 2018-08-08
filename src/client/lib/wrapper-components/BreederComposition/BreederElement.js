

import React, { Component } from 'react';
import Dropdown from '../../../lib/core-components/Dropdown';
import NumberInput from '../../../lib/core-components/NumberInput';

class BreederElement extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;

        this.removeElement = this.removeElement.bind(this);
    }

    removeElement() {
        this.props.removeElement(this.props.eleNumber);
    }

    render() {

        return (
            <div className="full-width">
                <div className='col-md-6 pl0'>
                    <Dropdown inputProps={{
                        name: this.props.breedName,
                        hintText: "Select Breed",
                        floatingLabelText: " Breed",
                        value: this.props.data ? this.props.data.BreedId : null,
                        className: "breed-dropdown"
                    }}
                        textField="NameCode" valueField="Id" dataSource={this.props.breedData}
                        isClicked={this.props.isClicked} ref={this.props.breedName} />
                </div>
                <div className='col-md-5 brd-per pl0'>
                    <NumberInput inputProps={{
                        name: this.props.percentName
                    }}
                        maxLength={10} numberType="decimal"
                        initialValue={this.props.data ? this.props.data.Percentage : ''}
                        isClicked={this.props.isClicked} ref={this.props.percentName} />
                </div>
                <div className='col-md-1 dropdown-icon pl0'>
                    <span onClick={this.removeElement} >
                        <img src={this.siteURL + "/static/images/delete-icon.png"} alt="delete-icon" title="Delete" />
                    </span>
                </div>
            </div>
        );
    }
}

export default BreederElement;