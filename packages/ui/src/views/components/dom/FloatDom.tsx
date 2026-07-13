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

import type { CSSProperties } from 'react';
import type { IFloatDom } from '../../../services/dom/canvas-dom-layer.service';
import { DocumentDataModel, IUniverInstanceService } from '@univerjs/core';
import { memo, useEffect, useMemo, useRef } from 'react';
import { first } from 'rxjs';
import { ComponentManager } from '../../../common';
import { CanvasFloatDomService, shouldForwardFloatDomEvents, shouldRenderFloatDomLayer } from '../../../services/dom/canvas-dom-layer.service';
import { useDependency, useObservable } from '../../../utils/di';
import { resolveFloatDomLayout } from './float-dom-layout';

function setStyleProperty(style: CSSStyleDeclaration, property: string, value: string): void {
    if (style.getPropertyValue(property) !== value) {
        style.setProperty(property, value);
    }
}

function applyFloatDomLayout(
    wrapper: HTMLDivElement,
    inner: HTMLDivElement,
    layout: ReturnType<typeof resolveFloatDomLayout>
): void {
    const { wrapper: wrapperStyle, inner: innerStyle } = layout;
    setStyleProperty(wrapper.style, 'top', `${wrapperStyle.top}px`);
    setStyleProperty(wrapper.style, 'left', `${wrapperStyle.left}px`);
    setStyleProperty(wrapper.style, 'width', `${wrapperStyle.width}px`);
    setStyleProperty(wrapper.style, 'height', `${wrapperStyle.height}px`);
    setStyleProperty(wrapper.style, 'transform', wrapperStyle.transform);
    setStyleProperty(wrapper.style, 'opacity', `${wrapperStyle.opacity}`);

    setStyleProperty(inner.style, 'width', `${innerStyle.width}px`);
    setStyleProperty(inner.style, 'height', `${innerStyle.height}px`);
    setStyleProperty(inner.style, 'left', innerStyle.left === 'auto' ? 'auto' : `${innerStyle.left}px`);
    setStyleProperty(inner.style, 'top', innerStyle.top === 'auto' ? 'auto' : `${innerStyle.top}px`);
    setStyleProperty(inner.style, 'right', innerStyle.right === 'auto' ? 'auto' : `${innerStyle.right}px`);
    setStyleProperty(inner.style, 'bottom', innerStyle.bottom === 'auto' ? 'auto' : `${innerStyle.bottom}px`);
}

export const FloatDomSingle = memo((props: { layer: IFloatDom; id: string }) => {
    const { layer, id } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const position = useObservable(useMemo(() => layer.position$.pipe(first()), [layer.position$]));
    const domRef = useRef<HTMLDivElement>(null);
    const innerDomRef = useRef<HTMLDivElement>(null);
    const Component = typeof layer.componentKey === 'string' ? useDependency(ComponentManager).get(layer.componentKey) : layer.componentKey;
    const layerProps: any = useMemo(() => ({
        data: layer.data,
        ...layer.props,
        hostFloatDomLayout$: layer.position$,
    }), [layer.data, layer.position$, layer.props]);
    const floatDomOverflow = resolveFloatDomOverflow(layerProps);
    const wrapperInset = layer.contentBox?.wrapperInset;
    const contentInset = layer.contentBox?.contentInset;

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

    //domRef univer-float-dom-wrapper
    //innerDomRef univer-float-dom
    return (
        <div
            ref={domRef}
            className="univer-z-10"
            style={{
                position: 'absolute',
                ...layout.wrapper,
                overflow: floatDomOverflow.outerOverflow,
                transformOrigin: 'center center',
            }}
            onPointerMove={(e) => {
                if (shouldForwardFloatDomEvents(layer)) {
                    layer.onPointerMove(e.nativeEvent);
                }
            }}
            onPointerDown={(e) => {
                if (shouldForwardFloatDomEvents(layer)) {
                    layer.onPointerDown(e.nativeEvent);
                }
            }}
            onPointerUp={(e) => {
                if (shouldForwardFloatDomEvents(layer)) {
                    layer.onPointerUp(e.nativeEvent);
                }
            }}
            onWheel={(e) => {
                if (shouldForwardFloatDomEvents(layer)) {
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
});

export const FloatDom = ({ unitId }: { unitId?: string }) => {
    const instanceService = useDependency(IUniverInstanceService);
    const domLayerService = useDependency(CanvasFloatDomService);
    const layers = useObservable(domLayerService.domLayers$);
    const focusUnit = useObservable(instanceService.focused$);
    const currentUnitId = resolveFloatDomCurrentUnitId(unitId, focusUnit);

    return layers?.filter((layer) => shouldRenderFloatDomLayer(layer[1], currentUnitId))?.map((layer) => (
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
