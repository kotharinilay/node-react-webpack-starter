import { connect } from 'react-redux';
import React from 'react';
import { addTodo } from '../Actions/todoActions';

let AddTodo = ({dispatch}) => {
    let input

    return (
        <div>
            <form onSubmit={e => {
                e.preventDefault();
                if (!input.value.trim()) {
                    return;
                }
                dispatch(addTodo(input.value))
                input.value = ''
            } }>
                <input ref={node => {
                    input = node
                } } />
                <button type='submit'>
                    Add Post
            </button>
            </form>
        </div >
    )
}

AddTodo = connect()(AddTodo)

export default AddTodo