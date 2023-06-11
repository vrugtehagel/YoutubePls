const template = document.createElement('template');
template.innerHTML = `
    <div id="container">
        <div id="track" part="track"></div>
        <div id="thumb" part="thumb"></div>
    </div>

    <style>
        :host {
            --toggle-duration: .1s;
            display: inline-block;
            height: 1rem;
            width: 2rem;
            vertical-align: middle;
            cursor: pointer;
        }

        #container {
            max-width: 100%;
            max-height: 100%;
            aspect-ratio: 2 / 1;
            position: relative;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        #track {
            width: 87.5%;
            height: 75%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: rgb(130 136 144);
            background-color: currentcolor;
            border-radius: 50% / 100%;
            opacity: 0.5;
            transition: var(--toggle-duration, .1s);
        }

        #thumb {
            height: 100%;
            aspect-ratio: 1 / 1;
            position: absolute;
            top: 50%;
            left: 0;
            transform: translate(0, -50%);
            color: white;
            background-color: currentcolor;
            border-radius: 50%;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 40%);
            transition: var(--toggle-duration, .1s);
        }

        :host([checked]) #track {
            color: rgb(26 115 232);
        }

        :host([checked]) #thumb {
            color: rgb(26 115 232);
            left: 100%;
            transform: translate(-100%, -50%);
        }
    </style>
`;

customElements.define('toggle-switch', class extends HTMLElement {
    #internals = null;
    #controllers = [];

    static get formAssociated() { return true; }
    static get observedAttributes(){ return ['checked']; }

    constructor(){
        super();
        this.#internals = this.attachInternals();
        this.attachShadow({mode: 'closed'})
            .append(template.content.cloneNode(true));
    }

    connectedCallback(){
        this.#attachClickHandler();
        this.#attachKeydownHandler();
        this.setAttribute('tabindex', 0);
        this.setAttribute('role', 'checkbox');
        this.ariaChecked = false;
    }

    disconnectedCallback(){
        this.#controllers.forEach(controller => controller.abort());
    }

    attributeChangedCallback(attribute, oldValue, newValue){
        const checked = newValue != null;
        this.#internals.setFormValue(checked);
        this.ariaChecked = checked;
        this.dispatchEvent(new Event('change', {bubbles: true}));
    }

    get name(){ return this.getAttribute('name'); }
    set name(value){ this.setAttribute('name', value); }

    get form(){ return this.#internals.form; }

    get checked(){ return this.hasAttribute('checked'); }
    set checked(value){ this.toggleAttribute('checked', Boolean(value)); }

    get value(){ return this.hasAttribute('checked'); }
    set value(value){ this.toggleAttribute('checked', Boolean(value)); }

    toggle(boolean = !this.checked){ return this.checked = boolean; }

    #attachClickHandler(){
        const controller = new AbortController();
        const {signal} = controller;
        this.addEventListener('click', () => this.toggle(), {signal});
        this.#controllers.push(controller);
    }

    #attachKeydownHandler(){
        const controller = new AbortController();
        const {signal} = controller;
        this.addEventListener('keydown', event => {
            if(event.key != ' ') return;
            this.toggle()
        }, {signal});
        this.#controllers.push(controller);
    }

});
