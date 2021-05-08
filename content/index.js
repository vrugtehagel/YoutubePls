console.log('YoutubePls started');

// The container for the features. Add a feature by calling
// addFeature with a string for the name and an object with
// properties connect and disconnect. Check the files inside
// content/features for examples.
window.youtubePls = new class YoutubePls {
    #features = {};
    #clickDelay = 100;

    constructor(){
        this.#autoUpdateSettings();
    }

    async initialize(){
        await this.#setupSettings();
    }

    #setFallback(name){
        this.#features[name] ??= {};
        this.#features[name].enabled ??= true;
        this.#features[name].connector ??= {};
    }

    addFeature(name, connector){
        this.#setFallback(name);
        this.#features[name].connector = connector;
        if(this.#features[name].enabled) connector.connect();
    }

    enable(name){
        this.#setFallback(name);
        if(this.#features[name].enabled) return;
        this.#features[name].enabled = true;
        this.#features[name].connector.connect?.();
    }

    disable(name){
        this.#setFallback(name);
        if(!this.#features[name].enabled) return;
        this.#features[name].enabled = false;
        this.#features[name].connector.disconnect?.();
    }

    async click(...elements){
        const delay = this.#clickDelay;
        if(delay) await new Promise(resolve => setTimeout(resolve, delay));
        elements.forEach(element => element.click());
    }

    #applySettings(settings){
        Object.entries(settings).forEach(([setting, enabled]) => {
            if(enabled) this.enable(setting);
            else this.disable(setting);
        });
    }

    async #setupSettings(){
        const settings = await new Promise(resolve => {
            chrome.runtime.sendMessage({type: 'get-settings'}, resolve);
        });
        this.#applySettings(settings);
    }

    #autoUpdateSettings(){
        chrome.runtime.onMessage.addListener((message, sender, respond) => {
            const {type, data} = message;
            if(type != 'settings-change') return;
            console.log('toggle setting');
            this.#applySettings(data);
            respond();
        });
    }
};

// This is a wrapper for the youtube video playing
// it tracks changes in the DOM and emit change events for it.
// Has a root and video property for convenience, and lets you
// create "element trackers" for listening to specific changes
// in the DOM.
window.player = new class MoviePlayer extends EventTarget {
    root = document.getElementById('movie_player');

    constructor(){
        super();
    }

    async initialize(){
        await this.#waitForRoot();
        this.#createElementObserver();
    }

    get video(){ return this.root.querySelector('video'); }

    async #waitForRoot(){
        console.log('no found, searching...');
        if(this.root) return;
        const app = document.querySelector('ytd-app');
        return new Promise(resolve => {
            const observer = new MutationObserver(() => {
                this.root = document.getElementById('movie_player');
                if(!this.root) return console.log('still searching...');
                console.log('found!');
                resolve();
                observer.disconnect();
            });
            observer.observe(app, {childList: true, subtree: true});
        });
    }

    #createElementObserver(){
        const {root} = this;
        new MutationObserver(detail => {
            this.dispatchEvent(new CustomEvent('change', {detail}));
        }).observe(root, {childList: true, subtree: true, attributes: true});
    }

    #createTracker({callbacks, getState}){
        let previousState = 'none';
        const controllers = [];
        const checkStateChange = ({reset} = {}) => {
            if(reset) previousState = 'none';
            const {state, event} = getState();
            if(state == previousState) return;
            previousState = state;
            callbacks['on' + state]?.(event);
        };
        return {
            connect(){
                const controller = new AbortController();
                const {signal} = controller;
                controllers.push(controller);
                window.player.addEventListener('change', () => {
                    checkStateChange();
                }, {signal});
                checkStateChange({reset: true});
            },
            disconnect(){
                controllers.forEach(controller => controller.abort());
            }
        };
    }

    // these create[state]Tracker methods are really useful for most features
    // because they help to reliably and (somewhat) efficiently check when
    // elements pop into and out of the screen or DOM. They return an object
    // of the form {connect, disconnect} that you can use to start listening
    // and stop listening to the elements.
    createVisibilityTracker({selector, onvisible, onhidden}){
        const getState = () => {
            const element = [...this.root.querySelectorAll(selector)]
                .find(element => element.offsetParent);
            const state = element ? 'visible' : 'hidden';
            const event = {element};
            return {state, event};
        };
        const callbacks = {onvisible, onhidden};
        return this.#createTracker({callbacks, getState});
    }

    createPresenceTracker({selector, onpresent, onabsent}){
        const getState = () => {
            const element = this.root.querySelector(selector);
            const state = element ? 'present' : 'absent';
            const event = {element};
            return {state, event};
        };
        const callbacks = {onpresent, onabsent};
        return this.#createTracker({callbacks, getState});
    }
};

Promise.all([
    window.youtubePls.initialize(),
    window.player.initialize()
]).then(() => {
    window.setup = true;
    window.dispatchEvent(new CustomEvent('YoutubePlsLoaded'))
});
