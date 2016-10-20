import { ADD_TODO, CHANGE_STATUS, DELETE_TODO } from '../constants';

let nextTodo = 0;

export const addTodo = (text) => {
    return {
        type: ADD_TODO,
        id: nextTodo++,
        text
    }
}

export const changeStatus = (id) => {
    return {
        type: CHANGE_STATUS,
        id
    }
}

export const deleteTodo = (id) => {
    return {
        type: DELETE_TODO,
        id
    }
}