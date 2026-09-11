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
import type {
    Documents,
    DocumentSkeleton,
    IMouseEvent,
    INodePosition,
    IPointerEvent,
    Scene,
} from '@univerjs/engine-render';
import type { TextRange } from '../selection/text-range';
import { generateRandomId } from '@univerjs/core';
import { Rect } from '@univerjs/engine-render';
import { NodePositionConvertToCursor } from '../selection/convert-text-range';
import { getAnchorBounding, TEXT_RANGE_LAYER_INDEX } from '../selection/text-range';

const MOBILE_HANDLE_TOUCH_SIZE = 32;
const MOBILE_HANDLE_VISUAL_SIZE = 12;
const MOBILE_HANDLE_STEM_WIDTH = 2;
const ID_LENGTH = 6;
const MOBILE_HANDLE_KEY_PREFIX = '__MobileTextSelectionHandle__';

export type MobileTextRangeHandleType = 'start' | 'end';

export class MobileTextSelectionVisuals {
    private _startHandleShape: Nullable<Rect>;
    private _endHandleShape: Nullable<Rect>;
    private _startHandleStemShape: Nullable<Rect>;
    private _endHandleStemShape: Nullable<Rect>;
    private _onPointerDown: Nullable<(
        handle: MobileTextRangeHandleType,
        event: IPointerEvent | IMouseEvent
    ) => void>;

    constructor(private readonly _scene: Scene) {}

    show(
        range: TextRange,
        document: Documents,
        docSkeleton: DocumentSkeleton,
        color: string,
        onPointerDown: (handle: MobileTextRangeHandleType, event: IPointerEvent | IMouseEvent) => void
    ): void {
        this._onPointerDown = onPointerDown;
        this._createShapes(color);
        if (range.collapsed) {
            this.hide();
            return;
        }

        const start = this._getNodeCaretBounding(range.startNodePosition, document, docSkeleton);
        const end = this._getNodeCaretBounding(range.endNodePosition, document, docSkeleton);
        if (
            !start ||
            !end ||
            !this._startHandleShape ||
            !this._endHandleShape ||
            !this._startHandleStemShape ||
            !this._endHandleStemShape
        ) {
            this.hide();
            return;
        }

        const { scaleX, scaleY } = this._scene.getAncestorScale();
        const scale = Math.max(scaleX, scaleY, 0.01);
        const touchSize = MOBILE_HANDLE_TOUCH_SIZE / scale;
        const visualSize = MOBILE_HANDLE_VISUAL_SIZE / scale;
        const stemWidth = MOBILE_HANDLE_STEM_WIDTH / scale;
        const placeHandle = (
            shape: Rect,
            stem: Rect,
            bounding: NonNullable<ReturnType<MobileTextSelectionVisuals['_getNodeCaretBounding']>>,
            edge: MobileTextRangeHandleType
        ) => {
            const handleTop = edge === 'start'
                ? bounding.top - touchSize / 2
                : bounding.top + bounding.height - touchSize / 2;
            stem.transformByState({
                left: bounding.left - stemWidth / 2,
                top: bounding.top,
                width: stemWidth,
                height: bounding.height,
            });
            shape.setProps({
                radius: visualSize / 2,
                visualWidth: visualSize,
                visualHeight: visualSize,
            });
            shape.transformByState({
                left: bounding.left - touchSize / 2,
                top: handleTop,
                width: touchSize,
                height: touchSize,
            });
            stem.show();
            shape.show();
        };

        placeHandle(this._startHandleShape, this._startHandleStemShape, start, 'start');
        placeHandle(this._endHandleShape, this._endHandleStemShape, end, 'end');
    }

    hide(): void {
        this._startHandleShape?.hide();
        this._endHandleShape?.hide();
        this._startHandleStemShape?.hide();
        this._endHandleStemShape?.hide();
    }

    dispose(): void {
        this._startHandleShape?.dispose();
        this._startHandleShape = null;
        this._endHandleShape?.dispose();
        this._endHandleShape = null;
        this._startHandleStemShape?.dispose();
        this._startHandleStemShape = null;
        this._endHandleStemShape?.dispose();
        this._endHandleStemShape = null;
        this._onPointerDown = null;
    }

    private _createShapes(color: string): void {
        if (
            this._startHandleShape &&
            this._endHandleShape &&
            this._startHandleStemShape &&
            this._endHandleStemShape
        ) {
            this._startHandleShape.setProps({ fill: color });
            this._endHandleShape.setProps({ fill: color });
            this._startHandleStemShape.setProps({ fill: color });
            this._endHandleStemShape.setProps({ fill: color });
            return;
        }

        const createStem = () => {
            const shape = new Rect(`${MOBILE_HANDLE_KEY_PREFIX}Stem${generateRandomId(ID_LENGTH)}`, {
                fill: color,
                evented: false,
                debounceParentDirty: false,
            });
            this._scene.addObject(shape, TEXT_RANGE_LAYER_INDEX + 1);
            return shape;
        };
        const createHandle = (handle: MobileTextRangeHandleType) => {
            const shape = new Rect(`${MOBILE_HANDLE_KEY_PREFIX}${generateRandomId(ID_LENGTH)}`, {
                width: MOBILE_HANDLE_TOUCH_SIZE,
                height: MOBILE_HANDLE_TOUCH_SIZE,
                radius: MOBILE_HANDLE_VISUAL_SIZE / 2,
                visualWidth: MOBILE_HANDLE_VISUAL_SIZE,
                visualHeight: MOBILE_HANDLE_VISUAL_SIZE,
                fill: color,
                evented: true,
                debounceParentDirty: false,
            });
            shape.onPointerDown$.subscribeEvent((event, state) => {
                state.stopPropagation();
                this._onPointerDown?.(handle, event);
            });
            this._scene.addObject(shape, TEXT_RANGE_LAYER_INDEX + 1);
            return shape;
        };

        this._startHandleStemShape = createStem();
        this._endHandleStemShape = createStem();
        this._startHandleShape = createHandle('start');
        this._endHandleShape = createHandle('end');
    }

    private _getNodeCaretBounding(
        position: Nullable<INodePosition>,
        document: Documents,
        docSkeleton: DocumentSkeleton
    ) {
        if (!position) {
            return;
        }

        const { docsLeft, docsTop } = document.getOffsetConfig();
        const convertor = new NodePositionConvertToCursor(document.getOffsetConfig(), docSkeleton);
        const { contentBoxPointGroup } = convertor.getRangePointData(position, position);
        if (contentBoxPointGroup.length === 0) {
            return;
        }

        const bounding = getAnchorBounding(contentBoxPointGroup);
        return {
            ...bounding,
            left: bounding.left + docsLeft,
            top: bounding.top + docsTop,
        };
    }
}
