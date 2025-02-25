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

import type { Nullable } from '@univerjs/core';
import type { BaseObject } from '../base-object';
import type { IMouseEvent, IPointerEvent } from './i-events';

export interface ITransformerConfig {
    // for image copper
    isCropper?: boolean;

    hoverEnabled?: boolean;
    hoverEnterFunc?: Nullable<(e: IPointerEvent | IMouseEvent) => void>;
    hoverLeaveFunc?: Nullable<(e: IPointerEvent | IMouseEvent) => void>;

    rotateEnabled?: boolean;
    rotationSnaps?: number[];
    rotationSnapTolerance?: number;
    rotateAnchorOffset?: number;
    rotateSize?: number;
    rotateCornerRadius?: number;

    borderEnabled?: boolean;
    borderStroke?: string;
    borderStrokeWidth?: number;
    borderDash?: number[];
    borderSpacing?: number;

    resizeEnabled?: boolean;
    enabledAnchors?: number[];
    anchorFill?: string;
    anchorStroke?: string;
    anchorStrokeWidth?: number;
    anchorSize?: number;
    anchorCornerRadius?: number;

    keepRatio?: boolean;
    centeredScaling?: boolean;

    flipEnabled?: boolean;
    ignoreStroke?: boolean;
    boundBoxFunc?: Nullable<(oldBox: BaseObject, newBox: BaseObject) => BaseObject>;
    useSingleNodeRotation?: boolean;
    shouldOverdrawWholeArea?: boolean;

    zeroLeft?: number;
    zeroTop?: number;
}
