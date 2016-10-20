import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { changeStatus, deleteTodo } from '../Actions/todoActions';
import { DISPLAY_ALL, DISPLAY_ACTIVE, DISPLAY_INACTIVE } from '../constants';
import Todo from '../Components/Todo'

const filterTodo = (notes, filter) => {
    debugger;
    switch (filter) {
        case DISPLAY_ALL:
            return notes

        case DISPLAY_ACTIVE:
            return notes.filter(t => !t.completed)

        case DISPLAY_INACTIVE:
            return notes.filter(t => t.completed)

        default:
            return notes
    }
}

const mapStateToProps = (state) => {
    debugger;
    return {
        notes: filterTodo(state.notes, state.filter)
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onTodoClick: (id) => {
            dispatch(changeStatus(id))
        },
        deleteTodo: (id) => {
            dispatch(deleteTodo(id))
        }
    }
}

let TodoList = ({notes, onTodoClick, deleteTodo}) => {
    debugger;
    return (
        <ul>
            {notes.map(note =>
                <Todo key={note.id} note={note} changeStatus={() => onTodoClick(note.id)} deleteTodo={() => deleteTodo(note.id)} />
            )}
        </ul>
    )
}

TodoList.propTypes = {
    notes: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
        completed: PropTypes.bool.isRequired
    })),
    onTodoClick: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired
}

TodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList)

export default TodoList