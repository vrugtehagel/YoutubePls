(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {youtubePls, player} = window;

    const playIfCookieDialogVisible = () => {
        const selector = 'ytd-consent-bump-v2-lightbox tp-yt-paper-dialog';
        const cookieDialog = document.querySelector(selector);
        if(!cookieDialog?.offsetWidth) return;
        player.video.play();
        cookieDialog.setAttribute('opened', '')
        queueMicrotask(() => cookieDialog.removeAttribute('opened'));
    }

    let controller;

    youtubePls.addFeature('hideCookieDialog', {
        connect(){
            controller = new AbortController();
            const {signal} = controller;
            playIfCookieDialogVisible();
            player.video.addEventListener('pause', () => {
                playIfCookieDialogVisible();
            }, {signal});
        },
        disconnect(){
            controller.abort();
        }
    });

})();
