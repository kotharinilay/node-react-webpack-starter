
function HomeController() {
}

function get(req, res, next) {
  var param = req.params.testid;
  res.status(200).json({ 'you passed' : param });
}

HomeController.prototype = {
  get: get
};

var homeController = new HomeController();

module.exports = homeController;
