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
import React, { memo } from 'react';
import { ComponentManager } from '../../../common';
import { useObservable } from '../../../components/hooks/observable';
import { CanvasFloatDomService } from '../../../services/dom/canvas-dom-layer.service';
import styles from './index.module.less';

const FloatDomSingle = memo((props: { layer: IFloatDom; id: string }) => {
    const { layer, id } = props;
    const componentManager = useDependency(ComponentManager);
    const position = useObservable(layer.position$);
    const Component = typeof layer.componentKey === 'string' ? componentManager.get(layer.componentKey) : layer.componentKey;
    const layerProps: any = {
        data: layer.data,
        ...layer.props,
    };

    return position
        ? (
            <div
                className={styles.floatDomWrapper}
                style={{
                    position: 'absolute',
                    top: position.startY,
                    left: position.startX,
                    width: Math.max(position.endX - position.startX - 2, 0),
                    height: Math.max(position.endY - position.startY - 2, 0),
                    transform: `rotate(${position.rotate}deg)`,
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
                    {Component ? <Component {...layerProps} /> : null}
                </div>
            </div>
        )
        : null;
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
