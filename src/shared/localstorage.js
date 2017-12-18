'use strict';

/************************************** 
 * operations related to localstorage
 ***************************************/

// set item to localstorage to specific key
function setItem(key, data) {
    return localStorage.setItem(key, data);
}

// get item from localstorage with specific key
function getItem(key) {
    return localStorage.getItem(key);
}

// remove item from localstorage with specific key
function removeItem(key) {
    return localStorage.removeItem(key);
}

// remove all local storage data
function clearStorage() {
    localStorage.clear();
}

module.exports = {
    setItem: setItem,
    getItem: getItem,
    removeItem: removeItem,
    clearStorage: clearStorage
}