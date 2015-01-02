Polymer('video-player', {

    logger: function() {
        console.log('logger');
    },

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

        var vid = this.shadowRoot.querySelector('#html5video');

        var playButton = this.$.play;

        var nextButton = this.$.next;

        var prevButton = this.$.prev;

        var castButton = this.$.cast;

        var fullscreenButton = this.$.fullscreen;

        var progressSlider = this.$.progress;

        var volumer = this.$.volumer;

        self.isFullscreen = false;

        progressSlider.isMousedown = false;

        vid.duration = 0;

        progressSlider.value = 0;

        volumer.value = vid.volume;

        volumer.isShowing = false;

        console.log(vid.receiverAvailable);

        if (!vid.receiverAvailable)

            self.currentCastState = self.castStates.unavailable;

        // play/pause

        playButton.addEventListener('tap', function() {

            if (self.currentplayState == self.playStates.pausing) {

                vid.play();

                self.currentplayState = self.playStates.playing;

            } else {

                vid.pause();

                self.currentplayState = self.playStates.pausing;
            }
        });

        // next
        nextButton.addEventListener('tap', function() {

            if (self.queues.length - 1 - self.nowPlayingIndex) {

                self.gotoVideo(self.nowPlayingIndex + 1);

            } else {

                self.gotoVideo(0);
            }

        });

        // previous
        prevButton.addEventListener('tap', function() {

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

        progressSlider.addEventListener('mousedown', handleStartSlide);

        progressSlider.addEventListener('touchstart', handleStartSlide);

        window.addEventListener('mouseup', handleStopSlide);

        window.addEventListener('touchend', handleStopSlide);

        //IMPORTANT use this to get the currentTime even when casting
        vid.addEventListener('google-castable-video-timeupdate', function(e) {

            if (!progressSlider.isMousedown) {

                progressSlider.value = e.detail.currentTime * (100 / vid.duration);
            }
            self.currentSTimeFormated = formatTime(vid.bothCurrentTime);
        });

        // show cast icon when discover available chromecast device
        vid.addEventListener('google-castable-video-receiver-status', function(e) {

            console.log('available casting', vid.receiverAvailable);

            if (!vid.receiverAvailable)

                self.currentCastState = self.castStates.unavailable;
        });

        //listen for casting event to change icon
        vid.addEventListener('google-castable-video-casting', function(e) {

            if (e.detail.casting) {

                self.currentCastState = self.castStates.connected;

            } else {

                self.currentCastState = self.castStates.disconnected;
            }
        });

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

        vid.addEventListener('ended', function(e) {

            if (self.queues.length - 1 - self.nowPlayingIndex) {

                self.gotoVideo(self.nowPlayingIndex + 1);

            } else {

                self.gotoVideo(0);
            }
        });

        // click cast icon
        castButton.addEventListener('click', function() {

            if (vid.receiverAvailable) {

                console.log('available');

            } else {

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

        self.initializedController = true;
    },

    ready: function() {

        var self = this;

        window.deg = self;

        console.log('video-player ready');

        setTimeout(function() {

            if (!self.initializedController && self.queues.length) {

                self.initialController();
            }
        }, 200);
    },
    // click play this

    playThis: function(e, detail, sender) {

        var index = parseInt(sender.getAttribute("index"), 0);

        this.gotoVideo(index);
    },

    gotoVideo: function(index) {

        var self = this;

        console.log('initializedController = ', self.initializedController);

        if (!self.initializedController) {

            self.initialController();
        }

        // pause first
        var vid = self.shadowRoot.querySelector('#html5video');

        vid.pause();

        vid.currentTime = 0;

        self.currentplayState = self.playStates.pausing;

        // change src
        self.nowPlayingIndex = index;

        vid.querySelector('source').setAttribute("src", self.queues[self.nowPlayingIndex].src);

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

        var index = parseInt(sender.getAttribute("index"), 0);

        var target = self.shadowRoot.querySelectorAll('.a-video')[index];

        target.classList.add('removed');

        setTimeout(function() {

            self.queues.splice(index, 1);

        }, 450);
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