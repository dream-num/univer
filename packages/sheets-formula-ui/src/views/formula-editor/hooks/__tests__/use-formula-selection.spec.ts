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

// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import {
    FormulaSelectingType,
    resolveFormulaSelectingIntent,
    resolveFormulaSelectionCursorIndex,
    resolveFormulaSelectionDataStream,
    resolveFormulaSelectionWorkbook,
    shouldAddFormulaReference,
    shouldSkipReferenceEditingByPointer,
} from '../use-formula-selection';

describe('use-formula-selection regression scenarios', () => {
    it('only skips reference editing when pointer-origin editing is still disabled and click editing is allowed', () => {
        expect(shouldSkipReferenceEditingByPointer(true)).toBe(true);
        expect(shouldSkipReferenceEditingByPointer(true, true)).toBe(false);
        expect(shouldSkipReferenceEditingByPointer(false)).toBe(false);
    });

    it('falls back to the formula editor workbook when the focused current workbook is unavailable', () => {
        const fallbackWorkbook = { unitId: 'embedded-sheet' };

        expect(resolveFormulaSelectionWorkbook(undefined, fallbackWorkbook)).toBe(fallbackWorkbook);
        expect(resolveFormulaSelectionWorkbook(null, fallbackWorkbook)).toBe(fallbackWorkbook);
        expect(resolveFormulaSelectionWorkbook({ unitId: 'current-sheet' }, fallbackWorkbook)).toEqual({ unitId: 'current-sheet' });
    });

    it('reads formula selection text from the formula editor instead of the current host document', () => {
        const accessor = {
            get: vi.fn(() => ({
                getCurrentUniverDocInstance: vi.fn(() => ({
                    getBody: () => ({ dataStream: 'host document text\r\n' }),
                })),
            })),
        };
        const editor = {
            getDocumentDataModel: vi.fn(() => ({
                getBody: () => ({ dataStream: '=SUM(\r\n' }),
            })),
        };

        expect(resolveFormulaSelectionDataStream(accessor as never, editor as never)).toEqual({
            dataStream: '=SUM(\r\n',
            offset: 0,
        });
    });

    it('falls back to the editor unit when the formula editor document model has been disposed', () => {
        const accessor = {
            get: vi.fn(() => ({
                getUnit: vi.fn((unitId: string) => unitId === 'formula-editor'
                    ? { getBody: () => ({ dataStream: '=A1\r\n' }) }
                    : undefined),
                getCurrentUnitOfType: vi.fn(() => ({
                    getBody: () => ({ dataStream: 'host document text\r\n' }),
                })),
            })),
        };
        const editor = {
            getDocumentDataModel: vi.fn(() => null),
        };

        expect(resolveFormulaSelectionDataStream(accessor as never, editor as never, 'formula-editor')).toEqual({
            dataStream: '=A1\r\n',
            offset: 0,
        });
    });

    it('reads formula selection text from the editor unit before falling back to the current host document', () => {
        const accessor = {
            get: vi.fn(() => ({
                getUnit: vi.fn((unitId: string) => unitId === 'formula-editor'
                    ? { getBody: () => ({ dataStream: '=A1\r\n' }) }
                    : undefined),
                getCurrentUniverDocInstance: vi.fn(() => ({
                    getBody: () => ({ dataStream: 'host document text\r\n' }),
                })),
            })),
        };

        expect(resolveFormulaSelectionDataStream(accessor as never, undefined, 'formula-editor')).toEqual({
            dataStream: '=A1\r\n',
            offset: 0,
        });
    });

    it('uses the end of a fresh formula when the editor selection offset is still stale', () => {
        expect(resolveFormulaSelectionCursorIndex({ collapsed: true, startOffset: 0 }, '=')).toBe(1);
        expect(resolveFormulaSelectionCursorIndex({ collapsed: true, startOffset: 0 }, '=SUM(')).toBe(5);
        expect(resolveFormulaSelectionCursorIndex({ collapsed: true, startOffset: 0 }, 'plain')).toBe(0);
        expect(resolveFormulaSelectionCursorIndex({ collapsed: true, startOffset: 2 }, '=A1')).toBe(2);
    });

    it('prefers adding a new formula reference when the cursor is after a delimiter', () => {
        expect(resolveFormulaSelectingIntent(true, true)).toBe(FormulaSelectingType.NEED_ADD);
        expect(resolveFormulaSelectingIntent(true, false)).toBe(FormulaSelectingType.NEED_ADD);
        expect(resolveFormulaSelectingIntent(false, true)).toBe(FormulaSelectingType.CAN_EDIT);
        expect(resolveFormulaSelectingIntent(false, false)).toBe(FormulaSelectingType.NOT_SELECT);
    });

    it('only arms reference picking after formula delimiters and operators', () => {
        expect(shouldAddFormulaReference('=', 1)).toBe(true);
        expect(shouldAddFormulaReference('=SUM(', 5)).toBe(true);
        expect(shouldAddFormulaReference('=SUM(A1,', 8)).toBe(true);
        expect(shouldAddFormulaReference('=A1+', 4)).toBe(true);
        expect(shouldAddFormulaReference('=Sheet1!', 8)).toBe(true);
        expect(shouldAddFormulaReference('=SUM', 4)).toBe(false);
        expect(shouldAddFormulaReference('=A1', 3)).toBe(false);
    });
});
