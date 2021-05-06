(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {TrackedElement, youtubePls} = window;
    const tracked = new TrackedElement('.ytp-ad-skip-button');

    tracked.onvisible = element => {
        window.youtubePls.click(element);
    }

    youtubePls.addFeature('autoSkip', {
        connect(){ tracked.connect(); },
        disconnect(){ tracked.disconnect(); }
    });

})();
