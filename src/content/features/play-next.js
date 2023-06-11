(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {youtubePls, player} = window;

    const tracker = player.createVisibilityTracker({
        selector: '.ytp-autonav-endscreen-upnext-play-button',
        onvisible: ({element}) => youtubePls.click(element)
    });


    youtubePls.addFeature('playNext', {
        connect(){ tracker.connect(); },
        disconnect(){ tracker.disconnect(); }
    });

})();
