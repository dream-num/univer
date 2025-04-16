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

import type { IAbsoluteTransform } from '../../shared/shape';
import type { Nullable } from '../../shared/types';
import type { BooleanNumber } from '../enum/text-style';

/**
 * The layer type of Drawing, used to distinguish between forward, backward, front, and back
 */
export enum ArrangeTypeEnum {
    /**
     * Move the current object one layer up, possibly covering other objects
     */
    forward,
    /**
     * Move the current object one layer down, possibly being covered by other objects
     */
    backward,
    /**
     * Move the current object to the top layer
     */
    front,
    /**
     * Move the current object to the bottom layer
     */
    back,
}

/**
 * Types of drawings, used to distinguish between images, shapes, charts, tables, SmartArt, videos, DrawingGroup, Unit, Dom, etc.
 */
export enum DrawingTypeEnum {
    /**
     * Unrecognized drawing type, requires user to determine
     */
    UNRECOGNIZED = -1,
    /**
     * Image
     */
    DRAWING_IMAGE = 0,
    /**
     * Shape, similar to shapes in Office, including circles, rectangles, lines, etc.
     */
    DRAWING_SHAPE = 1,
    /**
     * Chart
     */
    DRAWING_CHART = 2,
    /**
     * Table
     */
    DRAWING_TABLE = 3,
    /**
     * SmartArt, similar to SmartArt in Office
     */
    DRAWING_SMART_ART = 4,
    /**
     * Video
     */
    DRAWING_VIDEO = 5,
    /**
     * Drawing group
     */
    DRAWING_GROUP = 6,
    /**
     * Univer object, allows inserting images, tables, documents, slides as floating objects into the document
     */
    DRAWING_UNIT = 7,
    /**
     * Dom element, allows inserting HTML elements as floating objects into the document
     */
    DRAWING_DOM = 8,
}

export type DrawingType = DrawingTypeEnum | number;

export interface IDrawingSpace {
    unitId: string;
    subUnitId: string; //sheetId, pageId and so on, it has a default name in doc business
}

export interface IDrawingSearch extends IDrawingSpace {
    drawingId: string;
}

export interface IRotationSkewFlipTransform {
    angle?: number;
    skewX?: number;
    skewY?: number;
    flipX?: boolean;
    flipY?: boolean;
}

export interface ITransformState extends IAbsoluteTransform, IRotationSkewFlipTransform {}

export interface IDrawingParam extends IDrawingSearch {
    drawingType: DrawingType;
    transform?: Nullable<ITransformState>;
    transforms?: Nullable<ITransformState[]>;
    // The same drawing render in different place, like image in header and footer.
    // The default value is BooleanNumber.FALSE. if it's true, Please use transforms.
    isMultiTransform?: BooleanNumber;
    groupId?: string;
    allowTransform?: boolean;
}

// #endregion
