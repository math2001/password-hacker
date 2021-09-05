import { querySelector } from "../utils";

const symbols = {
    "failure": '✗',
    "success": '✓',
}

export class AlertBox {
    elements: {
        box: HTMLElement;
        symbol: HTMLElement;
        message: HTMLElement;
        close: HTMLElement;
    };

    constructor(selector: string) {
        const box = querySelector(selector)
        
        const [symbol, message, close] = this._makeHtml(box)
        this.elements = {box, symbol, message, close}

        this.elements.close.addEventListener('click', this.hide)
    }

    show = (type: Extract<keyof typeof symbols, string>, messageHTML: string) => {
        this.elements.box.classList.remove('hidden')
        this.elements.box.setAttribute('data-alert-type', type)
        this.elements.symbol.textContent = symbols[type]
        this.elements.message.innerHTML = messageHTML;
    }

    hide = () => {
        this.elements.box.classList.add('hidden')
    }

    private _makeHtml(box: HTMLElement): [HTMLElement, HTMLElement, HTMLElement] {
        box.classList.add('hidden', 'alertbox')

        const symbol = document.createElement('span')
        symbol.classList.add("alertbox-symbol")
        const message = document.createElement('span')
        message.classList.add("alertbox-message")
        const close = document.createElement('button')
        close.type = "button"
        close.classList.add("alertbox-close")
        close.innerHTML = '&times;'

        box.appendChild(symbol)
        box.appendChild(message)
        box.appendChild(close)
        
        return [symbol, message, close]
    }
}