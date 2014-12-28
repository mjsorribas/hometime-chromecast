// using express
// server.js (Express 4.0)
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var methodOverride = require('method-override');

// setting mediaserver
var settingServer = {

    "mode": "development",

    "forceDownload": false,

    "random": true,

    "rootFolder": __dirname + "/media/",

    "rootPath": "media/",

    "server": "VidStreamer.js/0.1.4",

    "maxAge": "3600",

    "throttle": false
};
var vidStreamer = require("vid-streamer").settings(settingServer);

var app = express();

// MEDIA SERVER
app.get("/media/*", vidStreamer);

// PUBLIC WEBAPP
app.use(compression());
app.use(express.static(__dirname + '/hometime'));
app.use(bodyParser.urlencoded({
    extended: false
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(methodOverride()); // simulate DELETE and PUT


// RUN SERVER
app.listen(3000);
console.log("Hometime mediaser running on port 3000");