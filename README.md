# YoutubePls

Too lazy to click the skip buttons in Youtube? Too much effort clicking the x on popup ads? Don't worry, this extension will do it for you.

---

Essentially, this is what this (unpacked) Chrome extension does:
 - skip ads whenever the skip button becomes available
 - click away popup ads in the blink of an eye
 - mute video ads
 - avoid "are you still watching" popups
 - click "next video" rather than waiting for the timer
 - enable picture-in-picture (swap the "miniplayer" button with a "picture-in-picture" button)

All of these can be enabled and disabled. Check the YoutubePls icon in the toolbar for options.

---

## How to create a new feature

This section is mostly for personal reference, but feel free to play around with it yourself. If you think your feature should be added, be sure to make a pull request!

First, think of a short, accurate name for the feature. Let's take "mute ads" as an example. Then:

- Create a file in `content/features/` using the feature name, e.g. `content/features/mute-ads.js`.
- Add the file to the `content_scripts` in `manifest.json`.
- Set a default in `service-worker.js`. For example, add `muteAds: true` to the list of defaults.
- Add a toggle and a description in `popup/index.html` (the data-option attribute should match the name given to the service-worker in the previous step).
- Now, time for the functionality. All of it should be written in the previously created file.

How do you write a new feature? It's easy! Here's the boilerplate feature file:


```javascript
(async () => {
    await new Promise(resolve => {
        if(window.setup) return resolve();
        window.addEventListener('YoutubePlsLoaded', resolve);
    });

    const {youtubePls, player} = window;


    youtubePls.addFeature('[feature name]', {
        connect(){

        },
        disconnect(){

        }
    });

})();

```

The bit at the top is to make sure the setup file runs first, so that you have all the necessary tools available. Then, change `'[feature name]'` to the camel-case feature name (the same as the one you put in the defaults in `service-worker.js`). Now, all you need to do is write your code so that the `connect` method sets everything up that is necessary to make the feature active, and `disconnect` breaks everything down (disconnects event listeners, mutation observers, etc). And, done! Have a look at `content/index.js` for the available tools, and snoop around the existing features for some examples.
