// 
var ffmpeg = require('fluent-ffmpeg');
// 
// 
// 
var videoName = 'media/library/funny/2013/_htfeuMH81MOdubPssDAfWmdOLSPkTOCnS2.mp4';

var proc = new ffmpeg('media/library/funny/2013/_htfeuMH81MOdubPssDAfWmdOLSPkTOCnS2.mp4')
    .screenshots({
        count: 4,
        size: '640x480',
        folder: 'media/library/funny/2013/',
        filename: '%b.jpg'
    });