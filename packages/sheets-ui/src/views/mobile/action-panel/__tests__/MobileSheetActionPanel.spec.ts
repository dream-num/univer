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
import {
    getMobileCellCenterOffset,
    getMobileCellRevealOffset,
    getMobileEditingMenuBottomOffset,
    getMobileMenuCommand,
    normalizeMobileSelectionPrimary,
} from '../MobileSheetActionPanel';

describe('mobile active-cell reveal offset', () => {
    it('moves only the distance outside the padded visible area', () => {
        expect(getMobileCellRevealOffset(100, 130, 80, 500)).toBe(0);
        expect(getMobileCellRevealOffset(60, 90, 80, 500)).toBe(-20);
        expect(getMobileCellRevealOffset(490, 530, 80, 500)).toBe(30);
    });

    it('centers the active cell in the area above the software keyboard', () => {
        expect(getMobileCellCenterOffset(100, 140, 80, 500)).toBe(-170);
        expect(getMobileCellCenterOffset(280, 320, 80, 520)).toBe(0);
        expect(getMobileCellCenterOffset(460, 500, 80, 520)).toBe(180);
    });
});

describe('mobile editing menu placement', () => {
    it('moves above the compact formula operator strip while it is visible', () => {
        expect(getMobileEditingMenuBottomOffset(false)).toBe(72);
        expect(getMobileEditingMenuBottomOffset(true)).toBe(108);
    });
});

describe('mobile style selection normalization', () => {
    it('restores the last selection primary before running shared style commands', () => {
        const selections = [
            {
                range: { startRow: 3, endRow: 4, startColumn: 2, endColumn: 5 },
                primary: null,
                style: null,
            },
        ];
        const worksheet = { getMergedCell: () => null };

        const normalized = normalizeMobileSelectionPrimary(selections, worksheet);

        expect(normalized?.[0].primary).toMatchObject({
            actualRow: 3,
            actualColumn: 2,
            startRow: 3,
            startColumn: 2,
        });
        expect(selections[0].primary).toBeNull();
    });

    it('keeps an existing primary unchanged', () => {
        const selections = [{
            range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
            primary: {
                actualRow: 1,
                actualColumn: 1,
                startRow: 1,
                endRow: 1,
                startColumn: 1,
                endColumn: 1,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }];

        expect(normalizeMobileSelectionPrimary(selections, { getMergedCell: () => null })).toBeNull();
    });
});

describe('mobile menu command mapping', () => {
    it.each([
        {
            name: 'plain button command',
            input: { id: 'copy', params: { from: 'mobile' } },
            expected: { commandId: 'copy', commandParams: { from: 'mobile' } },
        },
        {
            name: 'explicit command alias',
            input: { id: 'menu.copy', commandId: 'sheet.copy', params: { from: 'mobile' } },
            expected: { commandId: 'sheet.copy', commandParams: { from: 'mobile' } },
        },
        {
            name: 'selector value',
            input: { id: 'align', commandId: 'set-align', value: 'center' },
            expected: { commandId: 'set-align', commandParams: { value: 'center' } },
        },
        {
            name: 'boolean style value',
            input: { id: 'set-bold', value: false },
            expected: { commandId: 'set-bold', commandParams: { value: false } },
        },
        {
            name: 'selector params factory',
            input: { id: 'set-format', value: undefined, params: (value?: string | number) => ({ pattern: value ?? 'general' }) },
            expected: { commandId: 'set-format', commandParams: { pattern: 'general' } },
        },
    ])('maps $name', ({ input, expected }) => {
        expect(getMobileMenuCommand(input)).toEqual(expected);
    });

    it('ignores a menu entry without an executable command id', () => {
        expect(getMobileMenuCommand({ id: undefined })).toBeNull();
    });
});
