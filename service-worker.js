const defaults = {
    autoSkip: true,
    autoClose: true,
    muteAds: true,
    autoImHere: true,
    mimicClick: true
};

chrome.runtime.onInstalled.addListener(function(){

    // const pageUrl = {hostEquals: 'www.youtube.com'};
    // const {
    //     onPageChanged,
    //     PageStateMatcher,
    //     ShowPageAction
    // } = chrome.declarativeContent;

    // onPageChanged.removeRules(undefined, function(){
    //     onPageChanged.addRules([{
    //         conditions: [new PageStateMatcher({pageUrl})],
    //         actions: [new ShowPageAction()]
    //     }]);
    // });

    chrome.storage.sync.get(Object.keys(defaults), storage => {
        const unset = Object.fromEntries(
            Object.entries(defaults).filter(([key]) => !(key in storage))
        );
        chrome.storage.sync.set(unset);
    });


});

chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if(message.type != 'get-settings') return;
    chrome.storage.sync.get(Object.keys(defaults), respond);
    return true;
});
