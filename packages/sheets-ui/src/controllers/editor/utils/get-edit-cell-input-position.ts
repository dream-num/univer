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
import type { ICellEditorLayout } from '../../../services/editor-bridge.service';

/**
 * Get the position of the hidden editor input for the current edit cell.
 *
 * The OS anchors the IME candidate window to the focused input, so the input should stay on the
 * selected cell even before the cell editor opens. The position is kept inside the sheet canvas,
 * so a cell scrolled out of view never moves the input outside the sheet.
 */
export function getEditCellInputPosition(
    layout: Pick<ICellEditorLayout, 'position' | 'canvasOffset'>,
    canvasSize?: Nullable<{ width: number; height: number }>
): { x: number; y: number } {
    const { position, canvasOffset } = layout;
    const x = canvasOffset.left + position.startX;
    const y = canvasOffset.top + position.startY;

    if (!canvasSize) {
        return { x, y };
    }

    return {
        x: Math.min(Math.max(x, canvasOffset.left), canvasOffset.left + canvasSize.width),
        y: Math.min(Math.max(y, canvasOffset.top), canvasOffset.top + canvasSize.height),
    };
}
