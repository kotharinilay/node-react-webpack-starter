'use strict';

/************************************
 * combile all dependancy files for lambda validations
 *  and export together
 * ***********************************/

import tag from '../../../src/server/repository/tag.js';
import contact from '../../../src/server/repository/contact.js';
import models from '../../../src/server/schema';
import uuid from '../../../src/shared/uuid';

export { tag, contact, models, uuid }