// using express
// server.js (Express 4.0)
var express = require('express'),

    bodyParser = require('body-parser'),

    compression = require('compression'),

    methodOverride = require('method-override'),

    JsonDB = require('node-json-db');

var app = express();

var media_db = new JsonDB('./db/media', true, true);

var db_hometime = require('./db/db-hometime');




// ************* MEDIA SERVER *************

// read media server config infomations
var server_setting = new JsonDB('./db/server_config', true, true);

var rootFolder = __dirname + '/media/';

if (server_setting.getData('/rootFolder') !== rootFolder) {

    server_setting.push('/rootFolder', rootFolder);
}
var vidStreamer = require("vid-streamer").settings(server_setting.getData('/'));

app.get("/media/*", vidStreamer);



// ************* MEDIA MANAGER *************
app.use('/m', express.static(__dirname + '/media-manager'));

// get new item
app.get('/scan/*', function(req, res) {

    media_db.reload();

    var library = req.originalUrl.replace(/.*\//, '');

    var newItems = db_hometime.scanNewItem(library);

    res.json(newItems);
});




// ************* CHROMECAST SENDER APP *************

// load sender app beginer infomation
var db_sender_app = new JsonDB('./db/sender_app', true, true).getData('/');

app.use(compression());

app.use(express.static(__dirname + '/hometime'));

app.use(bodyParser.urlencoded({

    extended: false

})); // parse application/x-www-form-urlencoded

app.use(bodyParser.json()); // parse application/json

app.use(methodOverride()); // simulate DELETE and PUT

// load chromecast sender app beginer data
app.get('/app', function(req, res) {

    res.json(db_sender_app);
});


// get media files
app.get('/library/*', function(req, res) {

    media_db.reload();

    var library = req.originalUrl.replace(/.*\//, '');

    var videos = db_hometime.getLibrary(media_db, library);

    res.json(videos);
});

// RUN SERVER

app.listen(3000);


console.log("Hometime mediaser running on port 3000");