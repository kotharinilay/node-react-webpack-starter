'use strict';

/************************************
 * combile all dependancy files for lambda validations
 *  and export together
 * ***********************************/

import { getAccessiblePICs } from '../../../src/server/repository/contact.js';
import { getLivestockByCondition } from '../../../src/server/repository/livestock';
import { getDentitionBindings } from '../../../src/server/repository/dentition';
import { getCarcassCategoryBindings } from '../../../src/server/repository/carcasscategory';
import { getButtShapeBindings } from '../../../src/server/repository/buttshape';
import { getBoningGroupBindings } from '../../../src/server/repository/boninggroup';
import { getMSAGraderBindings } from '../../../src/server/repository/msagrader';
import { getHangMethodBindings } from '../../../src/server/repository/hangmethod';
import { getMeatColourBindings } from '../../../src/server/repository/meatcolour';
import { getFatColourBindings } from '../../../src/server/repository/fatcolour';
import { getGradeCodeBindings } from '../../../src/server/repository/gradecode';
import uuid from '../../../src/shared/uuid';

export {
    getAccessiblePICs, uuid, getLivestockByCondition, getDentitionBindings,
    getCarcassCategoryBindings, getButtShapeBindings, getBoningGroupBindings, getMSAGraderBindings,
    getHangMethodBindings, getMeatColourBindings, getFatColourBindings, getGradeCodeBindings
}