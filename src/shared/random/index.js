'use strict';

import Random from 'random-js';

var randomInteger = () => {
    return Random(Random.engines.nativeMath).integer(10000,99999);
}

module.exports = { randomInteger }
