
    wait() {
        console.log('wait in...');
        var e = new Date().getTime() + (5000);
        while (new Date().getTime() <= e) { }
    }

    cancelClickEvent(e) {
        this.wait();
        console.log('Cancel click event fired.');
    }

    getData() {
        let data = [
            { key: 'IN', value: 'India' },
            { key: 'USA', value: 'United State' },
            { key: 'UK', value: 'United Kingdom' }
        ];
        var newData = Object.assign({}, data);
        return newData;
    }




        // <Input
        //     inputProps={{
        //         name: objHeaderForm.Name,
        //         id: "testId",
        //         value: this.props.headerForm.Name,
        //         placeholder: 'Enter name'
        //     }}
        //     eReq='Please enter value'
        //     formSetValue={this.props.headerFormSetValue} />


        // <Email
        //     inputProps={{ name: objHeaderForm.Email, id: "emailId", value: this.props.headerForm.Email, placeholder: 'Enter email' }}
        //     eReq="Please enter email address" eInvalid="Invalid email address"
        //     formSetValue={this.props.headerFormSetValue} />

        // <TextArea
        //     inputProps={{ name: objHeaderForm.Comment, id: 'commentId', value: this.props.headerForm.Comment, placeholder: 'Enter comments' }}
        //     formSetValue={this.props.headerFormSetValue} />

        // <Password inputProps={{ name: objHeaderForm.PasswordOnly, id: 'PasswordOnlyId', value: this.props.headerForm.PasswordOnly, placeholder: 'Enter password only' }}
        //     eReq="Please enter password"
        //     formSetValue={this.props.headerFormSetValue} />

        // <PasswordConfirmPassword
        //     inputProps={{ name: objHeaderForm.Password, id: 'passwordId', value: this.props.headerForm.Password, placeholder: 'Enter password' }}
        //     inputPropsCP={{ name: objHeaderForm.ConfirmPassword, id: 'confirmPasswordId', value: this.props.headerForm.ConfirmPassword, placeholder: 'Enter Confirm password' }}
        //     eReq="Please enter password"
        //     eReqCP="Please enter confirm password" eCPNotMatch="Confirm password not match"
        //     formSetValue={this.props.headerFormSetValue} />


        // <Multipicker
        //     inputProps={{
        //         name: objHeaderForm.MultiPicker, id: 'MultiPickerId',
        //         value: this.props.headerForm.MultiPicker
        //     }}
        //     apiUrl='https://swapi.co/api/people/?search=$$$'
        //     valueField='url' textField='name'
        //     formSetValue={this.props.headerFormSetValue}
        //     iSelectedValueText={[{ name: 'Darth Vader', url: 'http://swapi.co/api/people/4/' }]}
        //     eReq='Please select details from list.' />


        // <Autocomplete
        //     inputProps={{
        //         name: objHeaderForm.AutoCountry, id: 'AutoCountryId',
        //         value: this.props.headerForm.AutoCountry,
        //         placeholder: 'Type to search country'
        //     }}
        //     apiUrl='https://swapi.co/api/people/?search=$$$'
        //     textField="name" valueField="url"
        //     eReq='Please enter country' eInvalid='Invalid country...'
        //     iSelectedValue='http://swapi.co/api/people/4/' iSelectedText='Darth Vader'
        //     formSetValue={this.props.headerFormSetValue}
        //     />


        // <Dropdown
        //     inputProps={{
        //         name: 'Mobile',
        //         id: 'ccId',
        //         value: this.props.tabs.tab1.Mobile.value,
        //         placeholder: 'Select country'
        //     }}
        //     iSelectedIndex={2} //iSelectedValue="UK1" iSelectedText="United State1"
        //     isDirty={this.props.tabs.tab1.Mobile.isDirty}
        //     isClicked={this.props.tabs.isClicked}
        //     eReq="Please select country"
        //     formSetValue={this.func}
        //     dataSource={this.getData()}
        //     valueField="key" textField="value" />


        // <CheckBox inputProps={{ name: 'Mobile', id: 'IsAgreeId', text: 'I am agree with T&C.', checked: this.props.tabs.tab1.Mobile.value }}
        //     isDirty={this.props.tabs.tab1.Mobile.isDirty}
        //     isClicked={this.props.tabs.isClicked}
        //     eReq='Please agree with it.'
        //     formSetValue={this.func} />


        // <CheckBoxList
        //     inputProps={{
        //         name: 'issueType',
        //         id: 'issueTypeId'
        //     }} eReq="Please select issue type"
        //     iSelectedValue="IN,UK"
        //     formSetValue={this.props.headerFormSetValue}
        //     dataSource={this.getData()}
        //     valueField="key" textField="value" />


        //     <RadioButtonList
        //         inputProps={{
        //             name: 'RB1',
        //             id: 'RB1Id'
        //         }}
        //         iHorizontalDirection eReq iSelectedValue="0" //iSelectedText="A"
        //         formSetValue={this.props.headerFormSetValue}
        //         dataSource={this.getData()}
        //         valueField="key" textField="value" />


        // <Button
        //     inputProps={{
        //         name: 'btnSubmit', id: 'btnSubmitId',
        //         value: 'Login', className: 'btn btn-primary mr10',
        //         disabled: !this.props.headerForm.isValidForm
        //     }}
        //     loading buttonClick={function() {
        //         console.log('Submit click event fired.');
        //     } } />


        // <Button
        //     inputProps={{
        //         name: 'btnCancel', id: 'btnCancelId',
        //         value: 'Cancel', className: 'btn btn-default',
        //     }}
        //     loading buttonClick={this.cancelClickEvent.bind(this)} />


        //  <Datetimepicker
        //      value={this.state.value}
        //      defaultValue={new Date()}
        //      eReq='Please select date'
        //      inputProps={{ name: 'Datetimepicker' }}
        //      formSetValue={this.updateDate.bind(this)} />



        //  renderBody() {
        //         return (<div>
        //             <h3>This is title part of about us</h3>
        //             <p>Hello world! This is testing p tag...</p>
        //         </div>);
        //     }
        //
        //  <div onClick={() => this.refs.refPopup.openModal()}>Open static popup</div>
        //  <Popup ref="refPopup" isESC modalTitle="About us" modalBody={this.renderBody()} />