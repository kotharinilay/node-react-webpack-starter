
import React, { Component } from 'react';
import BreederElement from './BreederElement';
import Dropdown from '../../../lib/core-components/Dropdown';
import NumberInput from '../../../lib/core-components/NumberInput';

import { getForm } from '../../../lib/wrapper-components/FormActions';
import { bufferToUUID } from '../../../../shared/uuid';

class BreederComposition extends Component {
    constructor(props) {
        super(props);
        this.siteURL = window.__SITE_URL__;
        this.strings = this.props.strings.COMMON;

        this.breedId = null;
        this.percent = '';
        this.elementsData = [];

        this.state = {
            elementCount: 0,
            totalCount: 0,
            breederSchema: ['breed', 'percent']
        };
        this.addElement = this.addElement.bind(this);
        this.removeElement = this.removeElement.bind(this);
        this.getData = this.getData.bind(this);

    }

    componentWillMount() {

        if (this.props.data && this.props.data.length > 0) {
            let data = [...this.props.data];
            this.breedId = bufferToUUID(data[0].BreedId);
            this.percent = data[0].Percentage;
            data.splice(0, 1);
            let newCount, schema;
            data.forEach(function (ele) {
                newCount = this.state.totalCount + 1;
                schema = this.state.breederSchema;
                schema.push(`breed${newCount}`, `percent${newCount}`);
                this.elementsData.push({ BreedId: bufferToUUID(ele.BreedId), Percentage: ele.Percentage });
            }, this);
            this.setState({
                elementCount: (this.state.breederSchema.length - 2) / 2,
                breederSchema: schema,
                totalCount: newCount
            });
        }
    }

    addElement() {
        
        let newCount = this.state.totalCount + 1;
        let schema = this.state.breederSchema;
        schema.push(`breed${newCount}`, `percent${newCount}`);
        this.setState({
            elementCount: (this.state.breederSchema.length - 2) / 2,
            breederSchema: schema,
            totalCount: newCount
        });
    }

    removeElement(index) {
        let newCount = this.state.elementCount - 1;
        let schema = this.state.breederSchema
        schema.splice(index * 2, 2);
        this.setState({
            elementCount: newCount,
            breederSchema: schema
        });
    }

    getData() {

        let breederComposition = [];
        // let formData = getForm(this.breederSchema, this.refs);
        let allRefs = Object.assign({}, this.refs);
        if (allRefs.breed.fieldStatus.valid && allRefs.percent.fieldStatus.valid) {
            if (!allRefs.breed.fieldStatus.value || !allRefs.percent.fieldStatus.value)
                return null;
            breederComposition.push({ BreedId: allRefs.breed.fieldStatus.value, Percentage: allRefs.percent.fieldStatus.value });
            delete allRefs['breed'];
            delete allRefs['percent'];
            for (var prop in allRefs) {
                let childElement = allRefs[prop].refs;
                var keys = Object.keys(childElement);
                if (childElement[keys[0]].fieldStatus.value && childElement[keys[1]].fieldStatus.value) {
                    breederComposition.push({
                        BreedId: childElement[keys[0]].fieldStatus.value,
                        Percentage: childElement[keys[1]].fieldStatus.value
                    });
                }
            }
        }
        return breederComposition;
    }

    render() {
        let elements = [];
        for (var index = 1; index <= this.state.elementCount; index++) {
            let element = <BreederElement key={this.state.breederSchema[index * 2]} breedData={this.props.breedData}
                removeElement={this.removeElement} eleNumber={index} isClicked={this.props.isClicked}
                breedName={this.state.breederSchema[index * 2]} percentName={this.state.breederSchema[(index * 2) + 1]}
                data={this.elementsData[index - 1]} ref={this.state.breederSchema[index * 2]} />;
            elements.push(element);
        }
        return (
            <div className="full-width">
                <div className='col-md-6 pl0'>
                    <Dropdown inputProps={{
                        name: 'breed',
                        hintText: this.strings.BREED_PLACEHOLDER,
                        floatingLabelText: this.strings.BREED_LABEL,
                        value: this.breedId || null
                    }}
                        eReq={this.props.isReq ? this.strings.BREED_REQ_MESSAGE : null}
                        textField="NameCode" valueField="Id" dataSource={this.props.breedData}
                        isClicked={this.props.isClicked} ref="breed" />
                </div>
                <div className='col-md-5 pl0'>
                    <NumberInput inputProps={{
                        name: 'percent',
                        hintText: this.strings.BREED_PERCENT_PLACEHOLDER
                    }}
                        eReq={this.props.isReq ? this.strings.BREED_PERCENT_REQ_MESSAGE : null}
                        initialValue={this.percent || '100'}
                        maxLength={10} numberType="decimal"
                        isClicked={this.props.isClicked} ref="percent" />
                </div>
                <div className='col-md-1 dropdown-icon pl0'>
                    <span onClick={this.addElement} >
                        <img src={this.siteURL + "/static/images/add-icon.png"} alt="add-icon" title="Add" />
                    </span>
                </div>
                {elements}
            </div>
        );
    }
}

// Define propTypes of breeder composition
BreederComposition.propTypes = {
    isReq: React.PropTypes.bool
}

// Define defaultProps of breeder composition
BreederComposition.defaultProps = {
    isReq: true,
}

export default BreederComposition;