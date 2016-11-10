import { connect } from 'react-redux';
import React, { Component } from 'react';
import { addTodo } from '../Actions/todoActions';

class AddTodo extends Component {
    constructor(props) {
        super(props)
        this.props = props
    }

    render() {
        let input
        return (
            <div>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        if (!input.value.trim()) {
                            return;
                        }
                        this.props.dispatch(addTodo(input.value));
                        input.value = '';
                    } }>
                    <input
                        ref={node => { input = node } } />
                    <button type='submit'>
                        Add Post
                    </button>
                </form>
            </div >
        )
    }
}

// let AddTodo = ({dispatch}) => {     return () }

AddTodo = connect()(AddTodo)

export default AddTodo