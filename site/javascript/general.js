document.addEventListener('DOMContentLoaded', () => {
	const body = document.querySelector('body');
	const readMoreButton = document.getElementById('read-more');
	const main = document.querySelector('main');
	const section = document.querySelector('section');

	const fullMode = bool => {
		body.classList.toggle('full-mode', bool);
		if(body.classList.contains('full-mode')){
			section.style.height = section.scrollHeight + 'px';
		}
		else{
			section.style.height = '0px';
		}
	};

	// check if the browser is Google Chrome
	(() => {
		const isChrome = (() => {
			const isChromium = window.chrome;
			const vendor = navigator.vendor;
			const isOpera = window.opr !== undefined;
			const isIEedge = navigator.userAgent.includes('Edge');
			const isIOSChrome = navigator.userAgent.includes('CriOS');
			if(isIOSChrome) return true;
			if(isIEedge) return false;
			if(isOpera) return false;
			return isChromium && vendor == 'Google Inc.';
		})();

		if(!isChrome) body.classList.add('not-chrome');
	})();

	// set events that toggle or change full-mode
	(() => {
		// "read more" button
		readMoreButton.addEventListener('click', () => fullMode(true));

		// scrolling up and down
		document.addEventListener('wheel', event => {
			if(event.deltaY > 0) fullMode(true);
			if(event.deltaY < 0) fullMode(false);
		});

		// escape quits fullscreen, F11 and f toggle it
		document.addEventListener('keydown', event => {
			if(event.key == 'Escape') return fullMode(false);
			if(event.key == 'F11') return fullMode();
			if(event.key == 'f') return fullMode();
		});

		// touchend event on the main (the video part) toggles it
		main.addEventListener('touchend', () => {
			if(event.target.classList.contains('download-button')) return;
			fullMode();
		});
	})();
});