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

import type { IAbsoluteTransform, IGroupBaseBound } from '../../shared/shape';
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
    /**
     * Block element, allows host products to place embeddable unit-backed blocks as drawing objects.
     */
    DRAWING_BLOCK = 9,
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

// used to disable some transform features like rotate, resize, border for line shapes
// chart should not allow rotate in excel
export interface ITransformStateDisableOption {
    rotateEnabled?: boolean;
    resizeEnabled?: boolean;
    borderEnabled?: boolean;
}

export interface ITransformState extends IAbsoluteTransform, IRotationSkewFlipTransform, ITransformStateDisableOption { }

export interface IDrawingObjectLocks {
    /**
     * Prevent selecting the drawing directly from the canvas. Layer/object panels may still select it for management.
     */
    noSelect?: boolean;
    noMove?: boolean;
    noResize?: boolean;
    noRotate?: boolean;
    noTextEdit?: boolean;
    noEditPoints?: boolean;
    noChangeAspect?: boolean;
}

export interface IDrawingParam extends IDrawingSearch {
    drawingType: DrawingType;
    transform?: Nullable<ITransformState>;
    transforms?: Nullable<ITransformState[]>;
    // The same drawing render in different place, like image in header and footer.
    // The default value is BooleanNumber.FALSE. if it's true, Please use transforms.
    isMultiTransform?: BooleanNumber;
    groupId?: string;
    allowTransform?: boolean;
    /**
     * The base bound of the group, used to calculate the relative position of children in the group.
     * It is only used when drawingType is DRAWING_GROUP.
     */
    groupBaseBound?: Nullable<IGroupBaseBound>;
    /**
     * The drawing element is hidden when render
     */
    hidden?: boolean;
    name?: string;
    description?: string;
    /**
     * Compatibility shortcut for whether the drawing can be selected from the canvas.
     * Prefer locks.noSelect for fine-grained behavior when available.
     */
    selectable?: boolean;
    locks?: IDrawingObjectLocks;
}

/**
 * Describes a single group node's direct children in a group hierarchy.
 */
export interface IDrawingGroupNestedIds {
    /** The drawing ID of the group itself. */
    drawingId: string;
    /**
     * The drawing IDs of the direct children of this group (both group and
     * non-group children). Does not include deeply-nested descendants.
     */
    children?: string[];
}

/**
 * A flattened representation of a nested group hierarchy, produced by a
 * post-order DFS traversal so that every child always appears before its
 * parent in the respective arrays.
 */
export interface IDrawingGroupNestedParam {
    /**
     * A map from each group's drawingId to its {@link IDrawingGroupNestedIds}
     * descriptor. Covers the root group and every nested sub-group. Look up
     * any group's direct children in O(1) via `nestedIdRecord[groupId].children`.
     */
    nestedIdRecord: Record<string, IDrawingGroupNestedIds>;
    /**
     * All non-group (leaf) drawing params that belong anywhere in the group
     * hierarchy. Post-order: a leaf always appears before the group that
     * directly contains it.
     */
    flatChildren?: IDrawingParam[];
    /**
     * All group drawing params in the hierarchy (including the root group).
     * Post-order: nested child groups appear before their parent group, so
     * callers can safely iterate in order without dependency issues.
     * The root group is always the last element.
     */
    groups: IDrawingParam[];
}
// #endregion
