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

import type { IFloatDom } from '../../../services/dom/canvas-dom-layer.service';
import { DocumentDataModel, IUniverInstanceService } from '@univerjs/core';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { distinctUntilChanged, first } from 'rxjs';
import { ComponentManager } from '../../../common';
import { CanvasFloatDomService } from '../../../services/dom/canvas-dom-layer.service';
import { useDependency, useObservable } from '../../../utils/di';

export const FloatDomSingle = memo((props: { layer: IFloatDom; id: string }) => {
    const { layer, id } = props;

    const size$ = useMemo(() => layer.position$.pipe(
        distinctUntilChanged(
            (prev, curr) => prev.absolute.left === curr.absolute.left &&
                prev.absolute.top === curr.absolute.top &&
                prev.endX - prev.startX === curr.endX - curr.startX &&
                prev.endY - prev.startY === curr.endY - curr.startY
        )
    ), [layer.position$]);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const position = useObservable(useMemo(() => layer.position$.pipe(first()), [layer.position$]));
    const domRef = useRef<HTMLDivElement>(null);
    const innerDomRef = useRef<HTMLDivElement>(null);
    const transformRef = useRef<string>(`transform: rotate(${position?.rotate}deg) translate(${position?.startX}px, ${position?.startY}px)`);
    const topRef = useRef<number>(position?.startY ?? 0);
    const leftRef = useRef<number>(position?.startX ?? 0);
    const innerStyle = useRef<React.CSSProperties>({

    });
    const Component = typeof layer.componentKey === 'string' ? useDependency(ComponentManager).get(layer.componentKey) : layer.componentKey;
    const layerProps: any = useMemo(() => ({
        data: layer.data,
        ...layer.props,
    }), [layer.data, layer.props]);

    useEffect(() => {
        const subscription = layer.position$.subscribe((position) => {
            transformRef.current = `rotate(${position.rotate}deg)`;
            topRef.current = position.startY;
            leftRef.current = position.startX;
            if (domRef.current) {
                domRef.current.style.transform = transformRef.current;
                domRef.current.style.top = `${topRef.current}px`;
                domRef.current.style.left = `${leftRef.current}px`;
                domRef.current.style.opacity = `${position.opacity ?? 1}`;
            }
        });

        const sizeSubscription = size$.subscribe((size) => {
            if (domRef.current) {
                domRef.current.style.width = `${Math.max(size.endX - size.startX - 2, 0)}px`;
                domRef.current.style.height = `${Math.max(size.endY - size.startY - 2, 0)}px`;
            }

            if (innerDomRef.current) {
                const style = {
                    width: `${size.width - 4}px`,
                    height: `${size.height - 4}px`,
                    left: `${size.absolute.left ? 0 : 'auto'}`,
                    top: `${size.absolute.top ? 0 : 'auto'}`,
                    right: `${size.absolute.left ? 'auto' : 0}`,
                    bottom: `${size.absolute.top ? 'auto' : 0}`,
                };

                innerDomRef.current.style.width = style.width;
                innerDomRef.current.style.height = style.height;
                innerDomRef.current.style.left = style.left;
                innerDomRef.current.style.top = style.top;
                innerDomRef.current.style.right = style.right;
                innerDomRef.current.style.bottom = style.bottom;

                innerStyle.current = style;
            }
        });
        return () => {
            subscription.unsubscribe();
            sizeSubscription.unsubscribe();
        };
    }, [layer.position$, size$]);

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

    //domRef univer-float-dom-wrapper
    //innerDomRef univer-float-dom
    return (
        <div
            ref={domRef}
            className="univer-z-10"
            style={{
                position: 'absolute',
                top: topRef.current,
                left: leftRef.current,
                width: Math.max(position.endX - position.startX - 2, 0),
                height: Math.max(position.endY - position.startY - 2, 0),
                transform: transformRef.current,
                overflow: 'hidden',
                transformOrigin: 'center center',
            }}
            onPointerMove={(e) => {
                layer.onPointerMove(e.nativeEvent);
            }}
            onPointerDown={(e) => {
                layer.onPointerDown(e.nativeEvent);
            }}
            onPointerUp={(e) => {
                layer.onPointerUp(e.nativeEvent);
            }}
            onWheel={(e) => {
                layer.onWheel(e.nativeEvent);
            }}
        >
            <div
                id={id}
                ref={innerDomRef}
                className="univer-overflow-hidden"
                style={{ position: 'absolute', ...innerStyle.current }}
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
    const currentUnitId = unitId || focusUnit;

    return layers?.filter((layer) => layer[1].unitId === currentUnitId)?.map((layer) => (
        <FloatDomSingle
            id={layer[0]}
            layer={layer[1]}
            key={layer[0]}
        />
    ));
};
