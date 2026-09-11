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

import type { ReactElement } from 'react';
import type { IPopup, IPopupWithExtraProps } from '../../../../services/popup/canvas-popup.service';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigService, IConfigService, Injector, LocaleService } from '@univerjs/core';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest';
import { ComponentManager } from '../../../../common/component-manager';
import { CanvasPopupService, ICanvasPopupService } from '../../../../services/popup/canvas-popup.service';
import { RediContext } from '../../../../utils/di';
import { CanvasPopup } from '../CanvasPopup';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestResizeObserver {
    observe(): void {}
    disconnect(): void {}
}

let previousResizeObserver: typeof ResizeObserver | undefined;
let previousAnimationFrame: typeof requestAnimationFrame | undefined;

function TestPopup({ popup }: { popup: IPopupWithExtraProps<{ label: string }> }) {
    return <button type="button">{popup.extraProps.label}</button>;
}

function renderWithDependencies(element: ReactElement) {
    const injector = new Injector();
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([LocaleService]);
    injector.add([ComponentManager]);
    injector.add([ICanvasPopupService, { useClass: CanvasPopupService }]);

    injector.get(ComponentManager).register('test-popup', TestPopup);

    const result = render(<RediContext.Provider value={{ injector }}>{element}</RediContext.Provider>);

    return {
        ...result,
        injector,
        dispose: () => {
            result.unmount();
            cleanup();
            injector.dispose();
        },
    };
}

function createCanvasElement(rect: DOMRect): HTMLCanvasElement {
    const canvasElement = document.createElement('canvas');
    Object.defineProperty(canvasElement, 'getBoundingClientRect', {
        configurable: true,
        value: () => rect,
    });
    return canvasElement;
}

function StatefulPopup() {
    const [open, setOpen] = useState(false);
    return <button type="button" onClick={() => setOpen(true)}>{open ? 'Style drawer opened' : 'Open styles'}</button>;
}

function PortaledPopup() {
    const [open, setOpen] = useState(false);
    return open
        ? createPortal(<div role="dialog" aria-label="Table styles">Styles</div>, document.body)
        : <button type="button" onClick={() => setOpen(true)}>Edit table</button>;
}

