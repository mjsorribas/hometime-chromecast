var fs = require('fs'),
    path = require('path'),
    JsonDB = require('node-json-db'),
    randomstring = require("randomstring");

// second argument <=> auto save after push || if false we have to call .save()
// thirt argument <=> readable format.
var media_db = new JsonDB('./db/media', true, true);

var mediaTypes = media_db.getData('/supportFiles');

// _ht <=> Hometime
var indexedPrefix = '_ht';

var dirTree = function(filename) {

    var stats = fs.lstatSync(filename);

    // if is Directory
    if (stats.isDirectory()) {
        // scan child folder
        fs.readdirSync(filename).map(function(child) {

            return dirTree(filename + '/' + child);
        });

    } else {

        var fileType = path.extname(filename);

        // if is media file
        if (fileType && mediaTypes.indexOf(fileType) > 0) {

            var basename = path.basename(filename); // cotains exts

            // if file haven't indexed
            if (basename.slice(0, 3) != indexedPrefix) {

                // get name and assign to title
                var title = path.basename(basename, fileType);
                var dirname = path.dirname(filename);
                autoGenAndRename(filename, title, dirname, fileType, stats.atime);

            } else {
                console.log('already index file', filename);
            }
        }
    }
};

var autoGenAndRename = function(filename, title, dirname, fileType, atime) {

    var indexedName = indexedPrefix + randomstring.generate() + fileType;

    var newFullname = path.join(dirname, indexedName);

    var db_source = newFullname.replace(__dirname + '/media', '');

    fs.rename(filename, newFullname, function(err) {

        if (err) {
            // retry rename
            console.log(err);
            autoGenAndRename(filename, title, dirname, fileType, atime);

        } else {

            var media = {
                'title': title,
                'fileType': fileType,
                'addTime': atime
            };
            // save to db
            // the last argument <=> overwrite
            media_db.push(db_source, media, false);
        }
    });
};

if (module.parent === undefined) {

    // node dirTree.js ~/foo/bar

    var util = require('util');

    console.log(util.inspect(dirTree(process.argv[2]), false, null));
}

// BEGIN SEARCH in FOLDER and IMPORT to DB
dirTree(__dirname + '/media');

// 

// 
// 
// 
// 
//