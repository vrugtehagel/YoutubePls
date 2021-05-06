(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {youtubePls, player, TrackedElement} = window;
    const tracked = new TrackedElement('.ytp-ad-player-overlay');

    let userMuted = player.video.muted;

    tracked.onpresent = () => {
        player.video.muted = true;
    };

    tracked.onabsent = () => {
        player.video.muted = userMuted;
    };

    youtubePls.addFeature('muteAds', {
        connect(){
            userMuted = player.video.muted;
            tracked.connect();
        },
        disconnect(){
            player.video.muted = userMuted;
            tracked.disconnect();
        }
    });

})();
