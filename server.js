// using express
// server.js (Express 4.0)
var express = require('express');

var bodyParser = require('body-parser');

var compression = require('compression');

var methodOverride = require('method-override');

var db = require('diskdb');

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


app.get('/api/app', function(req, res) {

    res.json({
        "appName": "Home Time",

        "menuTile": "PlayLists",

        "playlists": [{
            "label": "Favorites",
            "icon": "favorite",
            "dataUrl": "/api/playlist/favorites"
        }, {
            "label": "Movies",
            "icon": "theaters",
            "dataUrl": "/api/playlist/movies"
        }, {
            "label": "Music Videos",
            "icon": "drive-video",
            "dataUrl": "/api/playlist/musics"
        }, {
            "label": "Karaoke",
            "icon": "hardware:keyboard-voice",
            "dataUrl": "/api/playlist/karaokes"
        }]
    });

});

app.get('/api/playlist/*', function(req, res) {

    res.json([{
        "poster": "/media/movies/interview.jpg",
        "name": "The Interview",
        "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
        "videoId": "vid.mp4"
    }]);

});


// RUN SERVER
app.listen(3000);
console.log("Hometime mediaser running on port 3000");