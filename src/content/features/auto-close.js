(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {youtubePls, player} = window;

    const tracker = player.createVisibilityTracker({
        selector: '.ytp-ad-overlay-close-button',
        onvisible: ({element}) => youtubePls.click(element)
    });


    youtubePls.addFeature('autoClose', {
        connect(){ tracker.connect(); },
        disconnect(){ tracker.disconnect(); }
    });

})();
