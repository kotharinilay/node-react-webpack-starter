'use strict';

export default function(router) {
    // simple get api for testing
    router.get('/get', function(req, res) {
        Livestock.findAndCountAll().then(function(result) {
            res.status(200).send(result);
        }).catch(function(err) {
            res.status(500).send(result);
        });
    });

    // simple get api for testing
    router.get('/test', function (req, res) { 
        res.json({ message: 'Welcome to aglive demo !' });        
    });
}
