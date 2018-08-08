'use strict';

/*******************************************
 * all firebase real time interaction at client side
 * goes here
 * ************************************** */

import firebase from 'firebase';

module.exports = () => {
    if (window.__FIREBASE__) {
        var config = {
            apiKey: window.__FIREBASE__.FIREBASE_API_KEY,
            authDomain: window.__FIREBASE__.FIREBASE_AUTH_DOMAIN,
            databaseURL: window.__FIREBASE__.FIREBASE_DATABASE_URL
        };
        firebase.initializeApp(config);

        firebase.database().ref().child("users/").on("child_changed", function (snap) {
            // console.log(snap.val());
        });

        // 
        var connectedRef = firebase.database().ref('.info/connected');
        connectedRef.on('value', onValueChanged);

        function onValueChanged(snap) {
            if (snap.val() === true) {// online                       
                onReceiveUpdate();
            }
            else {
                // offline work
            }
        }

        function onReceiveUpdate() {
            var userId = "ca4d4b30-d7e3-11e6-86f4-b5756a924ac6";
            return firebase.database().ref('/users/' + userId).once('value').then(function (snapshot) {
                var data = snapshot.val();
                // update in local browser here            
            });
        }
    }
}
