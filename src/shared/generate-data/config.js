/*************************************
 * this is for initial data generation
 * delete 'nconf' package if not needed
 * *************************************/

var nconf = require('nconf');
var path = require('path');
console.log(process.cwd());
console.log(path.join(process.cwd(), '../../', 'src/shared/generate-data/config.json'));
nconf.argv()
	.env()
	.file({
		file: path.join(process.cwd(), '../../', 'src/shared/generate-data/config.json')
	});

module.exports = nconf;