Polymer('video-item', {
    toggleEditor: function() {
        this.$.dialog.toggle();
    },
    saveEdit: function() {

        var self = this;
        this.$.spinner.active = true;
        this.video.title = this.$.title.value;
        this.video.description = this.$.description.value;

        var data = {
            dbUrl: self.video.src.replace('/media/', '/').replace('?V', ''),
            video: {
                title: self.video.title,
                description: self.video.description
            }
        };

        this.$.ajax_save.body = JSON.stringify(data);
        this.$.ajax_save.go();

    },
    handleResponseSave: function(e) {
        this.$.spinner.active = false;
        var res = e.detail;
        if (res.response == 'OK') {
            this.$.dialog.toggle();
        } else {
            console.log('error');
        }
    }
});