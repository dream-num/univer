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

/**
 * @vitest-environment jsdom
 */

import type { ComponentType, ReactElement } from 'react';
import type { IFloatDom, IFloatDomLayout } from '../../../../services/dom/canvas-dom-layer.service';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Injector, IUniverInstanceService } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CanvasFloatDomService } from '../../../../services/dom/canvas-dom-layer.service';
import { connectInjector } from '../../../../utils/di';
import { FloatDom, FloatDomSingle, resolveFloatDomCurrentUnitId, resolveFloatDomOverflow } from '../FloatDom';

function TestFloatDomContent(_props: { hostFloatDomLayout$?: IFloatDom['position$'] }) {
    return <div>float content</div>;
}

function renderWithDependencies(element: ReactElement, focusedUnit: unknown = null) {
    const injector = new Injector();
    injector.add([CanvasFloatDomService]);
    injector.add([IUniverInstanceService, {
        useValue: {
            focused$: new BehaviorSubject(focusedUnit) as never,
            getUnit: () => undefined,
        } as never,
    }]);

    const ConnectedTestRoot = connectInjector(() => element, injector) as ComponentType;
    const result = render(<ConnectedTestRoot />);

    return {
        ...result,
        injector,
    };
}

function createFloatDom(): IFloatDom {
    return {
        id: 'float-1',
        componentKey: TestFloatDomContent,
        onPointerDown: () => {},
        onPointerMove: () => {},
        onPointerUp: () => {},
        onWheel: () => {},
        position$: new BehaviorSubject<IFloatDomLayout>({
            startX: 10,
            startY: 20,
            endX: 110,
            endY: 120,
            rotate: 0,
            width: 100,
            height: 100,
            absolute: { left: true, top: true },
        }),
        unitId: 'doc-1',
    };
}

describe('resolveFloatDomOverflow', () => {
    it('keeps regular float dom layers clipped', () => {
        expect(resolveFloatDomOverflow({})).toEqual({
            outerOverflow: 'hidden',
            innerOverflow: 'hidden',
        });
    });

    it('allows docs custom block bleed layers to escape the drawing wrapper', () => {
        expect(resolveFloatDomOverflow({
            customBlockRenderViewport: {
                bleedLeft: 210,
                bleedWidth: 1420,
            },
        })).toEqual({
            outerOverflow: 'visible',
            innerOverflow: 'visible',
        });
    });
});

describe('resolveFloatDomCurrentUnitId', () => {
    it('resolves the focused unit id when the focused observable emits a unit object', () => {
        expect(resolveFloatDomCurrentUnitId(undefined, {
            getUnitId: () => 'doc-1',
        })).toBe('doc-1');
    });
});

