var axios = require('axios');
var jslinq = require('jslinq');

function HomeController() {}

function get(req, res, next) {
  debugger;
  axios
    .get('https://jsonplaceholder.typicode.com/comments')
    .then(function (resd) {
      var pagesize = req.params.pagesize || 10;
      var pageindex = req.params.pageindex || 1;
      var sortcolumn = req.params.sortcolumn;
      var sortasc = req.params.sortasc == null
        ? true
        : req.params.sortasc;
      var searchtext = req.params.searchtext;
      var skipRec = pagesize * pageindex;

      var queryObj = jslinq(resd.data);
      var result

      if (sortcolumn) {
        if (sortasc == "asc") {
          result = queryObj.orderBy(function (el) {
            return el[sortcolumn];
          }).toList();
        } else {
          result = queryObj.orderByDescending(function (el) {
            return el[sortcolumn];
          }).toList();
        }
      }

      if (searchtext) {
        queryObj = jslinq(result);
        result = queryObj.where(function (el) {
          return el
            .name
            .indexOf(searchtext) != -1 || el
            .email
            .indexOf(searchtext) != -1 || el
            .body
            .indexOf(searchtext) != -1;
        }).toList();
      }

      var total = result.length || 0;

      queryObj = jslinq(result);
      result = queryObj
        .skip(skipRec)
        .take(pagesize)
        .toList();
      // result.total = total; console.log(result);

      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res
        .status(200)
        .json({"data": result, "total": total});
    })
    .catch(function (error) {});
}

HomeController.prototype = {
  get: get
};

var homeController = new HomeController();

module.exports = homeController;
