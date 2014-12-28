// using express

var app = require("express")();

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

app.get("/media/*", vidStreamer);

app.listen(3000);

console.log("VidStreamer.js up and running on port 3000");