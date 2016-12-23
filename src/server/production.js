var app = require('./app');

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'production';

// start the server and listen specified port
app.listen(port, err => {
    if (err) { return console.error(err); }
    console.info("==> ✅ Express server is listening");
	console.info(`==> 🌎 Go to http://localhost:${port} [${env}]`);
});   
