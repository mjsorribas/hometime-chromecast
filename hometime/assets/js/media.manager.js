Polymer("media-manager", {

    currentMode: 0,

    found: false,

    allVideos: [],

    currentList: 0,

    data: null,

    loggedIn: false,

    loginMessage: '',

    totalResponse: 0,

    dialogMessage: 'Hi there!',

    targetVideo: {
        libIndex: 0,
        vidIndex: 0
    },

    logout: function() {
        this.$.cookie_user.deleteCookie();
        this.loggedIn = this.$.cookie_user.isCookieStored();
        this.$.login_main.hidden = false;
    },

    login: function() {

        var data = {
            email: this.$.u_email.value,
            password: this.$.u_password.value
        };

        this.$.ajax_login.body = JSON.stringify(data);
        this.$.ajax_login.go();
    },

    handleLogin: function(e) {

        var res = JSON.parse(e.detail.response);

        if (res.error) {
            this.loginMessage = 'Email or password you entered is incorrect';
            this.$.login_main.hidden = false;
            this.$.cookie_user.deleteCookie();

        } else if (res.user) {
            var cookie = this.$.cookie_user;
            cookie.value = res.user.email;
            cookie.save();
            this.loggedIn = this.$.cookie_user.isCookieStored();
            this.$.login_main.hidden = true;
        }
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
            this.dialogMessage = 'Found and Imported ' + res.length + ' media file(s) to: ' + this.data.library[this.currentList].label;
        }

        this.$.scan_dialog.toggle();

        this.$.scan_spinner.active = false;

        this.$.btn_scan.disabled = false;
    },

    showEditor: function(e) {
        var targetVideo = this.targetVideo = e.detail;
        var dialog = this.$.edit_dialog;
        var video = this.allVideos[targetVideo.libIndex][targetVideo.vidIndex];
        var base = video.base;
        var newq = '?' + new Date().getTime();
        this.$.input_title.value = video.title;
        this.$.input_description.value = video.description;
        this.$.image_slider.images = [base + '_1.jpg' + newq, base + '_2.jpg' + newq, base + '_3.jpg' + newq, base + '_4.jpg' + newq];
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
        video.poster = '_' + (parseInt(this.$.image_slider.selected) + 1) + '.jpg';
        video.title = this.$.input_title.value;
        video.description = this.$.input_description.value;

        var data = {
            dbUrl: video.base.replace('/media/', '/'),
            video: {
                title: video.title,
                description: video.description,
                poster: video.poster
            }
        };

        this.$.ajax_save.body = JSON.stringify(data);
        this.$.ajax_save.go();
        video.poster = video.poster + '?' + new Date().getTime();
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

        window._self = this;

        this.lister = this.$.lister;

        this.loggedIn = this.$.cookie_user.isCookieStored();

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