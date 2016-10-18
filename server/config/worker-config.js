var bodyParser = require('body-parser');
var routeConfig = require('./route-config');

function WorkerConfig() {
}

//module.exports =
function configureWorker(application) {
    configureApplication(application);
    configureRoutes(application);
}

function configureApplication(application) {
    application.use(bodyParser.json());
    application.enable('trust proxy');
    application.use(function (req, res, next) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.type('application/json');
        next();
    });
}

function configureRoutes(application) {
    routeConfig.registerRoutes(application);
}

//configureWorker(application);

WorkerConfig.prototype = {
    configureWorker : configureWorker
}

var workerconfig = new WorkerConfig();

module.exports = workerconfig;