console.log('Convenient Youtube started.');
(function(){
	const log = (message, type) => {
		//return;
		if(type == 'warn') console.warn(message);
		else console.log(message);
	}
	const ytdApp = document.querySelector('ytd-app');
	let muted = false;
	let volume = null;
	let userActive = true;
	let adModuleObserver = null;
	let fakeClickId = -1;
	let options = {
		mimicClick: true,
		muteAds: false,
		autoSkip: true,
		autoClose: true,
		autoImHere: true
	};

	const lookFor = ({
		element: element,
		config: config,
		pattern: pattern,
		ontrue: ontrue = () => {},
		onfalse: onfalse = () => {},
		onchange: onchange = () => {}
	}) => {
		let patternFound = pattern();
		const callback = value => {
			if(value) ontrue();
			else onfalse();
		};
		callback(patternFound);
		const observer = new MutationObserver(() => {
			if(pattern() == patternFound) return;
			patternFound = !patternFound;
			callback(patternFound);
			onchange();
		});
		observer.observe(element, config);
		return observer;
	};

	const isHidden = element => getComputedStyle(element).display == 'none';

	const isPaused = () => {
		const player = document.querySelector('ytd-player');
		if(!player) return;
		const paused = player.querySelector('.paused-mode');
		const playing = player.querySelector('.playing-mode');
		if(paused && !playing) return true;
		if(!paused && playing) return false;
		log('\tI\'m confused - is the video paused or not?', 'warn');
		return false;
	};

	const unpause = () => {
		const player = document.querySelector('ytd-player');
		if(!player) return;
		const paused = player.querySelector('.paused-mode');
		const playing = player.querySelector('.playing-mode');
		if(!paused && playing) return;
		if(!(paused && !playing)) return log('\tI\'m confused - is the video paused or not?', 'warn');
		const button = player.querySelector('.ytp-play-button.ytp-button');
		button.click();
	};

	const clickButton = callback => {
		//callback();
		clearTimeout(fakeClickId);
		fakeClickId = setTimeout(() => {
			try{ callback(); }
			catch(error){ log('Error: clicking failed.', 'warn'); }
		}, 150);
	};

	const getChild = (element, classname) => {
		const match = Array.from(element.children).find(child => child.classList.contains(classname));
		if(match) return match;
		return false;
	};

	const mute = () => {
		if(!options.muteAds) return;
		if(muted) log('I double muted something!', 'warn');
		const video = document.querySelector('video.video-stream.html5-main-video');
		if(!video) return;
		if(video.volume) volume = video.volume;
		video.volume = 0;
		muted = true;
	};

	const unmute = () => {
		if(!options.muteAds) return;
		if(!muted) log('I double unmuted something!');
		const video = document.querySelector('video.video-stream.html5-main-video');
		if(!video) return;
		if(!volume) return;
		video.volume = volume;
		muted = false;
	};

	// keep the options up to date
	(() => {
		chrome.storage.sync.get(['mimicClick', 'muteAds', 'autoSkip', 'autoClose', 'autoImHere'], result => {
			for(let option in result) options[option] = result[option];
		});

		chrome.runtime.onMessage.addListener(message => {
			for(let option in options){
				options[option] = message[option];
			}
		});
	})();

	// check for user input to detect when the user is inactive
	(() => {
		let id = -1;
		const resetTimer = () => {
			clearTimeout(id);
			userActive = true;
			id = setTimeout(() => userActive = false, 10000);
		};
		['mousemove', 'mousedown', 'mouseup', 'scroll', 'mousewheel', 'keypress', 'touchstart', 'touchmove', 'touchend'].forEach(event => {
			document.addEventListener(event, resetTimer);
		});
	})();

	// look for mutations and changes on the page
	lookFor({
		element: ytdApp,
		config: {attributes: true, childList: true, subtree: true},
		pattern: () => {
			if(!(ytdApp.hasAttribute('is-watch-page') || ytdApp.hasAttribute('miniplayer-active_'))) return false;
			if(!ytdApp.querySelector('.video-ads.ytp-ad-module')) return false;
			return true;
		},
		ontrue: () => {
			//log('You\'re watching a video.')
			const adModule = ytdApp.querySelector('.video-ads.ytp-ad-module');
			const popupContainer = ytdApp.querySelector('ytd-popup-container');
			if(!adModule) return;
			let unskippableAdFound = false;
			adModuleObserver = lookFor({
				element: adModule,
				config: {childList: true},
				pattern: () => !!adModule.children.length,
				ontrue: () => {
					//log('\tAn ad has loaded.');
					for(let i = 0; i < adModule.children.length; ++i){
						const child = adModule.children[i];
						if(child.classList.contains('ytp-ad-overlay-slot')){
							//log('\t\tIt\'s a popup ad (' + child.children[0].children.length + ' found),');
							let foundAd = false;
							for(let j = 0; j < child.children[0].children.length; ++j){
								const ad = child.children[0].children[j];
								if(isHidden(ad)) continue;
								foundAd = true;
								const closeButton = ad.querySelector('.ytp-ad-overlay-close-button');
								clickButton(() => {
									closeButton.click();
									//log('\t\t\tand I clicked it away');
									log('\tclicked away popup ad');
								});
								break;
							}
							if(!foundAd){
								log('\tinvisible ad - no action required');
								//log('\t\t\tbut it was not visible, so I left it be');
							}
						}
						if(child.classList.contains('ytp-ad-player-overlay')){
							//log('\t\tIt\'s a video ad,');
							mute();
							const persistingOverlay = getChild(adModule, 'ytp-ad-persisting-overlay');
							if(persistingOverlay){
								//log('\t\t\tand it has a persisting overlay, whatever that means.');
								const skipButtonSlot = persistingOverlay.querySelector('.ytp-ad-skip-button-slot');
								lookFor({
									element: skipButtonSlot,
									config: {attributes: true},
									pattern: () => !isHidden(skipButtonSlot),
									ontrue: () => {
										//log('\t\t\t\tI see the skip button,');
										clickButton(() => {
											//log('\t\t\t\tand I clicked it.');
											log('\tvideo ad skipped');
											skipButtonSlot.children[0].click();
											unmute();
										});
									}
								});
							}
							else {
								//log('\t\t\tand it look pretty normal.');
								const skipButtonSlot = child.querySelector('.ytp-ad-skip-button-slot');
								if(!skipButtonSlot){
									//log('\t\t\t\tbut there is no skip button.');
									log('\tvideo ad not skippable');
									unskippableAdFound = true;
									/*lookFor({
										element: adModule,
										config: {childList: true},
										pattern: () => !!getChild(adModule, )
									})*/
								}
								else{
									lookFor({
										element: skipButtonSlot,
										config: {attributes: true},
										pattern: () => !isHidden(skipButtonSlot),
										ontrue: () => {
											//log('\t\t\t\tI see the skip button,');
											clickButton(() => {
												//log('\t\t\t\tand I clicked it.');
												log('\tvideo ad removed');
												skipButtonSlot.children[0].click();
												unmute();
											});
										}
									});
								}
							}
						}
					}
				},
				onfalse: () => {
					if(unskippableAdFound){
						unskippableAdFound = false;
						unmute();
					}
					//log('\tAll the ads are gone!');
				}
			});
			lookFor({
				element: popupContainer,
				config: {childList: true, attributes: true, subtree: true},
				onchange: () => {
					dialogs = Array.from(popupContainer.children);
				},
				pattern: () => {
					if(isPaused()) return true;
					return false;
					//if(userActive) return false;
					//if(dialogs.length + 1 != popupContainer.children.length) return false;
					//if(newDialogs.length != 1) return false;
					//return true;
				},
				ontrue: () => {
					unpause();
					const buttons = popupContainer.querySelectorAll('yt-confirm-dialog-renderer .buttons > :not([hidden])');
					if(buttons.length == 1){
						buttons[0].click();
						log('\tclicked away the "are you still there" window');
					}
					//const annoyingDialog = Array.from(popupContainer.children).filter(dialog => !dialogs.includes(dialog))[0];
					//console.log(dialogs, popupContainer.children, annoyingDialog);
					//const buttons = annoyingDialog.querySelector('.buttons');
					//if(buttons.children.length > 2) return;
					//if(!options.autoImHere) return;
					//Array.from(buttons.children).forEach(button => {
					//	if(button.children.length == 0) return;
					//	button.click();
					//	while(popupContainer.firstChild) popupContainer.removeChild(popupContainer.lastChild);
					//	log('\t\tI tried to click it away.');
					//});
				}
			});
		},
		onfalse: () => {
			//log('You\'re browsing.')
			if(adModuleObserver) adModuleObserver.disconnect();
		}
	});
})();