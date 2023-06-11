(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {youtubePls} = window;
    let intervalId = -1;

    youtubePls.addFeature('autoImHere', {
        connect(){
            setInterval(() => {
                // this triggers the "user active" internal timer
                window.dispatchEvent(new Event('resize'));
            }, 60000)
        },
        disconnect(){
            clearInterval(intervalId);
        }
    });

})();
