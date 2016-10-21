import {ADD_TODO, CHANGE_STATUS, DELETE_TODO, EDIT_TODO} from '../constants';

const notes = (state = [], action) => {
    debugger;
    switch (action.type) {
        case ADD_TODO:
            return [
                ...state,
                addTodo(action)
            ]
        case CHANGE_STATUS:
            return state.map(t => changeStatus(t, action.id))

        case DELETE_TODO:
            return state.filter(t => t.id != action.id)

        case EDIT_TODO:
            return state.map(t => editTodo(t, action))

        default:
            return state;
    }
}

const addTodo = (action) => {
    return {text: action.text, id: action.id, completed: false}
}

const changeStatus = (state, id) => {
    if (state.id == id) {
        return Object.assign({}, state, {
            completed: !state.completed
        })
    }
    return state
}

const editTodo = (state, action) => {
    if (state.id == action.id) {
        return Object.assign({}, state, {text: action.text})
    }
    return state
}

export default notes