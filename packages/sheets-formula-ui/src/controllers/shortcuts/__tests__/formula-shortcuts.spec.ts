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

import { QuickSumCommand } from '@univerjs/sheets-formula';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { ReferenceAbsoluteOperation } from '../../../commands/operations/reference-absolute.operation';

const whenSheetEditorActivatedMock = vi.fn();
const whenSheetEditorFocusedMock = vi.fn();

vi.mock('@univerjs/sheets-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/sheets-ui')>();

    return {
        ...actual,
        whenSheetEditorActivated: whenSheetEditorActivatedMock,
        whenSheetEditorFocused: whenSheetEditorFocusedMock,
    };
});

describe('formula shortcuts', () => {
    it('binds F4 to reference absolute switching only while the sheet editor is active', async () => {
        const { ChangeRefToAbsoluteShortcut } = await import('../prompt.shortcut');
        const contextService = {};
        whenSheetEditorActivatedMock.mockReturnValueOnce(true);

        expect(ChangeRefToAbsoluteShortcut.id).toBe(ReferenceAbsoluteOperation.id);
        expect(ChangeRefToAbsoluteShortcut.binding).toBe(KeyCode.F4);
        expect(ChangeRefToAbsoluteShortcut.preconditions?.(contextService as never)).toBe(true);
        expect(whenSheetEditorActivatedMock).toHaveBeenCalledWith(contextService);
    });

    it('binds quick sum to platform shortcuts while the sheet editor is focused', async () => {
        const { QuickSumShortcut } = await import('../quick-sum.shortcut');

        expect(QuickSumShortcut.id).toBe(QuickSumCommand.id);
        expect(QuickSumShortcut.binding).toBe(MetaKeys.ALT | KeyCode.EQUAL);
        expect(QuickSumShortcut.mac).toBe(MetaKeys.CTRL_COMMAND | MetaKeys.ALT | KeyCode.EQUAL);
        expect(QuickSumShortcut.preconditions).toBe(whenSheetEditorFocusedMock);
        expect(QuickSumShortcut.description).toBe('sheets-formula-ui.shortcut.quick-sum');
        expect(QuickSumShortcut.group).toBe('4_sheet-edit');
        expect(QuickSumShortcut.groupTitle).toBe('sheets-ui.shortcut.sheet-edit');
    });
});
