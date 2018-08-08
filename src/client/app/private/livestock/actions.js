'use strict';

/**************************
 * action list of livestock 
 * **************************** */

function setSelectedTags(type, selectedTags) {
    return {
        type: type,
        selectedTags
    }
}

module.exports = {
    setSelectedTags: setSelectedTags
}