describe('FloatDomSingle', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders an existing BehaviorSubject position without waiting for a later movement event', async () => {
        renderWithDependencies(<FloatDomSingle id="dom-1" layer={createFloatDom()} />);

        await waitFor(() => expect(screen.getByText('float content')).not.toBeNull());
        expect(document.getElementById('dom-1')).not.toBeNull();
    });

    it('passes the host layout observable to float dom components', async () => {
        let receivedLayout$: IFloatDom['position$'] | undefined;
        function InspectFloatDomContent(props: { hostFloatDomLayout$?: IFloatDom['position$'] }) {
            receivedLayout$ = props.hostFloatDomLayout$;
            return <div>float content</div>;
        }
        const layer = {
            ...createFloatDom(),
            componentKey: InspectFloatDomContent,
        };

        renderWithDependencies(<FloatDomSingle id="dom-1" layer={layer} />);

        await waitFor(() => expect(screen.getByText('float content')).not.toBeNull());
        expect(receivedLayout$).toBe(layer.position$);
    });

    it('renders the wrapper and content root at the full placement bounds in exact mode', async () => {
        const position$ = new BehaviorSubject<IFloatDomLayout>({
            startX: 10,
            startY: 20,
            endX: 490,
            endY: 340,
            rotate: 30,
            width: 480,
            height: 320,
            absolute: { left: false, top: false },
            opacity: 0.5,
        });
        const layer = {
            ...createFloatDom(),
            contentBoxMode: 'exact-bounds' as const,
            position$,
        };

        renderWithDependencies(<FloatDomSingle id="dom-1" layer={layer} />);

        const inner = await waitFor(() => document.getElementById('dom-1') as HTMLDivElement);
        const wrapper = inner.parentElement as HTMLDivElement;
        expect(wrapper.style.cssText).toContain('width: 480px');
        expect(wrapper.style.cssText).toContain('height: 320px');
        expect(wrapper.style.cssText).toContain('transform: rotate(30deg)');
        expect(wrapper.style.cssText).toContain('opacity: 0.5');
        expect(inner.style.cssText).toContain('width: 480px');
        expect(inner.style.cssText).toContain('height: 320px');
        expect(inner.style.right).toBe('0px');
        expect(inner.style.bottom).toBe('0px');
    });

    it.each([undefined, 'legacy-inset'] as const)('preserves the legacy DOM hierarchy, classes, styles, overflow, and event forwarding for mode %s', async (contentBoxMode) => {
        const onPointerDown = vi.fn();
        const layer = { ...createFloatDom(), onPointerDown, contentBoxMode };

        renderWithDependencies(<FloatDomSingle id="dom-1" layer={layer} />);

        const inner = await waitFor(() => document.getElementById('dom-1') as HTMLDivElement);
        const wrapper = inner.parentElement as HTMLDivElement;
        expect(wrapper.className).toBe('univer-z-10');
        expect(inner.className).toBe('univer-absolute univer-overflow-hidden');
        expect(wrapper.style.cssText).toBe('position: absolute; top: 20px; left: 10px; width: 98px; height: 98px; transform: rotate(0deg); opacity: 1; overflow: hidden; transform-origin: center center;');
        expect(inner.style.cssText).toBe('width: 96px; height: 96px; left: 0px; top: 0px; right: auto; bottom: auto; overflow: hidden;');

        fireEvent.pointerDown(inner);
        expect(onPointerDown).toHaveBeenCalledOnce();
    });

    it('updates clipped placement, full content size, and anchors through position$', async () => {
        const position$ = createFloatDom().position$ as BehaviorSubject<IFloatDomLayout>;
        const layer = { ...createFloatDom(), contentBoxMode: 'exact-bounds' as const, position$ };

        renderWithDependencies(<FloatDomSingle id="dom-1" layer={layer} />);
        const inner = await waitFor(() => document.getElementById('dom-1') as HTMLDivElement);
        const wrapper = inner.parentElement as HTMLDivElement;

        act(() => position$.next({
            startX: 0,
            startY: 5,
            endX: 300,
            endY: 205,
            rotate: 30,
            width: 480,
            height: 320,
            absolute: { left: false, top: false },
            opacity: 0.6,
        }));

        expect(wrapper.style.cssText).toContain('width: 300px');
        expect(wrapper.style.cssText).toContain('height: 200px');
        expect(wrapper.style.cssText).toContain('top: 5px');
        expect(inner.style.cssText).toContain('width: 480px');
        expect(inner.style.cssText).toContain('height: 320px');
        expect(inner.style.left).toBe('auto');
        expect(inner.style.top).toBe('auto');
        expect(inner.style.right).toBe('0px');
        expect(inner.style.bottom).toBe('0px');
    });

    it('does not rewrite layout styles for an equivalent position emission', async () => {
        const initialPosition = {
            startX: 10,
            startY: 20,
            endX: 110,
            endY: 120,
            rotate: 0,
            width: 100,
            height: 100,
            absolute: { left: true, top: true },
        } satisfies IFloatDomLayout;
        const position$ = new BehaviorSubject(initialPosition);

        renderWithDependencies(<FloatDomSingle id="dom-1" layer={{ ...createFloatDom(), position$ }} />);
        await waitFor(() => expect(document.getElementById('dom-1')).not.toBeNull());
        const setProperty = vi.spyOn(CSSStyleDeclaration.prototype, 'setProperty');

        act(() => position$.next({ ...initialPosition, absolute: { ...initialPosition.absolute } }));

        expect(setProperty).not.toHaveBeenCalled();
        setProperty.mockRestore();
    });
});

describe('FloatDom', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders layers for the focused unit when focused$ emits a unit object', async () => {
        const rendered = renderWithDependencies(<FloatDom />, {
            getUnitId: () => 'doc-1',
        });
        rendered.injector.get(CanvasFloatDomService).addFloatDom(createFloatDom());

        await waitFor(() => expect(screen.getByText('float content')).not.toBeNull());
        expect(document.getElementById('float-1')).not.toBeNull();
    });

    it('updates content box mode at runtime through CanvasFloatDomService', async () => {
        const rendered = renderWithDependencies(<FloatDom unitId="doc-1" />);
        const service = rendered.injector.get(CanvasFloatDomService);

        act(() => service.addFloatDom(createFloatDom()));
        const inner = await waitFor(() => document.getElementById('float-1') as HTMLDivElement);
        const wrapper = inner.parentElement as HTMLDivElement;
        expect(wrapper.style.width).toBe('98px');
        expect(inner.style.width).toBe('96px');

        act(() => service.updateFloatDom('float-1', { contentBoxMode: 'exact-bounds' }));

        await waitFor(() => expect(wrapper.style.width).toBe('100px'));
        expect(inner.style.width).toBe('100px');
    });
});
