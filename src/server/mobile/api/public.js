'use strict';

/**************************************
 * APIs for setup menu
 ************************************/

import Express from 'express';

export default function () 
{
// create router instance
var router = Express.Router();

router.post('/registration', function (req, res, next) {
         return res.status(200).send("registration successfully.");
});

// ADD ROUTING MIDDLEWARES HERE TO HANDLE 404/500
module.exports = router; 
}
  