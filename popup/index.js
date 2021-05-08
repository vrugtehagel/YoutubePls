document.addEventListener('DOMContentLoaded', async function(){
    const html = document.documentElement;
    const lis = document.querySelectorAll('[data-option]');
    const overlay = document.getElementById('loading-overlay');
    const [tabs, storage] = await Promise.all([
        chrome.tabs.query({url: '*://*.youtube.com/*', status: 'complete'}),
        new Promise(resolve => chrome.storage.sync.get(null, resolve))
    ]);

    // fadeout of loading overlay should be instant if everything finished
    // running quickly, but should fade out if things take a while
    setTimeout(() => {
        overlay.style.setProperty('--fadeout-duration', '.3s');
    }, 500);

    // ask the page what the theme is and match that in the popup
    // we also save it in chrome storage so we can make an educated guess
    html.dataset.theme = storage.theme ?? 'light';
    chrome.tabs.sendMessage(tabs[0].id, {type: 'get-theme'}, response => {
        if(!response) return;
        const {theme} = response;
        html.dataset.theme = theme;
        chrome.storage.sync.set({theme});
    });

    // setup change handlers and initialize each option
    lis.forEach(li => {
        const {option} = li.dataset;
        const toggle = li.querySelector('toggle-switch');
        const value = storage[option];

        li.addEventListener('change', event => {
            const {value} = toggle;
            const data = {[option]: value};
            chrome.storage.sync.set(data);
            for(const tab of tabs){
                chrome.tabs.sendMessage(tab.id, {type: 'settings-change', data});
            }
        });

        toggle.value = value;
    });

    // all has been set up, so hide the loading overlay
    // presumably this happens relatively quickly so the user never
    // even sees the overlay
    overlay.hidden = true;
});
