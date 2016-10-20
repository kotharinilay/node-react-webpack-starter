import { combineReducers } from 'redux';
import filterReducer from './filterReducer';
import todoReducer from './todoReducer';

export default combineReducers({
    filter: filterReducer,
    notes: todoReducer
});