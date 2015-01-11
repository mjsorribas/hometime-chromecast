Polymer("media-manager", {

    currentMode: 0,

    found: false,

    allVideos: [],

    currentList: 0,

    data: null,

    totalResponse: 0,

    dialogMessage: 'hi there!',

    targetVideo: {
        libIndex: 0,
        vidIndex: 0
    },

    nextMode: function() {

        this.currentMode = 1;
    },

    prevMode: function() {

        this.currentMode = 0;
    },

    scanFiles: function() {

        this.$.scan_spinner.active = true;

        this.$.btn_scan.disabled = true;

        this.$.ajax_scan.go();
    },

    handleScanRespone: function(e) {

        this.found = false;

        var res = e.detail.response;

        if (!res.length) {
            this.$.scan_dialog.style.backgroundColor = '#FAFAFA';
            this.dialogMessage = 'No new media files in: ' + this.data.library[this.currentList].label;
        } else {
            this.$.scan_dialog.style.backgroundColor = '#DCEDC8';
            this.dialogMessage = 'Found ' + res.length + ' media file(s) in: ' + this.data.library[this.currentList].label;
        }

        this.$.scan_dialog.toggle();

        this.$.spinner.active = false;

        this.$.btn_scan.disabled = false;

    },

    showEditor: function(e) {
        var targetVideo = this.targetVideo = e.detail;
        var dialog = this.$.edit_dialog;
        var video = this.allVideos[targetVideo.libIndex][targetVideo.vidIndex];
        var base = video.base;
        this.$.input_title.value = video.title;
        this.$.input_description.value = video.description;
        this.$.image_slider.images = [base + '_1.jpg', base + '_2.jpg', base + '_3.jpg', base + '_4.jpg'];
        dialog.toggle();
    },

    hideEditor: function() {
        this.$.edit_dialog.toggle();
    },

    generateThumbnail: function() {
        this.$.edit_spinner.active = true;
        var targetVideo = this.targetVideo;
        var video = this.allVideos[targetVideo.libIndex][targetVideo.vidIndex];
        var data = {
            base: video.base,
            fileType: video.fileType
        };
        this.$.ajax_generate_thumb.body = JSON.stringify(data);
        this.$.ajax_generate_thumb.go();
    },

    handleResponseGenerate: function(e) {
        var res = e.detail;
        if (res.response == 'OK') {
            var newq = '?' + new Date().getTime();
            var images = this.$.image_slider.images;
            for (var i = 0; i < images.length; i++) {
                images[i] = images[i] + newq;
            }
        } else {
            console.log('error');
        }
        this.$.edit_spinner.active = false;
    },

    saveEdit: function() {
        this.$.edit_spinner.active = true;
        var self = this;
        var targetVideo = this.targetVideo;
        var video = this.allVideos[targetVideo.libIndex][targetVideo.vidIndex];
        video.title = this.$.input_title.value;
        video.description = this.$.input_description.value;

        var data = {
            dbUrl: video.base.replace('/media/', '/'),
            video: {
                title: video.title,
                description: video.description
            }
        };

        this.$.ajax_save.body = JSON.stringify(data);
        this.$.ajax_save.go();
    },

    handleResponseSave: function(e) {
        this.$.edit_spinner.active = false;
        var res = e.detail;
        if (res.response == 'OK') {
            this.$.edit_dialog.toggle();
        } else {
            console.log('error');
        }
    },

    ready: function() {

        var self = this;

        window.self = self;

        this.lister = this.$.lister;

        this.parse = function(e) {

            self.totalResponse += 1;

            if (self.totalResponse == self.data.library.length) {

                self.bindVideos();

            }

        };

        this.bindVideos = function() {

            self.lister.model = {

                videoLibrary: self.allVideos

            };
        };
    }
});