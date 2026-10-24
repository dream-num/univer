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

import type { ComponentType, CSSProperties } from 'react';
import { DocumentDataModel, IUniverInstanceService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { memo, useEffect, useMemo, useRef } from 'react';
import { first } from 'rxjs';
import type { IFloatDom } from '../../../services/dom/canvas-dom-layer.service';
import { ComponentManager } from '../../../common/component-manager';
import { CanvasFloatDomService, shouldForwardFloatDomEvents, shouldRenderFloatDomLayer } from '../../../services/dom/canvas-dom-layer.service';
import { useDependency, useObservable } from '../../../utils/di';
import { resolveFloatDomLayout } from './float-dom-layout';

function applyFloatDomLayout(
    wrapper: HTMLDivElement,
    inner: HTMLDivElement,
    layout: ReturnType<typeof resolveFloatDomLayout>
): void {
    const { wrapper: wrapperLayout, inner: innerLayout } = layout;
    const wrapperStyle = wrapper.style;
    wrapperStyle.top = `${wrapperLayout.top}px`;
    wrapperStyle.left = `${wrapperLayout.left}px`;
    wrapperStyle.width = `${wrapperLayout.width}px`;
    wrapperStyle.height = `${wrapperLayout.height}px`;
    wrapperStyle.transform = wrapperLayout.transform;
    wrapperStyle.opacity = `${wrapperLayout.opacity}`;

    const innerStyle = inner.style;
    innerStyle.width = `${innerLayout.width}px`;
    innerStyle.height = `${innerLayout.height}px`;
    innerStyle.left = innerLayout.left === 'auto' ? 'auto' : `${innerLayout.left}px`;
    innerStyle.top = innerLayout.top === 'auto' ? 'auto' : `${innerLayout.top}px`;
    innerStyle.right = innerLayout.right === 'auto' ? 'auto' : `${innerLayout.right}px`;
    innerStyle.bottom = innerLayout.bottom === 'auto' ? 'auto' : `${innerLayout.bottom}px`;
}

export const FloatDomSingle = memo((props: { layer: IFloatDom; id: string }) => {
    const { layer } = props;

    return typeof layer.componentKey === 'string'
        ? <RegisteredFloatDomSingle {...props} componentKey={layer.componentKey} />
        : <FloatDomSingleContent {...props} Component={layer.componentKey} />;
});

function RegisteredFloatDomSingle(props: { layer: IFloatDom; id: string; componentKey: string }) {
    const componentManager = useDependency(ComponentManager);
    return <FloatDomSingleContent {...props} Component={componentManager.get(props.componentKey)} />;
}

function FloatDomSingleContent(props: { layer: IFloatDom; id: string; Component?: ComponentType<any> }) {
    const { layer, id, Component } = props;

    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const domLayerService = useDependency(CanvasFloatDomService);
    const position = useObservable(useMemo(() => layer.position$.pipe(first()), [layer.position$]));
    const domRef = useRef<HTMLDivElement>(null);
    const innerDomRef = useRef<HTMLDivElement>(null);

    const layerProps: any = useMemo(() => ({
        data: layer.data,
        ...layer.props,
        hostFloatDomLayout$: layer.position$,
    }), [layer.data, layer.position$, layer.props]);
    const floatDomOverflow = resolveFloatDomOverflow(layerProps);
    const wrapperInset = layer.contentBox?.wrapperInset;
    const contentInset = layer.contentBox?.contentInset;
    const forwardEvents = shouldForwardFloatDomEvents(layer);

    useEffect(() => {
        const subscription = layer.position$.subscribe((position) => {
            if (domRef.current && innerDomRef.current) {
                applyFloatDomLayout(domRef.current, innerDomRef.current, resolveFloatDomLayout(position, { wrapperInset, contentInset }));
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [contentInset, layer.position$, wrapperInset]);

    useEffect(() => {
        const wrapper = domRef.current;
        if (!forwardEvents || !wrapper) {
            return;
        }

        let canvas: HTMLCanvasElement | undefined;
        const isInternalDestination = (target: EventTarget | null) => {
            if (!(target instanceof Node) || !target.isConnected || !wrapper.isConnected || !canvas?.isConnected) {
                return false;
            }
            if (target.ownerDocument !== wrapper.ownerDocument ||
                renderManagerService.getRenderUnitById(layer.unitId)?.engine.getCanvasElement() !== canvas) {
                return false;
            }

            const liveLayers = domLayerService.domLayers;
            const currentLayer = liveLayers.find(([key]) => key === layer.id)?.[1];
            if (!currentLayer || currentLayer.unitId !== layer.unitId || !shouldForwardFloatDomEvents(currentLayer)) {
                return false;
            }
            if (wrapper.ownerDocument.getElementById(currentLayer.domId ?? layer.id) !== innerDomRef.current) {
                return false;
            }
            if (target === canvas) {
                return true;
            }

            return liveLayers.some(([key, candidate]) => {
                if (candidate.unitId !== layer.unitId || !shouldForwardFloatDomEvents(candidate)) {
                    return false;
                }
                const inner = wrapper.ownerDocument.getElementById(candidate.domId ?? key);
                const ownedWrapper = inner?.parentElement;
                return !!inner?.isConnected && !!ownedWrapper?.isConnected && ownedWrapper.contains(target);
            });
        };
        const handleCanvasLeave = (event: PointerEvent) => {
            // The passthrough DOM and its render canvas form one logical input surface.
            if (isInternalDestination(event.relatedTarget)) {
                event.stopImmediatePropagation();
            }
        };
        const unbindCanvas = () => {
            canvas?.removeEventListener('pointerleave', handleCanvasLeave, true);
            canvas = undefined;
        };
        const bindCanvas = () => {
            unbindCanvas();
            canvas = renderManagerService.getRenderUnitById(layer.unitId)?.engine.getCanvasElement();
            canvas?.addEventListener('pointerleave', handleCanvasLeave, true);
        };
        const created = renderManagerService.created$.subscribe((render) => {
            if (render.unitId === layer.unitId) {
                bindCanvas();
            }
        });
        const disposed = renderManagerService.disposed$.subscribe((unitId) => {
            if (unitId === layer.unitId) {
                unbindCanvas();
            }
        });
        bindCanvas();

        const handlePointerLeave = (event: PointerEvent) => {
            if (!isInternalDestination(event.relatedTarget)) {
                layer.onPointerMove(event);
            }
        };
        wrapper.addEventListener('pointerleave', handlePointerLeave);
        return () => {
            wrapper.removeEventListener('pointerleave', handlePointerLeave);
            created.unsubscribe();
            disposed.unsubscribe();
            unbindCanvas();
        };
    }, [domLayerService, forwardEvents, layer, position, renderManagerService]);

    const instance = univerInstanceService.getUnit(layer.unitId);
    const docDisabled = instance instanceof DocumentDataModel ? instance.getDisabled() : undefined;
    const component = useMemo(() => Component
        ? (
            <Component
                {...layerProps}
                unitId={layer.unitId}
                unit={instance}
                floatDomId={layer.id}
                context={{
                    docDisabled,
                    root: innerDomRef,
                }}
            />
        )
        : null, [Component, layerProps]);

    if (!position) {
        return null;
    }

    const layout = resolveFloatDomLayout(position, layer.contentBox);

    return (
        <div
            ref={domRef}
            className="univer-absolute univer-z-10 univer-origin-center"
            style={{
                ...layout.wrapper,
                overflow: floatDomOverflow.outerOverflow,
                touchAction: forwardEvents ? 'none' : undefined,
            }}
            onPointerMove={(e) => {
                if (forwardEvents) {
                    layer.onPointerMove(e.nativeEvent);
                }
            }}
            onPointerDown={(e) => {
                if (forwardEvents) {
                    layer.onPointerDown(e.nativeEvent);
                    // Forwarding can replace the descendant after the canvas requests capture.
                    // A surviving native descendant must own pointerup.
                    if (e.target instanceof Element && e.target.isConnected) {
                        e.target.setPointerCapture?.(e.pointerId);
                    }
                }
            }}
            onPointerUp={(e) => {
                if (!forwardEvents) {
                    return;
                }

                try {
                    layer.onPointerUp(e.nativeEvent);
                } finally {
                    if (e.target instanceof Element && e.target.hasPointerCapture?.(e.pointerId)) {
                        e.target.releasePointerCapture?.(e.pointerId);
                    }
                }
            }}
            onPointerCancel={(e) => {
                if (!forwardEvents) {
                    return;
                }

                try {
                    // The layer forwards the original event type, so the canvas receives pointercancel rather than pointerup.
                    layer.onPointerUp(e.nativeEvent);
                } finally {
                    if (e.target instanceof Element && e.target.hasPointerCapture?.(e.pointerId)) {
                        e.target.releasePointerCapture?.(e.pointerId);
                    }
                }
            }}
            onWheel={(e) => {
                if (forwardEvents) {
                    layer.onWheel(e.nativeEvent);
                }
            }}
        >
            <div
                id={id}
                ref={innerDomRef}
                className="univer-absolute univer-overflow-hidden"
                style={{ ...layout.inner, overflow: floatDomOverflow.innerOverflow }}
            >
                {component}
            </div>
        </div>
    );
}

export const FloatDom = ({ unitId }: { unitId?: string }) => {
    const instanceService = useDependency(IUniverInstanceService);
    const domLayerService = useDependency(CanvasFloatDomService);
    const layers = useObservable(domLayerService.domLayers$);
    const focusUnit = useObservable(instanceService.focused$);
    const currentUnitId = resolveFloatDomCurrentUnitId(unitId, focusUnit);

    useEffect(() => {
        if (typeof unitId !== 'string') {
            return;
        }

        const disposable = domLayerService.registerScopedRenderRoot(unitId);
        return () => disposable.dispose();
    }, [domLayerService, unitId]);

    const visibleLayers = typeof unitId === 'string'
        ? layers?.filter((layer) => layer[1].unitId === unitId)
        : layers?.filter((layer) =>
            !domLayerService.hasScopedRenderRoot(layer[1].unitId) &&
            shouldRenderFloatDomLayer(layer[1], currentUnitId)
        );

    return visibleLayers?.map((layer) => (
        <FloatDomSingle
            id={layer[1].domId ?? layer[0]}
            layer={layer[1]}
            key={layer[0]}
        />
    ));
};

export function resolveFloatDomCurrentUnitId(unitId: string | undefined, focusedUnit: unknown): string | null {
    if (typeof unitId === 'string') {
        return unitId;
    }

    if (typeof focusedUnit === 'string') {
        return focusedUnit;
    }

    if (
        focusedUnit != null &&
        typeof focusedUnit === 'object' &&
        'getUnitId' in focusedUnit &&
        typeof focusedUnit.getUnitId === 'function'
    ) {
        const focusedUnitId = focusedUnit.getUnitId();
        return typeof focusedUnitId === 'string' ? focusedUnitId : null;
    }

    return null;
}

export function resolveFloatDomOverflow(props: {
    customBlockRenderViewport?: {
        bleedLeft?: number;
        bleedWidth?: number;
    };
}): { outerOverflow: CSSProperties['overflow']; innerOverflow: CSSProperties['overflow'] } {
    const viewport = props.customBlockRenderViewport;
    const hasBleedViewport = Number.isFinite(viewport?.bleedWidth) && (viewport?.bleedWidth ?? 0) > 0;
    if (!hasBleedViewport) {
        return {
            outerOverflow: 'hidden',
            innerOverflow: 'hidden',
        };
    }

    return {
        outerOverflow: 'visible',
        innerOverflow: 'visible',
    };
}
