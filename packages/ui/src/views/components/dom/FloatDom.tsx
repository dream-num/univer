/**
 * Copyright 2023-present DreamNum Inc.
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
import { IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { distinctUntilChanged } from 'rxjs';
import { ComponentManager } from '../../../common';
import { useObservable } from '../../../components/hooks/observable';
import { CanvasFloatDomService } from '../../../services/dom/canvas-dom-layer.service';
import styles from './index.module.less';

const FloatDomSingle = memo((props: { layer: IFloatDom; id: string }) => {
    const { layer, id } = props;
    const componentManager = useDependency(ComponentManager);
    const position$ = useMemo(() => layer.position$.pipe(
        distinctUntilChanged(
            (prev, curr) => prev.absolute.left === curr.absolute.left &&
                prev.absolute.top === curr.absolute.top &&
                prev.endX - prev.startX === curr.endX - curr.startX &&
                prev.endY - prev.startY === curr.endY - curr.startY
        )
    ), [layer.position$]);

    const position = useObservable(position$);
    const domRef = useRef<HTMLDivElement>(null);
    const transformRef = useRef<string>(`transform: rotate(${position?.rotate}deg) translate(${position?.startX}px, ${position?.startY}px)`);
    const Component = typeof layer.componentKey === 'string' ? componentManager.get(layer.componentKey) : layer.componentKey;
    const layerProps: any = useMemo(() => ({
        data: layer.data,
        ...layer.props,
    }), [layer.data, layer.props]);

    useEffect(() => {
        const subscription = layer.position$.subscribe((position) => {
            transformRef.current = `rotate(${position.rotate}deg) translate(${position.startX}px, ${position.startY}px)`;
            if (domRef.current) {
                domRef.current.style.transform = transformRef.current;
            }
        });
        return () => subscription.unsubscribe();
    }, [layer.position$]);

    const component = useMemo(() => Component ? <Component {...layerProps} /> : null, [Component, layerProps]);
    if (!position) {
        return null;
    }

    return (
        <div
            ref={domRef}
            className={styles.floatDomWrapper}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: Math.max(position.endX - position.startX - 2, 0),
                height: Math.max(position.endY - position.startY - 2, 0),
                transform: transformRef.current,
                overflow: 'hidden',
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
                className={styles.floatDom}
                style={{
                    width: position.width,
                    height: position.height,
                    position: 'absolute',
                    ...(position.absolute.left) ? { left: 0 } : { right: 0 },
                    ...(position.absolute.top) ? { top: 0 } : { bottom: 0 },
                }}
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
    const currentUnitId = unitId || instanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET)?.getUnitId();

    return layers?.filter((layer) => layer[1].unitId === currentUnitId)?.map((layer) => (
        <FloatDomSingle
            id={layer[0]}
            layer={layer[1]}
            key={layer[0]}
        />
    ));
};
