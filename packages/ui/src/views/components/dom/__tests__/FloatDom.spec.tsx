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
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
    ContextService,
    DesktopLogService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    ThemeService,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { CanvasColorService, ICanvasColorService, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IFloatDom, IFloatDomLayout } from '../../../../services/dom/canvas-dom-layer.service';
import { CanvasFloatDomService } from '../../../../services/dom/canvas-dom-layer.service';
import { connectInjector } from '../../../../utils/di';
import { FloatDom, FloatDomSingle, resolveFloatDomCurrentUnitId, resolveFloatDomOverflow } from '../FloatDom';

function TestFloatDomContent(_props: { hostFloatDomLayout$?: IFloatDom['position$'] }) {
    return <div>float content</div>;
}

const testInjectors: Injector[] = [];

function renderWithDependencies(element: ReactElement, focusedUnitId: string | null = null) {
    const injector = new Injector();
    testInjectors.push(injector);
    injector.add([CanvasFloatDomService]);
    injector.add([ThemeService]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    if (focusedUnitId) {
        const workbook = injector.createInstance(Workbook, { id: focusedUnitId });
        const instances = injector.get(IUniverInstanceService);
        instances.__addUnit(workbook);
        instances.focusUnit(workbook.getUnitId());
    }

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

afterEach(() => {
    cleanup();
    for (const injector of testInjectors) {
        injector.dispose();
    }
    testInjectors.length = 0;
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

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

    it('renders the wrapper and content root at the full placement bounds with zero insets', async () => {
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
            contentBox: { wrapperInset: 0, contentInset: 0 },
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

    it.each([undefined, {}] as const)('preserves the legacy DOM hierarchy, classes, styles, overflow, and event forwarding for config %o', async (contentBox) => {
        const onPointerDown = vi.fn();
        const layer = { ...createFloatDom(), onPointerDown, contentBox };

        renderWithDependencies(<FloatDomSingle id="dom-1" layer={layer} />);

        const inner = await waitFor(() => document.getElementById('dom-1') as HTMLDivElement);
        const wrapper = inner.parentElement as HTMLDivElement;
        expect(wrapper.className).toBe('univer-absolute univer-z-10 univer-origin-center');
        expect(inner.className).toBe('univer-absolute univer-overflow-hidden');
        expect(wrapper.style.cssText).toBe('top: 20px; left: 10px; width: 98px; height: 98px; transform: rotate(0deg); opacity: 1; overflow: hidden; touch-action: none;');
        expect(inner.style.cssText).toBe('width: 96px; height: 96px; left: 0px; top: 0px; right: auto; bottom: auto; overflow: hidden;');

        fireEvent.pointerDown(inner);
        expect(onPointerDown).toHaveBeenCalledOnce();
    });

    it('keeps the native descendant as capture owner when a forwarded canvas down requests capture', async () => {
        const canvas = document.createElement('canvas');
        let captureOwner: Element | undefined;
        canvas.setPointerCapture = () => {
            captureOwner = canvas;
        };
        canvas.addEventListener('pointerdown', () => canvas.setPointerCapture(7));
        const layer = {
            ...createFloatDom(),
            onPointerDown: () => canvas.dispatchEvent(new Event('pointerdown')),
        };
        renderWithDependencies(<FloatDomSingle id="dom-1" layer={layer} />);

        const inner = await waitFor(() => document.getElementById('dom-1') as HTMLDivElement);
        inner.setPointerCapture = () => {
            captureOwner = inner;
        };

        fireEvent.pointerDown(inner, { pointerId: 7 });

        expect(captureOwner).toBe(inner);
    });

    it.each(['removed', 'replaced'] as const)(
        'keeps the forwarded canvas capture when its native descendant is synchronously %s',
        async (change) => {
            const canvas = document.createElement('canvas');
            const descendant = document.createElement('canvas');
            const replacement = document.createElement('canvas');
            document.body.appendChild(canvas);
            let captureOwner: Element | undefined;
            // jsdom does not implement the native pointer capture API.
            canvas.setPointerCapture = () => {
                captureOwner = canvas;
            };
            const captureDetachedDescendant = vi.fn(() => {
                if (!descendant.isConnected) {
                    throw new DOMException('Cannot capture a disconnected descendant', 'InvalidStateError');
                }
                captureOwner = descendant;
            });
            descendant.setPointerCapture = captureDetachedDescendant;
            canvas.addEventListener('pointerdown', () => canvas.setPointerCapture(7));
            const layer = {
                ...createFloatDom(),
                onPointerDown: (event: PointerEvent | MouseEvent) => {
                    canvas.dispatchEvent(new Event(event.type));
                    if (change === 'replaced') {
                        descendant.replaceWith(replacement);
                    } else {
                        descendant.remove();
                    }
                },
            };
            renderWithDependencies(<FloatDomSingle id="dom-1" layer={layer} />);
            const inner = await waitFor(() => document.getElementById('dom-1') as HTMLDivElement);
            inner.appendChild(descendant);
            const wrapper = inner.parentElement as HTMLDivElement;
            const captureOnWrapper = vi.fn();
            wrapper.setPointerCapture = captureOnWrapper;

            fireEvent.pointerDown(descendant, { pointerId: 7 });

            expect(descendant.isConnected).toBe(false);
            expect(inner.isConnected).toBe(true);
            if (change === 'replaced') {
                expect(replacement.parentElement).toBe(inner);
            }
            expect(captureDetachedDescendant).not.toHaveBeenCalled();
            expect(captureOnWrapper).not.toHaveBeenCalled();
            expect(captureOwner).toBe(canvas);
        }
    );

    it('forwards a real wrapper leave to the canvas and removes the listener on unmount', async () => {
        const canvas = document.createElement('canvas');
        const canvasLeave = vi.fn();
        canvas.addEventListener('pointerleave', canvasLeave);
        const layer = {
            ...createFloatDom(),
            onPointerMove: (event: PointerEvent | MouseEvent) => canvas.dispatchEvent(new Event(event.type)),
        };
        const { unmount } = renderWithDependencies(<FloatDomSingle id="dom-1" layer={layer} />);
        const inner = await waitFor(() => document.getElementById('dom-1') as HTMLDivElement);
        const wrapper = inner.parentElement as HTMLDivElement;

        fireEvent.pointerLeave(wrapper, { pointerId: 7 });
        expect(canvasLeave).toHaveBeenCalledOnce();

        unmount();
        fireEvent.pointerLeave(wrapper, { pointerId: 7 });
        expect(canvasLeave).toHaveBeenCalledOnce();
    });

    it('captures forwarded pointers on the original descendant and finishes cancelled canvas gestures', async () => {
        const onPointerDown = vi.fn();
        const onPointerUp = vi.fn();
        const layer = { ...createFloatDom(), onPointerDown, onPointerUp };

        renderWithDependencies(<FloatDomSingle id="dom-1" layer={layer} />);

        const inner = await waitFor(() => document.getElementById('dom-1') as HTMLDivElement);
        const wrapper = inner.parentElement as HTMLDivElement;
        const setPointerCapture = vi.fn();
        const releasePointerCapture = vi.fn();
        const captureOnWrapper = vi.fn();
        Object.defineProperty(wrapper, 'setPointerCapture', { configurable: true, value: captureOnWrapper });
        Object.defineProperties(inner, {
            hasPointerCapture: { configurable: true, value: () => true },
            releasePointerCapture: { configurable: true, value: releasePointerCapture },
            setPointerCapture: { configurable: true, value: setPointerCapture },
        });

        fireEvent.pointerDown(inner, { pointerId: 7 });
        fireEvent.pointerUp(inner, { pointerId: 7 });
        fireEvent.pointerDown(inner, { pointerId: 8 });
        fireEvent.pointerCancel(inner, { pointerId: 8 });

        expect(wrapper.style.touchAction).toBe('none');
        expect(setPointerCapture).toHaveBeenCalledWith(7);
        expect(setPointerCapture).toHaveBeenCalledWith(8);
        expect(captureOnWrapper).not.toHaveBeenCalled();
        expect(onPointerDown).toHaveBeenCalledTimes(2);
        expect(onPointerUp).toHaveBeenCalledWith(expect.objectContaining({ type: 'pointerup' }));
        expect(onPointerUp).toHaveBeenCalledWith(expect.objectContaining({ type: 'pointercancel' }));
        expect(releasePointerCapture).toHaveBeenCalledWith(7);
        expect(releasePointerCapture).toHaveBeenCalledWith(8);
    });

    it('does not capture pointers owned by an interactive float dom', async () => {
        const onPointerDown = vi.fn();
        const layer = { ...createFloatDom(), eventPassThrough: false, onPointerDown };

        renderWithDependencies(<FloatDomSingle id="dom-1" layer={layer} />);

        const inner = await waitFor(() => document.getElementById('dom-1') as HTMLDivElement);
        const wrapper = inner.parentElement as HTMLDivElement;
        const setPointerCapture = vi.fn();
        Object.defineProperty(wrapper, 'setPointerCapture', { configurable: true, value: setPointerCapture });

        fireEvent.pointerDown(inner, { pointerId: 7 });

        expect(wrapper.style.touchAction).toBe('');
        expect(setPointerCapture).not.toHaveBeenCalled();
        expect(onPointerDown).not.toHaveBeenCalled();
    });

    it('updates clipped placement, full content size, and anchors through position$', async () => {
        const position$ = createFloatDom().position$ as BehaviorSubject<IFloatDomLayout>;
        const layer = { ...createFloatDom(), contentBox: { wrapperInset: 0, contentInset: 0 }, position$ };

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
});

describe('FloatDom', () => {
    it('renders layers for the real focused unit', async () => {
        const rendered = renderWithDependencies(<FloatDom />, 'doc-1');
        rendered.injector.get(CanvasFloatDomService).addFloatDom(createFloatDom());

        await waitFor(() => expect(screen.getByText('float content')).not.toBeNull());
        expect(document.getElementById('float-1')).not.toBeNull();
    });

    it('does not render preserved layers from another unit in an explicitly scoped root', () => {
        const rendered = renderWithDependencies(<FloatDom unitId="sheet-1" />);

        act(() => rendered.injector.get(CanvasFloatDomService).addFloatDom({
            ...createFloatDom(),
            preserveOnFocusChange: true,
        }));

        expect(screen.queryByText('float content')).toBeNull();
        expect(document.getElementById('float-1')).toBeNull();
    });

    it('renders a unit only in its explicit root when the same unit is focused globally', async () => {
        const rendered = renderWithDependencies(
            <>
                <div data-testid="global-root"><FloatDom /></div>
                <div data-testid="scoped-root"><FloatDom unitId="doc-1" /></div>
            </>,
            'doc-1'
        );

        act(() => rendered.injector.get(CanvasFloatDomService).addFloatDom(createFloatDom()));

        await waitFor(() => expect(screen.getByTestId('scoped-root').textContent).toBe('float content'));
        expect(screen.getByTestId('global-root').textContent).toBe('');
    });

    it('updates content box insets at runtime through CanvasFloatDomService', async () => {
        const rendered = renderWithDependencies(<FloatDom unitId="doc-1" />);
        const service = rendered.injector.get(CanvasFloatDomService);

        act(() => service.addFloatDom(createFloatDom()));
        const inner = await waitFor(() => document.getElementById('float-1') as HTMLDivElement);
        const wrapper = inner.parentElement as HTMLDivElement;
        expect(wrapper.style.width).toBe('98px');
        expect(inner.style.width).toBe('96px');

        act(() => service.updateFloatDom('float-1', { contentBox: { wrapperInset: 6, contentInset: 10 } }));

        await waitFor(() => expect(wrapper.style.width).toBe('94px'));
        expect(inner.style.width).toBe('90px');

        act(() => service.updateFloatDom('float-1', { contentBox: { wrapperInset: 0, contentInset: 0 } }));

        await waitFor(() => expect(wrapper.style.width).toBe('100px'));
        expect(inner.style.width).toBe('100px');
    });
});

describe('FloatDom logical canvas boundary', () => {
    async function createBoundaryFixture() {
        // jsdom has no 2D drawing platform; all ownership and event delivery stay real.
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: () => {}, clearRect: () => {} } as unknown as CanvasRenderingContext2D;
        });
        const rendered = renderWithDependencies(
            <>
                <FloatDom unitId="doc-1" />
                <FloatDom unitId="foreign-doc" />
            </>,
            'doc-1'
        );
        const layers = rendered.injector.get(CanvasFloatDomService);
        act(() => {
            for (const id of ['current', 'sibling', 'interactive', 'foreign']) {
                layers.addFloatDom({
                    ...createFloatDom(),
                    id,
                    unitId: id === 'foreign' ? 'foreign-doc' : 'doc-1',
                    eventPassThrough: id !== 'interactive',
                    onPointerMove: (event) => {
                        const canvas = rendered.injector.get(IRenderManagerService)
                            .getRenderUnitById('doc-1')
                            ?.engine
                            .getCanvasElement();
                        canvas?.dispatchEvent(new MouseEvent(event.type, { relatedTarget: event.relatedTarget }));
                    },
                });
            }
        });
        await waitFor(() => expect(document.getElementById('sibling')).not.toBeNull());
        const manager = rendered.injector.get(IRenderManagerService);
        function createCanvas() {
            const renderUnit = manager.createRender('doc-1');
            const host = document.createElement('div');
            document.body.appendChild(host);
            renderUnit.engine.mount(host, false);
            const leaves: string[] = [];
            const subscription = renderUnit.engine.onInputChanged$.subscribeEvent((event) => {
                if (event.type === 'pointerleave') {
                    leaves.push(event.type);
                }
            });
            return { canvas: renderUnit.engine.getCanvasElement(), leaves, subscription };
        }
        const main = createCanvas();
        const inner = (id: string) => document.getElementById(id)!;
        const wrapper = inner('current').parentElement!;
        return { ...rendered, layers, manager, inner, wrapper, main, createCanvas };
    }

    it.each(['current', 'sibling'] as const)(
        'does not deliver a logical exit when the canvas enters its live %s passthrough layer',
        async (id) => {
            const { main, inner } = await createBoundaryFixture();

            fireEvent(main.canvas, new MouseEvent('pointerleave', { relatedTarget: inner(id) }));

            expect(main.leaves).toEqual([]);
            main.subscription.unsubscribe();
        }
    );

    it.each(['canvas', 'sibling'] as const)(
        'does not forward a logical exit when a wrapper enters its owned %s',
        async (destination) => {
            const { main, inner, wrapper } = await createBoundaryFixture();
            const target = destination === 'canvas' ? main.canvas : inner('sibling');

            fireEvent(wrapper, new MouseEvent('pointerleave', { relatedTarget: target }));

            expect(main.leaves).toEqual([]);
            main.subscription.unsubscribe();
        }
    );

    it.each(['foreign', 'interactive', 'outside'] as const)(
        'retains real canvas and wrapper exits toward %s',
        async (destination) => {
            const { main, inner, wrapper } = await createBoundaryFixture();
            const target = destination === 'outside' ? document.body : inner(destination);

            fireEvent(main.canvas, new MouseEvent('pointerleave', { relatedTarget: target }));
            fireEvent(wrapper, new MouseEvent('pointerleave', { relatedTarget: target }));

            expect(main.leaves).toEqual(['pointerleave', 'pointerleave']);
            main.subscription.unsubscribe();
        }
    );

    it('uses the current layer registry when passthrough ownership changes', async () => {
        const { main, inner, layers } = await createBoundaryFixture();
        act(() => layers.updateFloatDom('sibling', { eventPassThrough: false }));

        fireEvent(main.canvas, new MouseEvent('pointerleave', { relatedTarget: inner('sibling') }));

        expect(main.leaves).toEqual(['pointerleave']);
        main.subscription.unsubscribe();
    });

    it('binds newly created renders and releases old canvas listeners on disposal and unmount', async () => {
        const { main, inner, manager, createCanvas, unmount } = await createBoundaryFixture();
        const target = inner('current');
        const oldDelivery = vi.fn();
        main.canvas.addEventListener('pointerleave', oldDelivery);
        manager.removeRender('doc-1');

        fireEvent(main.canvas, new MouseEvent('pointerleave', { relatedTarget: target }));
        expect(oldDelivery).toHaveBeenCalledOnce();
        main.subscription.unsubscribe();

        const replacement = createCanvas();
        fireEvent(replacement.canvas, new MouseEvent('pointerleave', { relatedTarget: target }));
        expect(replacement.leaves).toEqual([]);

        unmount();
        fireEvent(replacement.canvas, new MouseEvent('pointerleave', { relatedTarget: target }));
        expect(replacement.leaves).toEqual(['pointerleave']);
        replacement.subscription.unsubscribe();
    });
});
