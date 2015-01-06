// 
// 
module.exports = {

    getLibrary: function(db, name) {

        var videos = [];

        var qBase = '/library/' + name;

        var mBase = '/media' + qBase + '/';

        try {

            var lib = db.getData(qBase);

            Object.keys(lib).map(function(year) {

                Object.keys(lib[year]).map(function(id) {

                    var vid = lib[year][id];

                    var base = mBase + year + '/';

                    vid.poster = base + id + '.jpg';

                    vid.src = base + id + '?V';

                    vid.subtitle = base + id + '.vtt';

                    videos.push(vid);
                });
            });

            return videos;

        } catch (error) {

            console.error(error);
        }
    },

    getUser: function(uname, password) {

    }
};