describe('CanvasPopup', () => {
    it('keeps an open portaled editor when resizing moves its anchor outside the canvas', async () => {
        const rendered = renderWithDependencies(<CanvasPopup />);
        rendered.injector.get(ComponentManager).register('portaled-popup', PortaledPopup);
        const anchorRect$ = new BehaviorSubject({ left: 40, top: 620, right: 160, bottom: 680 });
        let canvasRect = new DOMRect(0, 0, 390, 844);
        const canvas = document.createElement('canvas');
        Object.defineProperty(canvas, 'getBoundingClientRect', { value: () => canvasRect });
        act(() => {
            rendered.injector.get(ICanvasPopupService).addPopup({
                unitId: 'board',
                subUnitId: 'page',
                componentKey: 'portaled-popup',
                anchorRect$,
                canvasElement: canvas,
                hiddenType: 'hide',
            });
        });
        fireEvent.click(await screen.findByRole('button', { name: 'Edit table' }));
        await act(async () => {
            canvasRect = new DOMRect(0, 0, 390, 500);
            anchorRect$.next({ left: 40, top: 620, right: 160, bottom: 680 });
            await new Promise((resolve) => setTimeout(resolve, 0));
        });
        expect(screen.getByRole('dialog', { name: 'Table styles' })).toBeTruthy();
        rendered.dispose();
    });

    it('preserves connected popup state when sibling popups change', async () => {
        const rendered = renderWithDependencies(<CanvasPopup />);
        const injector = rendered.injector;
        injector.get(ComponentManager).register('stateful-popup', StatefulPopup);
        const service = injector.get(ICanvasPopupService);
        const popup: IPopup = {
            unitId: 'board',
            subUnitId: 'page',
            componentKey: 'stateful-popup',
            connectorInjector: injector,
            canvasElement: createCanvasElement(new DOMRect(0, 0, 390, 844)),
            anchorRect$: new BehaviorSubject({ left: 40, top: 60, right: 160, bottom: 100 }),
            hideOnInvisible: false,
        };
        act(() => {
            service.addPopup(popup);
        });
        fireEvent.click(await screen.findByRole('button', { name: 'Open styles' }));
        expect(screen.getByRole('button', { name: 'Style drawer opened' })).toBeTruthy();
        let sibling = '';
        act(() => {
            sibling = service.addPopup({ ...popup, componentKey: 'test-popup', extraProps: { label: 'Sibling' } });
        });
        expect(await screen.findByRole('button', { name: 'Sibling' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Open styles' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Style drawer opened' })).toBeTruthy();
        act(() => {
            service.removePopup(sibling);
        });
        expect(screen.getByRole('button', { name: 'Style drawer opened' })).toBeTruthy();
        rendered.dispose();
    });

    it('requires extraProps only for popups that declare them', () => {
        expectTypeOf<IPopup['extraProps']>().toEqualTypeOf<Record<string, unknown> | undefined>();
        expectTypeOf<IPopupWithExtraProps<{ label: string }>['extraProps']>().toEqualTypeOf<{ label: string }>();
    });

    beforeEach(() => {
        previousResizeObserver = globalThis.ResizeObserver;
        previousAnimationFrame = globalThis.requestAnimationFrame;
        globalThis.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;
        globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
            callback(0);
            return 0;
        }) as typeof requestAnimationFrame;
    });

    afterEach(() => {
        cleanup();
        if (previousResizeObserver) {
            globalThis.ResizeObserver = previousResizeObserver;
        } else {
            delete (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
        }

        if (previousAnimationFrame) {
            globalThis.requestAnimationFrame = previousAnimationFrame;
        } else {
            delete (globalThis as { requestAnimationFrame?: typeof requestAnimationFrame }).requestAnimationFrame;
        }
    });

    it('uses viewport placement by default and tracks hover ownership', async () => {
        const rendered = renderWithDependencies(<CanvasPopup />);
        const popupService = rendered.injector.get(ICanvasPopupService);
        const anchorRect$ = new BehaviorSubject({ left: 40, top: 50, right: 90, bottom: 70 });
        let popupId = '';

        act(() => {
            popupId = popupService.addPopup({
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                componentKey: 'test-popup',
                anchorRect$,
                canvasElement: createCanvasElement(new DOMRect(0, 100, 400, 300)),
                direction: 'bottom-left',
                offset: [4, 6],
                hideOnInvisible: false,
                extraProps: { label: 'Cell comment' },
            });
        });

        expect(await screen.findByRole('button', { name: 'Cell comment' })).toBeTruthy();

        const popupElement = document.querySelector('[data-u-comp="rect-popup"]') as HTMLElement;
        await waitFor(() => {
            expect(popupElement.style.left).toBe('36px');
            expect(popupElement.style.top).toBe('76px');
        });

        fireEvent.pointerEnter(popupElement);
        expect(popupService.activePopupId).toBe(popupId);

        fireEvent.pointerLeave(popupElement);
        expect(popupService.activePopupId).toBeNull();

        act(() => {
            popupService.removePopup(popupId);
        });

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: 'Cell comment' })).toBeNull();
        });

        rendered.dispose();
    });

    it('keeps a partially visible drawing popup inside the canvas', async () => {
        const rendered = renderWithDependencies(<CanvasPopup />);
        const popupService = rendered.injector.get(ICanvasPopupService);

        act(() => {
            popupService.addPopup({
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                componentKey: 'test-popup',
                anchorRect$: new BehaviorSubject({ left: 200, top: 29, right: 668, bottom: 398 }),
                canvasElement: createCanvasElement(new DOMRect(0, 152, 1580, 891)),
                constrainToCanvas: true,
                direction: 'horizontal',
                extraProps: { label: 'Drawing menu' },
            });
        });

        expect(await screen.findByRole('button', { name: 'Drawing menu' })).toBeTruthy();

        const popupElement = document.querySelector<HTMLElement>('[data-u-comp="rect-popup"]');
        if (!popupElement) {
            throw new Error('RectPopup was not rendered');
        }
        await waitFor(() => {
            expect(popupElement.style.top).toBe('160px');
        });

        rendered.dispose();
    });

    it('hides a drawing popup when the canvas boundary is outside the viewport', async () => {
        const rendered = renderWithDependencies(<CanvasPopup />);
        const popupService = rendered.injector.get(ICanvasPopupService);

        act(() => {
            popupService.addPopup({
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                componentKey: 'test-popup',
                anchorRect$: new BehaviorSubject({ left: 40, top: -180, right: 90, bottom: -160 }),
                canvasElement: createCanvasElement(new DOMRect(0, -200, 400, 100)),
                constrainToCanvas: true,
                direction: 'horizontal',
                extraProps: { label: 'Offscreen drawing menu' },
            });
        });

        expect(await screen.findByText('Offscreen drawing menu')).toBeTruthy();

        const popupElement = document.querySelector<HTMLElement>('[data-u-comp="rect-popup"]');
        if (!popupElement) {
            throw new Error('RectPopup was not rendered');
        }
        await waitFor(() => {
            expect(popupElement.style.visibility).toBe('hidden');
        });

        rendered.dispose();
    });
});
