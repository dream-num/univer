export class CounterComponent extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });

        const container = document.createElement('div');
        container.setAttribute('class', 'counter-container');

        const countDisplay = document.createElement('span');
        countDisplay.setAttribute('class', 'count-display');
        countDisplay.textContent = '0';

        const a = document.createElement('a');
        a.textContent = '🍔';

        a.addEventListener('click', (e) => {
            e.preventDefault();
            const currentCount = Number.parseInt(countDisplay.textContent || '0', 10);
            countDisplay.textContent = (currentCount + 1).toString();
        });

        const style = document.createElement('style');
        style.textContent = `
        .counter-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .count-display {
            position: relative;
            top: 2px;
            font-size: 10px;
        }

        a {
            font-size: 10px;
        }`;

        shadow.appendChild(style);
        shadow.appendChild(container);
        container.appendChild(countDisplay);
        container.appendChild(a);
    }
}
