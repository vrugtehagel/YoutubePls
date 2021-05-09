(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {youtubePls, player, popups} = window;

    let lastInteraction = Date.now();
    const interact = () => lastInteraction = Date.now();
    const userActive = () => Date.now() - lastInteraction < 5000;
    const isPaused = () => {
        return player.root.classList.contains('paused-mode')
            ?? player.video.paused;
    }

    const eventTypes = ['pointerup', 'pointermove', 'keyup'];

    const tracker = popups.createVisibilityTracker({
        selector: 'yt-notification-action-renderer',
        onvisible: ({element}) => {
            if(userActive()) return;
            if(!isPaused()) return;
            player.video.play();
            // Clicking the popup away is risky, as it may not be the popup
            // we think it is
            const buttons = [...element.querySelectorAll('.buttons > *')]
                .filter(button => button.offsetParent);
            if(buttons.length != 1) return;
            const [button] = buttons;
            button.click();
        }
    });

    youtubePls.addFeature('autoImHere', {
        connect(){
            eventTypes.forEach(type => {
                document.addEventListener(type, interact);
            });
            tracker.connect();
        },
        disconnect(){
            eventTypes.forEach(type => {
                document.removeEventListener(type, interact);
            });
            tracker.disconnect();
        }
    });

})();
