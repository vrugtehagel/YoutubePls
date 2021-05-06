(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {TrackedElement, youtubePls} = window;
    const tracked = new TrackedElement('.ytp-ad-overlay-close-button');

    tracked.onvisible = element => {
        window.youtubePls.click(element);
    }

    youtubePls.addFeature('autoClose', {
        connect(){ tracked.connect(); },
        disconnect(){ tracked.disconnect(); }
    });

})();
