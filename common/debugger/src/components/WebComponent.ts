/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
