'use strict';

/**************************************
 * APIs for setup menu
 ************************************/

import {  getAllSpecies } from '../business/species';
export default function (router) 
{
     router.get('/masterdata/species', function (req, res, next) {
         let { language } = req.authInfo;
         return getAllSpecies(language).then(function (result) {
            return res.status(result.status).send(result.response);
        }).catch(function (err) {
            next(err);
        });
     });
}