var express = require('express');
var compression = require('compression');
var path = require('path');
var cors = require('cors');
var app = express();
var static_path = path.join(__dirname, './../build');
var server = require('./config/worker-config');

server.configureWorker(app);
//app.use(compression());

// app.route('/').get(function (req, res) {
//   res.header('Cache-Control', "max-age=60, must-revalidate, private");
//   res.sendFile('index.html', {
//     root: static_path
//   });
// });
app.use(cors());

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use('/', express.static(static_path, {
  maxage: 31557600
}));

var server = app.listen(process.env.PORT || 5000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});