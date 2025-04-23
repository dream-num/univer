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

import type { IFloatDom, IFloatDomLayout } from '../../../services/dom/canvas-dom-layer.service';
import { IUniverInstanceService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { memo, useMemo, useRef } from 'react';
import { ComponentManager } from '../../../common';

export const PrintFloatDomSingle = memo((props: { layer: IFloatDom; id: string; position: IFloatDomLayout }) => {
    const { layer, id, position } = props;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const domRef = useRef<HTMLDivElement>(null);
    const innerDomRef = useRef<HTMLDivElement>(null);
    const transformRef = useRef<string>(`transform: rotate(${position?.rotate}deg) translate(${position?.startX}px, ${position?.startY}px)`);
    const topRef = useRef<number>(position?.startY ?? 0);
    const leftRef = useRef<number>(position?.startX ?? 0);

    const Component = typeof layer.componentKey === 'string' ? useDependency(ComponentManager).get(layer.componentKey) : layer.componentKey;
    const layerProps: any = useMemo(() => ({
        data: layer.data,
        ...layer.props,
    }), [layer.data, layer.props]);

    const innerStyle = {
        width: `${position.width - 4}px`,
        height: `${position.height - 4}px`,
        left: `${position.absolute.left ? 0 : 'auto'}`,
        top: `${position.absolute.top ? 0 : 'auto'}`,
        right: `${position.absolute.left ? 'auto' : 0}`,
        bottom: `${position.absolute.top ? 'auto' : 0}`,
    };
    transformRef.current = `rotate(${position.rotate}deg)`;
    topRef.current = position.startY;
    leftRef.current = position.startX;

    const instance = univerInstanceService.getUnit(layer.unitId);
    const component = useMemo(() => Component
        ? (
            <Component
                {...layerProps}
                unitId={layer.unitId}
                unit={instance}
                floatDomId={layer.id}
                context={{
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
                style={{ position: 'absolute', ...innerStyle }}
            >
                {component}
            </div>
        </div>
    );
});
