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

import type { ComponentType } from 'react';
import type { IFloatDom, IFloatDomLayout } from '../../../services/dom/canvas-dom-layer.service';
import { IUniverInstanceService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { memo, useMemo, useRef } from 'react';
import { ComponentManager } from '../../../common';
import { shouldForwardFloatDomEvents } from '../../../services/dom/canvas-dom-layer.service';

export const PrintFloatDomSingle = memo((props: { layer: IFloatDom; id: string; position: IFloatDomLayout }) => {
    const { layer } = props;

    return typeof layer.componentKey === 'string'
        ? <RegisteredPrintFloatDomSingle {...props} componentKey={layer.componentKey} />
        : <PrintFloatDomSingleContent {...props} Component={layer.componentKey} />;
});

function RegisteredPrintFloatDomSingle(props: { layer: IFloatDom; id: string; position: IFloatDomLayout; componentKey: string }) {
    const componentManager = useDependency(ComponentManager);
    return <PrintFloatDomSingleContent {...props} Component={componentManager.get(props.componentKey)} />;
}

function PrintFloatDomSingleContent(props: { layer: IFloatDom; id: string; position: IFloatDomLayout; Component?: ComponentType<any> }) {
    const { layer, id, position, Component } = props;

    const univerInstanceService = useDependency(IUniverInstanceService);
    const domRef = useRef<HTMLDivElement>(null);
    const innerDomRef = useRef<HTMLDivElement>(null);
    const transformRef = useRef<string>(`transform: rotate(${position?.rotate}deg) translate(${position?.startX}px, ${position?.startY}px)`);
    const topRef = useRef<number>(position?.startY ?? 0);
    const leftRef = useRef<number>(position?.startX ?? 0);

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
            className="univer-absolute univer-z-10 univer-origin-center univer-overflow-hidden"
            style={{
                top: topRef.current,
                left: leftRef.current,
                width: Math.max(position.endX - position.startX - 2, 0),
                height: Math.max(position.endY - position.startY - 2, 0),
                transform: transformRef.current,
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
                ref={innerDomRef}
                id={id}
                className="univer-absolute univer-overflow-hidden"
                style={{ ...innerStyle }}
            >
                {component}
            </div>
        </div>
    );
}
