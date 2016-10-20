import React, { PropTypes } from 'react';

const Todo = ({note, changeStatus, deleteTodo}) => {
    debugger;
    return (
        <li onClick={changeStatus}>
            {note.text}
            <button onClick={deleteTodo}>
                Delete
        </button>
        </li>
    )
}

Todo.propTypes = {
    note: PropTypes.shape({
        id: PropTypes.number.isRequired,
        text: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired
    }),
    changeStatus: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired
}

export default Todo