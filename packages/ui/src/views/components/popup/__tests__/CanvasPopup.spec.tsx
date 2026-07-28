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

import type { ComponentType, ReactElement } from 'react';
import type { IPopup, IPopupWithExtraProps } from '../../../../services/popup/canvas-popup.service';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigService, IConfigService, Injector, LocaleService } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest';
import { ComponentManager } from '../../../../common';
import { CanvasPopupService, ICanvasPopupService } from '../../../../services/popup/canvas-popup.service';
import { connectInjector } from '../../../../utils/di';
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

    const ConnectedTestRoot = connectInjector(() => element, injector) as ComponentType;
    const result = render(<ConnectedTestRoot />);

    return {
        ...result,
        injector,
        dispose: () => {
            result.unmount();
            cleanup();
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

describe('CanvasPopup', () => {
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

    it('positions service popups from canvas anchors and tracks hover ownership', async () => {
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
                canvasElement: createCanvasElement(new DOMRect(0, 0, 400, 300)),
                direction: 'bottom-left',
                offset: [4, 6],
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
});
