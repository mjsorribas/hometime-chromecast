Polymer('video-player', {

    logger: function() {
        console.log('logger');
    },

    deviceName: null,

    showCaption: false,

    initializedController: false,

    isFullscreen: false,

    receiverAvailable: false,

    playStates: {

        pausing: 0,

        playing: 1
    },

    playStateClasses: ['pausing', 'playing'],

    playStateIcons: ['av:play-circle-fill', 'av:pause-circle-fill'],

    currentplayState: 0,

    castStates: {

        unavailable: 0,

        disconnected: 1,

        connecting: 2,

        connected: 3
    },

    castStateIcons: ['', 'hardware:cast', 'hardware:chromecast', 'hardware:cast-connected'],

    currentCastState: 1,

    currentSTimeFormated: '00:00:00',

    volumeStateIcons: {

        mute: 'av:volume-off',

        down: 'av:volume-down',

        up: 'av:volume-up'
    },

    nowPlayingIndex: 0,

    initialController: function() {

        console.log('Begin initial controller');

        var self = this;

        var vid = this.$.htmlvideo;

        window.player = this;

        var playButton = this.$.play;

        var nextButton = this.$.next;

        var prevButton = this.$.prev;

        var castButton = this.$.cast;

        var fullscreenButton = this.$.fullscreen;

        var progressSlider = this.$.progress;

        var volumer = this.$.volumer;

        self.initializedController = true;

        self.isFullscreen = false;

        progressSlider.isMousedown = false;

        vid.duration = 0;

        vid.isPlayOnTV = false;

        progressSlider.value = 0;

        volumer.value = vid.volume;

        volumer.isShowing = false;

        if (vid.receiverAvailable)

            self.currentCastState = self.castStates.disconnected;

        vid.addEventListener('media-initialized-on-chromecast', function(e) {

            self.deviceName = e.detail.deviceName;
        });

        //IMPORTANT use this to get the currentTime even when casting
        vid.addEventListener('google-castable-video-timeupdate', function(e) {
            // this first:
            if (!progressSlider.isMousedown) {

                progressSlider.value = e.detail.currentTime * (100 / vid.duration);
            }

            self.currentSTimeFormated = formatTime(vid.bothCurrentTime);

            // if pause on tv and state playing
            if (vid._castMedia !== null) {

                if (vid._bothPaused) {

                    if (vid._castMedia.playerState === 'IDLE') {

                        nextButton.click();

                    } else if (self.currentplayState) {

                        self.currentplayState = 0;
                    }

                } else if (!self.currentplayState) {

                    self.currentplayState = 1;
                }
            }
        });

        // show cast icon when discover available chromecast device
        vid.addEventListener('google-castable-video-receiver-status', function(e) {

            if (!vid.receiverAvailable)

                self.currentCastState = self.castStates.unavailable;

            else {
                self.currentCastState = self.castStates.disconnected;
            }
        });

        //listen for casting event to change icon
        vid.addEventListener('google-castable-video-casting', function(e) {

            if (e.detail.casting) {

                self.currentCastState = self.castStates.connected;

            } else {

                self.currentCastState = self.castStates.disconnected;
            }
        });

        vid.addEventListener('play', function() {

            self.currentplayState = self.playStates.playing;

        });

        vid.addEventListener('pause', function() {

            if (vid._castMedia !== null && vid._castMedia.playerState === 'PLAYING') {

                self.currentplayState = self.playStates.playing;

            } else {

                self.currentplayState = self.playStates.pausing;
            }
        });

        vid.addEventListener('ended', function() {

            var next = self.queues.length - 1 - self.nowPlayingIndex ? self.nowPlayingIndex + 1 : 0;

            // if connected to tv and paused
            if (vid.bothPaused && vid._castMedia !== null) {

                var src = window.location.host + self.queues[next].src;

                var mediaInfo = new chrome.cast.media.MediaInfo(src);
                // TODO get current type from currentsrc
                mediaInfo.contentType = 'video/mp4';

                var request = new chrome.cast.media.LoadRequest(mediaInfo);

                vid._session.loadMedia(request, vid.onMediaDiscovered.bind(vid, 'loadMedia'), function(e) {
                    vid.triggerError('LOAD_MEDIA_ERROR');
                }.bind(vid));

                self.nowPlayingIndex = next;

                vid.play();

            } else {

                self.gotoVideo(next);
            }

        }, false);

        // play/pause

        playButton.addEventListener('click', function() {

            self._deviceName = vid._deviceName;

            if (vid._castMedia !== null) {

                if (vid._castMedia.playerState == 'PLAYING') {

                    vid.pause();

                    self.currentplayState = 0;

                } else if (vid._castMedia.playerState == 'PAUSED') {

                    vid.play();

                    self.currentplayState = 1;
                }
            } else {

                if (self.currentplayState == self.playStates.pausing) {

                    vid.play();

                } else {

                    vid.pause();
                }
            }
        });

        // next
        nextButton.addEventListener('click', function(e) {

            e.stopPropagation();

            e.preventDefault();

            if (self.queues.length - 1 - self.nowPlayingIndex > 0) {

                self.gotoVideo(self.nowPlayingIndex + 1);

                return;

            } else {

                self.gotoVideo(0);

                return;
            }

        });

        // previous
        prevButton.addEventListener('click', function() {

            if (self.nowPlayingIndex) {

                self.gotoVideo(self.nowPlayingIndex - 1);

            } else {

                self.gotoVideo(self.queues.length - 1);
            }

        });

        // drag - drop slider 
        var handleStartSlide = function() {

            progressSlider.isMousedown = true;

        };

        var handleStopSlide = function() {

            if (progressSlider.isMousedown) {

                vid.currentTime = (vid.duration / 100) * progressSlider.immediateValue;

                progressSlider.isMousedown = false;
            }
        };

        // seek
        progressSlider.addEventListener('mousedown', handleStartSlide);

        progressSlider.addEventListener('touchstart', handleStartSlide);

        window.addEventListener('mouseup', handleStopSlide);

        window.addEventListener('touchend', handleStopSlide);

        // volume
        volumer.addEventListener('core-change', function() {

            vid.volume = volumer.value;

            if (volumer.value === 0) {

                self.$.volume_icon.icon = self.volumeStateIcons.mute;

            } else if (volumer.value < 0.5) {

                self.$.volume_icon.icon = self.volumeStateIcons.down;

            } else {

                self.$.volume_icon.icon = self.volumeStateIcons.up;

            }
        });

        self.$.volume_icon.addEventListener('click', function() {

            if (!volumer.isShowing) {

                volumer.classList.add('show');

                volumer.isShowing = true;

                setTimeout(function() {

                    volumer.classList.remove('show');

                    volumer.isShowing = false;

                }, 1500);
            }
        });

        // click cast icon
        castButton.addEventListener('click', function() {

            if (!vid.receiverAvailable) {

                self.$.dialog_nocast.toggle();
            }

            vid.launchSessionManager();
        });

        // fullscreen icon
        fullscreenButton.addEventListener('click', function() {

            if (!self.isFullscreen) {

                if (vid.requestFullscreen) {

                    vid.requestFullscreen();

                } else if (vid.mozRequestFullScreen) {

                    vid.mozRequestFullScreen(); // Firefox

                } else if (vid.webkitRequestFullscreen) {

                    vid.webkitRequestFullscreen(); // Chrome and Safari
                }

                self.isFullscreen = true;

            } else {

                if (document.cancelFullScreen) {

                    document.cancelFullScreen();

                } else if (document.mozCancelFullScreen) {

                    document.mozCancelFullScreen();

                } else if (document.webkitCancelFullScreen) {

                    document.webkitCancelFullScreen();
                }

                self.isFullscreen = false;
            }

        }, false);

        console.log('complete intialize controller');
    },

    ready: function() {

        this.checkInitialize();

    },
    // click play this

    playThis: function(e, detail, sender) {

        var index = parseInt(sender.getAttribute("index"), 0);

        this.gotoVideo(index);
    },

    checkInitialize: function() {

        if (!this.initializedController) {

            this.initialController();
        }
    },

    gotoVideo: function(index) {

        var self = this;

        // self.checkInitialize();

        // pause first
        var vid = this.$.htmlvideo;

        vid.pause();

        vid.currentTime = 0;

        self.currentplayState = self.playStates.pausing;

        // change src
        self.nowPlayingIndex = index;

        vid.querySelector('source').setAttribute("src", self.queues[self.nowPlayingIndex].base + '?V');

        // add active css to item 
        var activeitem = self.shadowRoot.querySelector('.a-video.active');

        if (activeitem !== null) {

            self.shadowRoot.querySelector('.a-video.active').classList.remove('active');
        }

        self.shadowRoot.querySelectorAll('.a-video')[index].classList.add('active');

        // reload
        vid.load();

        // play video
        vid.play();

        self.currentplayState = self.playStates.playing;
    },

    // remove item 
    removeItem: function(e, detail, sender) {

        var self = this;

        window.deg = self;

        var index = parseInt(sender.getAttribute("index"), 0);

        var target = self.shadowRoot.querySelectorAll('.a-video')[index];

        target.classList.add('removed');

        // if the last item in list
        if (self.queues.length == 1) {

            self.$.htmlvideo.pause();
        }

        setTimeout(function() {

            self.queues.splice(index, 1);

        }, 450);
    },

    showHideCaption: function() {

        var self = this;

        self.showCaption = !self.showCaption;

        var tracks = self.$.htmlvideo.textTracks;

        if (self.showCaption) {
            for (var i = 0; i < tracks.length; i++) {
                tracks[i].mode = "showing";
            }
        } else {
            for (var j = 0; j < tracks.length; j++) {
                tracks[j].mode = "hidden";
            }
        }
    }
});

var formatTime = function(sec) {

    var h = Math.floor(((sec % 31536000) % 86400) / 3600);

    var m = Math.floor((((sec % 31536000) % 86400) % 3600) / 60);

    var s = (((sec % 31536000) % 86400) % 3600) % 60;

    if (h) {

        return h + ':' + m + ':' + Math.floor(s);

    } else {

        return m + ':' + Math.floor(s);
    }
};