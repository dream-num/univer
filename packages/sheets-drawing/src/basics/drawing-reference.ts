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

import type { ICellOverGridPosition } from '@univerjs/sheets';
import type { ISetDrawingApplyMutationParams } from '../commands/mutations/set-drawing-apply.mutation';

/** Map an anchor marker through a row/column insertion or deletion. */
export function transformSheetDrawingReference(
    marker: ICellOverGridPosition,
    reference: NonNullable<ISetDrawingApplyMutationParams['reference']>
): ICellOverGridPosition {
    const { axis, action, start, end, limit, boundaryOffset } = reference;
    const offset = axis === 'row' ? 'rowOffset' : 'columnOffset';
    if (!['row', 'column'].includes(axis) || !['insert', 'remove'].includes(action)
        || !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start
        || !Number.isInteger(limit) || limit <= 0 || !Number.isFinite(boundaryOffset) || boundaryOffset < 0
        || !Number.isInteger(marker[axis]) || marker[axis] < 0 || !Number.isFinite(marker[offset])) {
        throw new Error('Invalid drawing reference change.');
    }
    const result = { ...marker };
    const count = end - start + 1;
    if (action === 'insert') {
        if (result[axis] >= start) result[axis] += count;
    } else if (result[axis] > end) {
        result[axis] -= count;
    } else if (result[axis] >= start) {
        result[axis] = start;
        result[offset] = 0;
    }
    if (result[axis] >= limit) {
        result[axis] = limit - 1;
        result[offset] = boundaryOffset;
    }
    return result;
}
