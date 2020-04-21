document.addEventListener('DOMContentLoaded', function(){
	const ul = document.querySelector('ul');
	chrome.storage.sync.get([
		'mimicClick',
		'muteAds',
		'autoSkip',
		'autoClose',
		'autoImHere'
	], result => {
		let options = {};
		for(let option in result) options[option] = result[option];
		for(let option in options){
			const li = ul.querySelector(`[data-option=${option}]`);
			li.setAttribute('data-value', options[option]);
			li.addEventListener('click', () => {
				const value = li.getAttribute('data-value');
				let newValue = value != 'true';
				options[option] = newValue;
				li.setAttribute('data-value', newValue);
				chrome.storage.sync.set(options, () => {
					chrome.tabs.query({currentWindow: true, active: true}, tabs => {
						const tab = tabs[0];
						chrome.tabs.sendMessage(tab.id, options);
					});
				});
			});
		}
		document.querySelector('body').classList.remove('loading');
	});
});