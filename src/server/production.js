
//Load css file from component
require('babel-register')({
    'plugins': [[
        'babel-plugin-transform-require-ignore',
        { extensions: ['.css'] }
    ]]
});

require('../../load.env.js')();
var app = require('./app');

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'production';

// start the server and listen specified port
app.listen(port, err => {
    if (err) { return console.error(err); }
    console.info("==> ✅ Express server is listening");
    console.info(`==> 🌎 Go to http://localhost:${port} [${env}]`);
});   
