(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {youtubePls} = window;

    let style = document.createElement('style');
    style.innerHTML = `
        .ytp-miniplayer-button {
            display: none !important;
        }
        .ytp-pip-button {
            display: inline-block !important;
        }
    `;

    youtubePls.addFeature('showPip', {
        connect(){
            document.head.append(style);
        },
        disconnect(){
            style.remove();
        }
    });

})();