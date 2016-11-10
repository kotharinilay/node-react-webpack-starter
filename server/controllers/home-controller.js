var axios = require('axios');
var jslinq = require('jslinq');

function HomeController() { }

function get(req, res, next) {
  debugger;
  var functionName = req.params.functionName;
  console.log(functionName);
  axios
    .get('https://jsonplaceholder.typicode.com/' + functionName)
    .then(function (resd) {
      var a = req.query;
      var pagesize = req.query.pagesize || 10;
      var pageindex = req.query.pageindex || 1;
      var sortcolumn = req.query.sortcolumn;
      var sortasc = req.query.sortasc == null
        ? 'asc'
        : req.query.sortasc;
      var searchtext = req.query.searchtext;
      var skipRec = pagesize * (pageindex - 1);
      var filterObj = req.query.filterObj;
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

      if (!result) {
        result = queryObj.toList();
      }

      if (filterObj) {
        filterObj = JSON.parse(filterObj);
        var keys = Object.keys(filterObj);
        for (var key of keys) {
          queryObj = jslinq(result);
          result = queryObj.where(function (el) {
            return el[key]
              .indexOf(filterObj[key].value) != -1
          }).toList();
        }
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
        .json({ "data": result, "total": total });
    })
    .catch(function (error) { });
}

HomeController.prototype = {
  get: get
};

var homeController = new HomeController();

module.exports = homeController;
