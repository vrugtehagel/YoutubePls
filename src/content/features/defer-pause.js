(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {youtubePls, player} = window;

    const element = document.createElement('div');
    element.attachShadow({mode: 'open'});
    element.shadowRoot.innerHTML = `
        <style>
            div {
                width: 80px;
                aspect-ratio: 1;
                position: absolute;
                inset: 50% auto auto 50%;
                transform: translate(-50%, -50%);
                background: rgb(0 0 0 / 60%);
                border-radius: 50%;
            }
            svg {
                margin: 12px;
                overflow: visible;
                fill: rgb(255 255 255 / 70%);
            }
        </style>
        <div>
            <svg viewBox="0 0 36 36">
                <path d="M11.5 26H15.5V10H11.5ZM20.5 17Q21.5 16 24.5 15V10H20.5ZM36.5 26A1 1 0 0 0 16.5 26A1 1 0 0 0 36.5 26M33.5 26A1 1 0 0 0 19.5 26A1 1 0 0 0 33.5 26M25 20H28V27L25 30L23 28L25 26" style="fill-rule:evenodd;"/>
            </svg>
        </div>
    `;
    element.style.setProperty('pointer-events', 'none', 'important');
    element.style.setProperty('z-index', '1000000', 'important');
    const toggleElement = boolean => {
        if(boolean) player.root.after(element);
        else element.remove();
    }

    const pause = duration =>
        new Promise(resolve => setTimeout(resolve, duration));

    let featureController = null;
    let pauseController = null;
    let ad = false;
    let pauseQueued = false;

    const tracker = player.createPresenceTracker({
        selector: '.ytp-ad-player-overlay',
        onpresent: () => ad = true,
        onabsent: () => ad = false
    });

    const deferPausing = () => {
        pauseController?.abort();
        pauseController = new AbortController();
        const {signal} = pauseController;
        player.video.addEventListener('pause', () => {
            player.video.play();
            if(ad) pauseQueued = !pauseQueued;
            toggleElement(pauseQueued);
        }, {signal});
    };

    const stopDeferring = () => {
        if(pauseQueued) player.video.pause();
        element.remove();
        pauseQueued = false;
        pauseController?.abort();
    };

    youtubePls.addFeature('deferPause', {
        connect(){
            tracker.connect();
            featureController?.abort();
            featureController = new AbortController();
            const {signal} = featureController;
            player.video.addEventListener('loadeddata', async () => {
                await pause(200);
                if(ad) deferPausing();
                else stopDeferring();
            }, {signal});
        },
        disconnect(){
            tracker.disconnect();
            stopDeferring();
            featureController?.abort();
        }
    });

})();
