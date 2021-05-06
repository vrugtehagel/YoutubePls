// responds to a message from the popup; it asks for what theme
// the page is using (dark/light) so that we can match it in the popup
chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if(message.type != 'get-theme') return;
    const html = document.documentElement;
    const theme = html.hasAttribute('dark') ? 'dark' : 'light';

    respond({theme});
});
