// using express
// server.js (Express 4.0)
var express = require('express'),

    bodyParser = require('body-parser'),

    compression = require('compression'),

    methodOverride = require('method-override'),

    JsonDB = require('node-json-db');

var app = express();



// ************* MEDIA SERVER *************

// read media server config infomations
var server_setting = new JsonDB('./db/server_config', true, true);

var rootFolder = __dirname + '/media/';

if (server_setting.getData('/rootFolder') !== rootFolder) {

    server_setting.push('/rootFolder', rootFolder);
}
var vidStreamer = require("vid-streamer").settings(server_setting.getData('/'));

app.get("/media/*", vidStreamer);



// ************* PUBLIC WEBAPP (CHROMECAST SENDER APP) *************

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
app.get('/api/app', function(req, res) {

    res.json(db_sender_app);

});

app.get('/api/playlist/*', function(req, res) {

    var q = req.originalUrl.replace(/.*\//, '');

    var resjson = [];

    switch (q) {
        case 'favorites':
            resjson = [{
                "poster": "/media/movies/interview.jpg",
                "name": "The Interview",
                "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
                "videoId": "vid.mp4"
            }, {
                "poster": "/media/movies/interview.jpg",
                "name": "The Interview",
                "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
                "videoId": "vid.mp4"
            }];
            break;
        case 'movies':
            resjson = [{
                "poster": "/media/movies/interview.jpg",
                "name": "The Interview",
                "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
                "videoId": "vid.mp4"
            }, {
                "poster": "/media/movies/interview.jpg",
                "name": "The Interview",
                "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
                "videoId": "vid.mp4"
            }, {
                "poster": "/media/movies/interview.jpg",
                "name": "The Interview",
                "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
                "videoId": "vid.mp4"
            }];
            break;
        case 'musics':
            resjson = [{
                "poster": "/media/movies/interview.jpg",
                "name": "The Interview",
                "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
                "videoId": "vid.mp4"
            }, {
                "poster": "/media/movies/interview.jpg",
                "name": "The Interview",
                "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
                "videoId": "vid.mp4"
            }, {
                "poster": "/media/movies/interview.jpg",
                "name": "The Interview",
                "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
                "videoId": "vid.mp4"
            }, {
                "poster": "/media/movies/interview.jpg",
                "name": "The Interview",
                "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
                "videoId": "vid.mp4"
            }];
            break;
        case 'karaokes':
            resjson = [{
                "poster": "/media/movies/interview.jpg",
                "name": "The Interview",
                "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
                "videoId": "vid.mp4"
            }];
            break;
        default:
            resjson = [{
                "poster": "/media/movies/interview.jpg",
                "name": "The Interview",
                "description": "Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) are the team behind the popular tabloid-TV show. After learning that North Korea's Kim Jong Un (Randall Park) is a huge fan of the show, they successfully set up an interview with him",
                "videoId": "vid.mp4"
            }];
            // 
    }
    res.json(resjson);
});

// RUN SERVER
app.listen(3000);

console.log("Hometime mediaser running on port 3000");