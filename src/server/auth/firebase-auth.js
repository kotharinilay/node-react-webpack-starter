'use strict';

/*************************************
 * firebase initialization & authentication
 * *************************************/

import * as firebase from 'firebase';

// Initialize Firebase
var config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
};
firebase.initializeApp(config);
firebase.
    auth().
    signInWithEmailAndPassword(process.env.FIREBASE_AUTH_USERNAME, process.env.FIREBASE_AUTH_PASSWORD)
    .then(function (res) {
        console.log("firebase logged in successfully !");
    }).catch(function (err) {
        console.log("error while logging firebase: " + err);
    });