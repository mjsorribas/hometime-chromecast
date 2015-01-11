Polymer('video-item', {
    toggleEditor: function() {
        this.fire('toggle-editor', {
            libIndex: this.libIndex,
            vidIndex: this.vidIndex
        });
    }
});