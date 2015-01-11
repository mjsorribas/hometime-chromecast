// 
var ffmpeg = require('fluent-ffmpeg');
// 
// 
// 
var videoName = 'media/library/others/2014/_htdmQr9n4623V1YNIMCT2BmQP0gK7pDWGU.mp4';

var proc = new ffmpeg(videoName)
    .screenshots({
        count: 4,
        size: '460x268',
        folder: 'media/library/others/2014/',
        filename: '%b.jpg'
    });