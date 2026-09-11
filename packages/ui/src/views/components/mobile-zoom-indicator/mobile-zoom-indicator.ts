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

import { Disposable } from '@univerjs/core';

export class MobileZoomIndicator extends Disposable {
    private readonly _element: HTMLDivElement;
    private _hideTimer: number | null = null;

    constructor(private readonly _canvasElement: HTMLCanvasElement) {
        super();

        const element = document.createElement('div');
        element.className = [
            'univer-absolute',
            'univer-left-1/2',
            'univer-top-1/2',
            '-univer-translate-x-1/2',
            '-univer-translate-y-1/2',
            'univer-select-none',
            'univer-rounded-lg',
            'univer-bg-gray-900',
            'univer-px-6',
            'univer-py-3',
            'univer-text-2xl',
            'univer-font-bold',
            'univer-text-gray-0',
            'univer-shadow-lg',
        ].join(' ');
        element.style.opacity = '0';
        element.style.pointerEvents = 'none';
        element.style.transition = 'opacity 150ms ease-in-out';
        element.style.zIndex = '10000';
        this._element = element;

        this._mount();
    }

    show(percentage: number): void {
        this._mount();
        if (this._hideTimer != null) {
            window.clearTimeout(this._hideTimer);
            this._hideTimer = null;
        }
        this._element.textContent = `${percentage}%`;
        this._element.style.opacity = '1';
    }

    hide(): void {
        if (this._hideTimer != null) {
            window.clearTimeout(this._hideTimer);
        }
        this._hideTimer = window.setTimeout(() => {
            this._hideTimer = null;
            this._element.style.opacity = '0';
        }, 300);
    }

    override dispose(): void {
        if (this._hideTimer != null) {
            window.clearTimeout(this._hideTimer);
            this._hideTimer = null;
        }
        this._element.remove();
        super.dispose();
    }

    private _mount(): void {
        const container = this._canvasElement.parentElement;
        if (container == null || this._element.parentElement === container) {
            return;
        }
        if (window.getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        container.appendChild(this._element);
    }
}
