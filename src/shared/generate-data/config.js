/*************************************
 * this is for initial data generation
 * delete 'nconf' package if not needed
 * *************************************/

var nconf = require('nconf');
nconf.argv()
	.env()
	.file({
		file: process.cwd() + '/src/shared/generate-data/config.json'
	});

module.exports = nconf;