const section = document.querySelector('main section')

document.addEventListener('wheel', event => {
	if(!event.deltaY) return
	if(event.deltaY > 0) enterFullMode()
	else leaveFullMode()
})

document.querySelector('#read-more').addEventListener('click', enterFullMode)

function enterFullMode(){
	document.body.classList.add('full-mode')
	section.style.setProperty('height', section.scrollHeight + 'px')
}

function leaveFullMode(){
	document.body.classList.remove('full-mode')
	section.style.removeProperty('height')
}
