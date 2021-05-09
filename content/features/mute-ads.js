(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {youtubePls, player} = window;

    // we don't want to unmute the video if the user has intentionally muted
    // the video, so we need to check if the video was muted by us or the
    // user.
    let userMuted = player.video.muted;
    const tracker = player.createPresenceTracker({
        selector: '.ytp-ad-player-overlay',
        onpresent: () => player.video.muted = true,
        onabsent: () => player.video.muted = userMuted
    });


    youtubePls.addFeature('muteAds', {
        connect(){
            userMuted = player.video.muted;
            tracker.connect();
        },
        disconnect(){
            player.video.muted = userMuted;
            tracker.disconnect();
        }
    });

})();
