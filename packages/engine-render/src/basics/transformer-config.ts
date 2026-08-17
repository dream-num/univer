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
    rotateAnchorPosition?: 'top' | 'bottom';
    rotateLineEnabled?: boolean;
    rotateSize?: number;
    rotateCornerRadius?: number;
    rotateFill?: string;
    rotateStroke?: string;
    rotateStrokeWidth?: number;
    rotateIconEnabled?: boolean;
    rotateIconStroke?: string;
    rotateIconStrokeWidth?: number;

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
    anchorStyle?: 'default' | 'canva';
    anchorSideLongSize?: number;
    anchorSideShortSize?: number;
    anchorSideCornerRadius?: number;
    anchorShadowColor?: string;
    anchorShadowBlur?: number;
    anchorShadowOffsetX?: number;
    anchorShadowOffsetY?: number;

    keepRatio?: boolean;
    centeredScaling?: boolean;

    flipEnabled?: boolean;
    ignoreStroke?: boolean;
    boundBoxFunc?: Nullable<(oldBox: BaseObject, newBox: BaseObject) => BaseObject>;
    useSingleNodeRotation?: boolean;
    shouldOverdrawWholeArea?: boolean;

    /** Render transformer controls on a layer independent from the selected object. */
    controlLayerIndex?: number;

    zeroLeft?: number;
    zeroTop?: number;
    moveBoundaryEnabled?: boolean;
}

export const DEFAULT_TRANSFORMER_CONFIG = {
    resizeEnabled: true,
    rotateEnabled: true,
    rotateAnchorOffset: 28,
    rotateAnchorPosition: 'bottom',
    rotateLineEnabled: false,
    rotateSize: 18,
    rotateCornerRadius: 9,
    rotateFill: '#ffffff',
    rotateStroke: '#4086f4',
    rotateStrokeWidth: 1,
    rotateIconEnabled: true,
    rotateIconStroke: '#4086f4',
    rotateIconStrokeWidth: 1.25,
    borderEnabled: true,
    borderStroke: '#4086f4',
    borderStrokeWidth: 1,
    borderSpacing: 2,
    anchorFill: '#ffffff',
    anchorStroke: '#4086f4',
    anchorStrokeWidth: 1.5,
    anchorSize: 8,
    anchorCornerRadius: 2,
    anchorStyle: 'canva',
    keepRatio: true,
    moveBoundaryEnabled: true,
} satisfies ITransformerConfig;
