const defaults = {
    autoClose: true,
    autoImHere: true,
    autoSkip: true,
    deferPause: true,
    hideCookieDialog: false,
    muteAds: true,
    playNext: false,
    showPip: false
};

chrome.runtime.onInstalled.addListener(async function(){

    chrome.storage.sync.get(Object.keys(defaults), storage => {
        const unset = Object.fromEntries(
            Object.entries(defaults).filter(([key]) => !(key in storage))
        );
        chrome.storage.sync.set(unset);
    });

    // Reload the youtube tabs so changes can take effect and we don't
    // run into a problem with trying to communicate with a tab that
    // doesn't listen
    const query = {url: '*://*.youtube.com/*'};
    const tabs = await chrome.tabs.query(query);
    tabs.forEach(tab => chrome.tabs.reload(tab.id));
});

chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if(message.type != 'get-settings') return;
    chrome.storage.sync.get(Object.keys(defaults), respond);
    return true;
});
