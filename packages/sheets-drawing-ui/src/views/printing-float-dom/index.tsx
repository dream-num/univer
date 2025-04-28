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

import type { Worksheet } from '@univerjs/core';
import type { Scene, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { IFloatDomData } from '@univerjs/sheets-drawing';
import type { IFloatDom, IFloatDomLayout } from '@univerjs/ui';
import { PrintFloatDomSingle } from '@univerjs/ui';
import { useMemo } from 'react';
import { BehaviorSubject } from 'rxjs';
import { transformBound2DOMBound } from '../../services/canvas-float-dom-manager.service';

export interface IPrintingFloatDomProps {
    floatDomInfos: IFloatDomData[];
    scene: Scene;
    skeleton: SpreadsheetSkeleton;
    worksheet: Worksheet;
};

export const PrintingFloatDom = (props: IPrintingFloatDomProps) => {
    const { floatDomInfos, scene, skeleton, worksheet } = props;
    const floatDomParams = useMemo(() => floatDomInfos.map((info) => {
        const { width, height, angle, left, top } = info.transform!;
        const offsetBound = transformBound2DOMBound(
            {
                left: left ?? 0,
                right: (left ?? 0) + (width ?? 0),
                top: top ?? 0,
                bottom: (top ?? 0) + (height ?? 0),
            },
            scene,
            skeleton,
            worksheet,
            undefined,
            true
        );
        const { scaleX, scaleY } = scene.getAncestorScale();

        const domPos: IFloatDomLayout = {
            startX: offsetBound.left,
            endX: offsetBound.right,
            startY: offsetBound.top,
            endY: offsetBound.bottom,
            rotate: angle!,
            width: width! * scaleX,
            height: height! * scaleY,
            absolute: offsetBound.absolute,
        };

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
    }), [floatDomInfos, scene, skeleton, worksheet]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
            {floatDomParams.map(([id, floatDom]) => (
                <PrintFloatDomSingle key={id} layer={floatDom} id={id} position={floatDom.position} />
            ))}
        </div>
    );
};
