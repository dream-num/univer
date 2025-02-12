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

import { describe, expect, it } from 'vitest';

import type { IMoveColumnsMutationParams, IMoveRowsMutationParams } from '../move-rows-cols.mutation';
import { MoveColsMutationUndoFactory, MoveRowsMutationUndoFactory } from '../move-rows-cols.mutation';

describe('Test moving rows & cols', () => {
    it('Should "MoveRowsMutationUndoFactory" return correct params', () => {
        // Moving forward
        const movingForwardParams: IMoveRowsMutationParams = {
            unitId: 'test',
            subUnitId: 'subTest',
            sourceRange: { startColumn: 0, endColumn: 10, startRow: 0, endRow: 1 },
            targetRange: { startColumn: 0, endColumn: 10, startRow: 10, endRow: 11 },
        };
        const movingForwardUndoParams = MoveRowsMutationUndoFactory(null, movingForwardParams);
        expect(movingForwardUndoParams).toEqual({
            unitId: 'test',
            subUnitId: 'subTest',
            sourceRange: { startColumn: 0, endColumn: 10, startRow: 8, endRow: 9 },
            targetRange: { startColumn: 0, endColumn: 10, startRow: 0, endRow: 1 },
        });

        // Moving backward
        const movingBackwardParams: IMoveRowsMutationParams = {
            unitId: 'test',
            subUnitId: 'subTest',
            sourceRange: { startColumn: 0, endColumn: 10, startRow: 10, endRow: 11 },
            targetRange: { startColumn: 0, endColumn: 10, startRow: 0, endRow: 1 },
        };
        const movingBackwardUndoParams = MoveRowsMutationUndoFactory(null, movingBackwardParams);
        expect(movingBackwardUndoParams).toEqual({
            unitId: 'test',
            subUnitId: 'subTest',
            sourceRange: { startColumn: 0, endColumn: 10, startRow: 0, endRow: 1 },
            targetRange: { startColumn: 0, endColumn: 10, startRow: 12, endRow: 13 },
        });
    });

    it('Should "MoveColsMutationUndoFactory" return correct params', () => {
        // Moving forward
        const movingForwardParams: IMoveColumnsMutationParams = {
            unitId: 'test',
            subUnitId: 'subTest',
            sourceRange: { startColumn: 0, endColumn: 1, startRow: 0, endRow: 10 },
            targetRange: { startColumn: 10, endColumn: 11, startRow: 0, endRow: 10 },
        };
        const movingForwardUndoParams = MoveColsMutationUndoFactory(null, movingForwardParams);
        expect(movingForwardUndoParams).toEqual({
            unitId: 'test',
            subUnitId: 'subTest',
            sourceRange: { startColumn: 8, endColumn: 9, startRow: 0, endRow: 10 },
            targetRange: { startColumn: 0, endColumn: 1, startRow: 0, endRow: 10 },
        });

        // Moving backward
        const movingBackwardParams: IMoveColumnsMutationParams = {
            unitId: 'test',
            subUnitId: 'subTest',
            sourceRange: { startColumn: 10, endColumn: 11, startRow: 0, endRow: 10 },
            targetRange: { startColumn: 0, endColumn: 1, startRow: 0, endRow: 10 },
        };
        const movingBackwardUndoParams = MoveColsMutationUndoFactory(null, movingBackwardParams);
        expect(movingBackwardUndoParams).toEqual({
            unitId: 'test',
            subUnitId: 'subTest',
            sourceRange: { startColumn: 0, endColumn: 1, startRow: 0, endRow: 10 },
            targetRange: { startColumn: 12, endColumn: 13, startRow: 0, endRow: 10 },
        });
    });
});
