// import express to use it
var express = require('express');
// execute express
var router = express.Router();
// import fs library
var fs = require('fs');
// import mongodb
var mongo = require('mongodb').MongoClient;
// get object ID
var objectID = require('mongodb').ObjectID;
// used for testing
var assert = require('assert');


// import phantom to render pdf file
var phantom = require('phantom');
var jsonURL = "http://localhost:3000/displayJSON.html";

// makes pdf super long and skinny
/*router.get('/getPDF', function(request, response) {
  phantom.create().then(function(ph) {
      ph.createPage().then(function(page) {
          page.open(jsonURL).then(function(status) {
              page.render('data.pdf').then(function() {
                page.property('viewportSize', {width: 5000, height: 5000}).then(function() {
                  console.log('Page Rendered');
                  response.redirect('/displayJSON.html');
                  ph.exit();
                })
              });
          });
      });
  });

})*/


// parse response body
var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
router.use(bodyParser.json())

// upon runinng server
console.log("server started");

var url = 'mongodb://localhost:27017/users';


// open static files in folder
router.use(express.static('views'));

// get data from database
router.get('/getData', function(request, response) {
  var result = [];
  //console.log(sectionCount);
  mongo.connect(url, function(error, db) {
    assert.equal(null, error);
    console.log("connected to database");
    var collection = db.collection('users');
    collection.find({}).toArray(function(error, result) {
      assert.equal(null, error);
      console.log(result);
      response.redirect('/');
      db.close();
    });

    // cursor pointing to data we get back
    /*var cursor = db.collection('data').find();
    // get actual data
    console.log(cursor);
    cursor.forEach(function(document, error) {
      assert.equal(null, error);
      result.push(document);
    }, function() {
      db.close();
      console.log(result);
      //response.render('index', {item: result})
    });*/
  })
});

// insert data into database
router.post('/insert', function(request, response) {

  // save every section in database
  var dictionarySize = Object.keys(request.body).length;
  var numOfSections = dictionarySize/2;

  var dictionaryData = request.body;
  var dictionaryKeys = Object.keys(dictionaryData);

  var items = [];

  for (var i = 0; i < dictionarySize; i+=2) {
    var item = {
      title: dictionaryData[dictionaryKeys[i]],
      content: dictionaryData[dictionaryKeys[i+1]]
    };

    // print item to insert
    console.log(item);
    items.push(item);
  }

  console.log("All items" + items);

  // redirect to home page
  response.redirect('/');
  console.log("preparing to insert");

  // connect to mongo db db
  mongo.connect(url, function(error, db) {
    //assert.equal(null, error);
    console.log("connected to database");
    // insert in db
    console.log(db);
    /*db.collection('data').insertOne(item, function(error, result) {
      assert.equal(null, error);
      console.log("Item inserted in database");
      db.close();
    })*/
    db.collection('users').insert(items, function() {
      assert.equal(null, error);
      console.log("successfully inserted");
      db.close();
    });
  });

});

// delete data from database
router.post('/deleteData', function(request, response) {

  // get id to be deleted
  var id = request.body.id;

  response.redirect('/');

  mongo.connect(url, function(error, db) {
    assert.equal(null, error);
    db.collection('users').deleteOne({"_id": objectID(id)}, function (error, result) {
      assert.equal(null, error);
      console.log("Item: " + id + " has been deleted");
      db.close();
    })
  });

});



/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/

module.exports = router;