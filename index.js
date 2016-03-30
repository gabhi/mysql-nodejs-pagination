var express = require('express');
var mysql   = require('mysql');
var Promise = require('bluebird');
var bodyParser = require('body-parser');
var app = express();

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'my_db'
});
var queryAsync = Promise.promisify(connection.query.bind(connection));
connection.connect();

// do something when app is closing
// see http://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
process.stdin.resume()
process.on('exit', exitHandler.bind(null, { shutdownDb: true } ));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  var numRows;
  var queryPagination;
  var numPerPage = parseInt(req.query.npp, 10) || 1;
  var page = parseInt(req.query.page, 10) || 0;
  var numPages;
  var skip = page * numPerPage;
console.log(req.query);  
console.log(page)
console.log(numPerPage);
console.log(skip);
// Here we compute the LIMIT parameter for MySQL query
var end_limit = numPerPage; 
 var limit = skip + ',' + end_limit;
console.log(limit);
console.log("SELECT * FROM stocks   DESC LIMIT " + limit);
  queryAsync('SELECT count(*) as numRows FROM stocks')
  .then(function(results) {
    numRows = results[0].numRows;
    numPages = Math.ceil(numRows / numPerPage);
    console.log('number of pages:', numPages);
  })
  .then(() => queryAsync('SELECT * FROM stocks   DESC LIMIT ' + limit))
  .then(function(results) {
    var responsePayload = {
      results: results
    };
    if (page < numPages) {
      responsePayload.pagination = {
        current: page,
        perPage: numPerPage,
        previous: page > 0 ? page - 1 : undefined,
        next: page < numPages - 1 ? page + 1 : undefined
      }
    }
    else responsePayload.pagination = {
      err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
    }
    res.json(responsePayload);
  })
  .catch(function(err) {
    console.error(err);
    res.json({ err: err });
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function exitHandler(options, err) {
  if (options.shutdownDb) {
    console.log('shutdown mysql connection');
    connection.end();
  }
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}
