console.log('YoutubePls started');

window.setup = true;

// can track an element for either presence or visibility.
// set either the onvisible/onhidden for visibility checking, or
// set the onpresent/onabsent properties for presence checking.
// call connect() to start tracking, disconnect() to stop.
window.TrackedElement = class TrackedElement {
    #selector = '';
    #controllers = [];
    #previousState = 'none'; // visible | hidden | present | absent

    onvisible = null;
    onhidden = null;
    onpresent = null;
    onabsent = null;

    constructor(selector){
        this.#selector = selector;
    }

    get type(){
        if(this.onpresent || this.onabsent) return 'presence';
        if(this.onvisible || this.onhidden) return 'visibility';
        return 'none';
    }

    connect(){
        const controller = new AbortController();
        const {signal} = controller;
        this.#controllers.push(controller);
        window.player.addEventListener('change', event => {
            this.#dispatchStateChange();
        }, {signal});
        this.#forceStateChange();
    }

    disconnect(){
        this.#controllers.forEach(controller => controller.abort());
    }

    get element(){
        return window.player.root.querySelector(this.#selector);
    }

    get allElements(){
        return [...window.player.root.querySelectorAll(this.#selector)];
    }

    #forceStateChange(){
        this.#previousState = 'none';
        this.#dispatchStateChange();
    }

    #dispatchStateChange(){
        const previousState = this.#previousState;
        let state = 'none';
        let element = null;
        switch(this.type){
            case 'presence':
                element = this.element;
                state = element ? 'present' : 'absent';
                break;
            case 'visibility':
                const {allElements} = this;
                element = allElements.find(element => element.offsetParent);
                state = element ? 'visible' : 'hidden';
                break;
        }
        if(state == previousState) return;
        this.#previousState = state;
        this['on' + state]?.(element);
    }
};

// this is a wrapper for the youtube video playing
// it tracks changes in the DOM and emit change events for it
// that the TrackedElements can listen to. Has a root and video
// property for convenience.
window.player = new class MoviePlayer extends EventTarget {
    root = document.getElementById('movie_player');

    constructor(){
        super();
        this.#createElementObserver();
    }

    get video(){ return this.root.querySelector('video'); }

    #createElementObserver(){
        const {root} = this;
        new MutationObserver(detail => {
            this.dispatchEvent(new CustomEvent('change', {detail}));
        }).observe(root, {childList: true, subtree: true, attributes: true});
    }
};

// the container for the features. Add a feature by calling
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

window.youtubePls
    .initialize()
    .then(() => window.dispatchEvent(new CustomEvent('YoutubePlsLoaded')));
