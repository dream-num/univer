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

        const button = document.createElement('button');
        button.textContent = 'Increment';

        button.addEventListener('click', () => {
            const currentCount = Number.parseInt(countDisplay.textContent || '0', 10);
            countDisplay.textContent = (currentCount + 1).toString();
        });

        const style = document.createElement('style');
        style.textContent = `
        .counter-container {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: Arial, sans-serif;
        }

        .count-display {
            font-size: 1.5rem;
            font-weight: bold;
        }

        button {
            padding: 5px 10px;
            font-size: 1rem;
            cursor: pointer;
            border: none;
            background-color: #007bff;
            color: white;
            border-radius: 4px;
        }

        button:hover {
            background-color: #0056b3;
        }`;

        shadow.appendChild(style);
        shadow.appendChild(container);
        container.appendChild(countDisplay);
        container.appendChild(button);
    }
}
