'use strict';

/**************************
 * action list of header 
 * **************************** */

import { SEARCHKEY } from './actiontypes';

export function search() {
    return {
        type: SEARCHKEY
    }
}