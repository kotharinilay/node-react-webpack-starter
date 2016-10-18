const todo = (state = [], action) => {
    switch (action.type) {
        case "ADD_TODO":
            return [
                ...state,
                addTodo(action)
            ]
        case "CHANGE_STATUS":
            return state.map(t => changeStatus(t, action.id))

        default:
            return state;

    }

}

const addTodo = (action) => {
    return {
        note: action.text,
        id: action.id,
        completed: false
    }
}

const changeStatus = (state, id) => {
    if (state.id != id) {
        return Object.assign({}, state, {
            completed: !state.completed
        })
    }
}

export default todo