import { CHANGE_FILTER, DISPLAY_ALL } from '../constants';

const filter = (state = DISPLAY_ALL, action) => {
    switch (action.type) {
        case CHANGE_FILTER:
            return action.filter

        default:
            return state
    }
}

export default filter