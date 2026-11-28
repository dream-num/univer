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

import type { IWorkbookData } from '@univerjs/core';
import { CellValueType, DateSystem, ICommandService, LocaleType, RegionService, UndoCommand } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { NumfmtService } from '../../../services/numfmt/numfmt.service';
import { INumfmtService } from '../../../services/numfmt/type';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { RemoveNumfmtMutation, SetNumfmtMutation } from '../../mutations/numfmt.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { TextToNumberCommand } from '../text-to-number.command';
import { createCommandTestBed } from './create-command-test-bed';

const data: IWorkbookData = {
    id: 'test',
    appVersion: '1',
    name: 'Numbers',
    locale: LocaleType.EN_US,
    dateSystem: DateSystem.Date1904,
    sheetOrder: ['s'],
    styles: { text: { n: { pattern: '@' } } },
    sheets: { s: { id: 's', name: 'Sheet1', cellData: { 0: {
        0: { v: '1,234', t: CellValueType.STRING },
        1: { v: '003', t: CellValueType.NUMBER, s: 'text' },
        2: { v: 'abc', t: CellValueType.STRING },
        3: { v: '20%', t: CellValueType.FORCE_STRING },
        4: { v: '01/02/1904', t: CellValueType.STRING },
        5: { v: '1234.56', t: CellValueType.STRING },
    } } } },
};
const range = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 5 };
const target = { unitId: 'test', subUnitId: 's' };

describe('TextToNumberCommand', () => {
    it('converts the current selection with regional punctuation and preserves values and formats on undo', async () => {
        const { univer, get, sheet } = createCommandTestBed(data, [[INumfmtService, { useClass: NumfmtService }]]);
        try {
            const commands = get(ICommandService);
            for (const command of [TextToNumberCommand, SetRangeValuesMutation, SetNumfmtMutation, RemoveNumfmtMutation]) {
                commands.registerCommand(command);
            }
            const worksheet = sheet.getSheetBySheetId('s')!;
            const numfmt = get(INumfmtService);
            get(RegionService).setRegion('de-DE');
            get(SheetsSelectionsService).setSelections('test', 's', [{ range, primary: null, style: null }]);
            expect(await commands.executeCommand(TextToNumberCommand.id, target)).toBe(true);
            expect(Array.from({ length: 6 }, (_, col) => worksheet.getCellRaw(0, col)?.v)).toEqual([1.234, 3, 'abc', 0.2, 31, '1234.56']);
            expect(worksheet.getCellRaw(0, 0)?.t).toBe(CellValueType.NUMBER);
            expect(numfmt.getValue('test', 's', 0, 1)).toBeNull();
            expect(numfmt.getValue('test', 's', 0, 3)?.pattern).toBe('0%');
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(worksheet.getCellRaw(0, 0)).toMatchObject({ v: '1,234', t: CellValueType.STRING });
            expect(worksheet.getCellRaw(0, 3)).toMatchObject({ v: '20%', t: CellValueType.FORCE_STRING });
            expect(numfmt.getValue('test', 's', 0, 1)?.pattern).toBe('@');
            expect(numfmt.getValue('test', 's', 0, 3)).toBeNull();
        } finally {
            univer.dispose();
        }
    });

    it('returns false for a missing target, an empty range list or an unsuccessful mutation', () => {
        const { univer, injector, get } = createCommandTestBed(data, [[INumfmtService, { useClass: NumfmtService }]]);
        try {
            expect(TextToNumberCommand.handler(injector, { ...target, unitId: 'missing', ranges: [range] })).toBe(false);
            expect(TextToNumberCommand.handler(injector, { ...target, ranges: [] })).toBe(false);
            vi.spyOn(get(ICommandService), 'syncExecuteCommand').mockReturnValue(false);
            expect(TextToNumberCommand.handler(injector, { ...target, ranges: [range] })).toBe(false);
        } finally {
            univer.dispose();
        }
    });
});
