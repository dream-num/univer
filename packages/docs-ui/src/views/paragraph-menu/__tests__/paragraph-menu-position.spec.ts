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

import type { IPopup } from '@univerjs/ui';
import { DocumentBlockType } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { observeParagraphMenuPosition } from '../paragraph-menu-position';

function createPopup(kind = DocumentBlockType.PARAGRAPH) {
    const resizeCallbacks: Array<() => void> = [];
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
        constructor(callback: () => void) {
            resizeCallbacks.push(callback);
        }

        observe() {}
        disconnect = disconnect;
    });
    vi.stubGlobal('innerWidth', 1000);
    vi.stubGlobal('innerHeight', 1000);
    const element = document.createElement('section');
    element.style.top = '-9999px';
    element.style.left = '-9999px';
    element.appendChild(document.createElement('button'));
    document.body.appendChild(element);
    Object.defineProperties(element, {
        clientWidth: { configurable: true, value: 40 },
        clientHeight: { configurable: true, value: 28 },
    });
    const canvasElement = document.createElement('canvas');
    const getBoundary = vi.spyOn(canvasElement, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1000, 1000));
    const anchorRect$ = new BehaviorSubject({ left: 400, right: 400, top: 400, bottom: 440 });
    const targets$ = new BehaviorSubject({ kind });
    const popup: IPopup = { unitId: 'doc', subUnitId: 'body', componentKey: 'paragraph-menu', canvasElement, anchorRect$ };
    const dispose = observeParagraphMenuPosition(element, popup, targets$);
    onTestFinished(() => {
        dispose();
        element.remove();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });
    return { element, anchorRect$, targets$, resizeCallbacks, disconnect, getBoundary, dispose };
}

describe('Docs paragraph menu positioning', () => {
    it.each([DocumentBlockType.PARAGRAPH, DocumentBlockType.TABLE])('places the initial %s trigger without animation', (kind) => {
        const { element } = createPopup(kind);
        expect(element.style.transition).toBe('');
        expect(element.style.left).toBe(kind === DocumentBlockType.TABLE ? '360px' : '352px');
        expect(element.style.top).toBe(kind === DocumentBlockType.TABLE ? '372px' : '406px');
    });

    it('moves the same trigger and corrects shared popup writes after table/paragraph switches', async () => {
        const { element, anchorRect$, targets$ } = createPopup();
        const trigger = element.firstChild;
        anchorRect$.next({ left: 500, right: 500, top: 500, bottom: 540 });
        expect(element.style.left).toBe('452px');
        expect(element.style.top).toBe('506px');
        expect(element.style.transition).toBe('top 100ms ease-out, left 100ms ease-out');

        targets$.next({ kind: DocumentBlockType.TABLE });
        expect(element.style.left).toBe('460px');
        expect(element.style.top).toBe('472px');
        element.style.left = '452px';
        element.style.top = '506px';
        await Promise.resolve();
        expect(element.style.left).toBe('460px');
        expect(element.style.top).toBe('472px');

        targets$.next({ kind: DocumentBlockType.PARAGRAPH });
        expect(element.style.left).toBe('452px');
        expect(element.style.top).toBe('506px');
        expect(element.firstChild).toBe(trigger);
    });

    it('keeps the trigger inside a resized canvas and releases its observers on disposal', async () => {
        const { element, anchorRect$, resizeCallbacks, disconnect, getBoundary, dispose } = createPopup();
        getBoundary.mockReturnValue(new DOMRect(100, 450, 400, 100));
        resizeCallbacks.forEach((callback) => callback());
        expect(element.style.top).toBe('458px');
        expect(element.style.left).toBe('352px');

        dispose();
        dispose();
        anchorRect$.next({ left: 600, right: 600, top: 600, bottom: 640 });
        element.style.left = '123px';
        resizeCallbacks.forEach((callback) => callback());
        await Promise.resolve();
        expect(element.style.left).toBe('123px');
        expect(element.style.transition).toBe('');
        expect(disconnect).toHaveBeenCalled();
        expect(anchorRect$.observed).toBe(false);
    });

    it('respects reduced motion when the anchor moves', () => {
        vi.stubGlobal('matchMedia', () => ({ matches: true }));
        const { element, anchorRect$ } = createPopup();
        anchorRect$.next({ left: 500, right: 500, top: 500, bottom: 540 });
        expect(element.style.left).toBe('452px');
        expect(element.style.top).toBe('506px');
        expect(element.style.transition).toBe('');
    });

    it('settles fractional positions after the browser normalizes CSS numbers', async () => {
        const { element, anchorRect$ } = createPopup();
        const topSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element.style), 'top')!.set!;
        const writeTop = vi.spyOn(element.style, 'top', 'set').mockImplementation((value) => {
            topSetter.call(element.style, `${Number.parseFloat(value).toFixed(3)}px`);
        });

        anchorRect$.next({ left: 500, right: 500, top: 500.6666666666667, bottom: 540.6666666666667 });
        await Promise.resolve();
        await Promise.resolve();

        expect(element.style.top).toBe('506.667px');
        expect(writeTop).toHaveBeenCalledTimes(1);
    });
});
