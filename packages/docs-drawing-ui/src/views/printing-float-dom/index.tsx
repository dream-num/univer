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

import type { IDocFloatDom } from '@univerjs/docs-drawing';
import type { DocumentSkeleton, IBoundRectNoAngle, Scene } from '@univerjs/engine-render';
import type { IFloatDom, IFloatDomLayout } from '@univerjs/ui';
import { PrintFloatDomSingle } from '@univerjs/ui';
import { useMemo } from 'react';
import { BehaviorSubject } from 'rxjs';
import { calcDocFloatDomPositionByRect } from '../../controllers/doc-float-dom.controller';

export interface IPrintingFloatDomProps {
    floatDomInfos: IDocFloatDom[];
    scene: Scene;
    skeleton: DocumentSkeleton;
    unitId: string;
    offset: { x: number; y: number };
    bound: IBoundRectNoAngle;
};

export const DocPrintingFloatDom = (props: IPrintingFloatDomProps) => {
    const { floatDomInfos, scene, offset, bound } = props;
    const width = bound.right - bound.left;
    const height = bound.bottom - bound.top;

    const floatDomParams = useMemo(() =>
        floatDomInfos.map((info) => {
            const { width = 0, height = 0, left = 0, top = 0 } = info.transform!;
            const offsetBound = calcDocFloatDomPositionByRect(
                {
                    left,
                    right: left + width,
                    top,
                    bottom: top + height,
                },
                scene
            );

            const domPos: IFloatDomLayout = offsetBound;
            const floatDom: IFloatDom & { position: IFloatDomLayout } = {
                position$: new BehaviorSubject<IFloatDomLayout>(domPos),
                position: domPos,
                id: info.drawingId,
                componentKey: info.componentKey,
                onPointerMove: () => { },
                onPointerDown: () => { },
                onPointerUp: () => { },
                onWheel: () => { },
                unitId: info.unitId,
                data: info.data,
            };

            return [info.drawingId, floatDom] as const;
        })
            .filter(([_, floatDom]) => !(floatDom.position.endX < 0 || floatDom.position.endY < 0 || floatDom.position.startX > width || floatDom.position.startY > height)), [floatDomInfos, scene, offset, width, height]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
            {floatDomParams.map(([id, floatDom]) => (
                <PrintFloatDomSingle key={id} layer={floatDom} id={id} position={floatDom.position} />
            ))}
        </div>
    );
};
