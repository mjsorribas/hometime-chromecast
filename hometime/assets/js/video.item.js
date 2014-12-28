Polymer('video-item', {

    ready: function() {

        var self = this;

        this.$.btn_add.addEventListener('tap', function() {

            self.$.toast_ask.show();
        });

        this.$.btn_confirm.addEventListener('tap', function() {

            self.queues.push(self.video);

            self.$.toast_added.show();

        });

        this.$.btn_go_to_playing.addEventListener('tap', function() {

            self.mode = 1;

        });
    }
});