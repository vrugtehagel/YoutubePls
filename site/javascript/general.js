document.addEventListener('DOMContentLoaded', () => {
	const body = document.querySelector('body');
	const readMoreButton = document.getElementById('read-more');
	const section = document.querySelector('section');

	readMoreButton.addEventListener('click', () => fullMode(true));

	const fullMode = bool => {
		body.classList.toggle('full-mode', bool);
		if(body.classList.contains('full-mode')){
			section.style.height = section.scrollHeight + 'px';
		}
		else{
			section.style.height = '0px';
		}
	};

	const isChrome = (() => {
		const isChromium = window.chrome;
		const vendor = window.navigator.vendor;
		const isOpera = typeof window.opr !== "undefined";
		const isIEedge = window.navigator.userAgent.indexOf("Edge") > -1;
		const isIOSChrome = window.navigator.userAgent.match("CriOS");
		if(isIOSChrome) return true;
		return (isChromium !== null &&
			typeof isChromium !== "undefined" &&
			vendor === "Google Inc." &&
			isOpera === false &&
			isIEedge === false);
	})();
	if(!isChrome) body.classList.add('not-chrome');

	document.addEventListener('wheel', event => {
		if(event.deltaY > 0) fullMode(true);
		if(event.deltaY < 0) fullMode(false);
	});

	document.addEventListener('keydown', event => {
		if(event.key == 'Escape') return fullMode(false);
		if(event.key == 'F11') return fullMode();
		if(event.key == 'f') return fullMode();
	});
});