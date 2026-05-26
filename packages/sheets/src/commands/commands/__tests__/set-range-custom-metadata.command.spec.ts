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

import type { IWorkbookData, Univer } from '@univerjs/core';
import { BorderStyleTypes, CellValueType, ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { SetRangeCustomMetadataCommand } from '../set-range-custom-metadata.command';
import { createCommandTestBed } from './create-command-test-bed';

const WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: ['sheet1'],
    styles: {},
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'sheet1',
            cellData: {
                0: {
                    2: {
                        s: {
                            bd: {
                                t: { s: BorderStyleTypes.THIN, cl: { rgb: '#000000' } },
                                r: { s: BorderStyleTypes.THIN, cl: { rgb: '#000000' } },
                                b: { s: BorderStyleTypes.THIN, cl: { rgb: '#000000' } },
                                l: { s: BorderStyleTypes.THIN, cl: { rgb: '#000000' } },
                            },
                        },
                        t: CellValueType.STRING,
                    },
                },
            },
        },
    },
};

describe('SetRangeCustomMetadataCommand', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let univerInstanceService: IUniverInstanceService;

    beforeEach(() => {
        const testBed = createCommandTestBed(WORKBOOK_DATA);
        univer = testBed.univer;
        commandService = testBed.get(ICommandService);
        univerInstanceService = testBed.get(IUniverInstanceService);

        commandService.registerCommand(SetRangeCustomMetadataCommand);
        commandService.registerCommand(SetRangeValuesMutation);
    });

    afterEach(() => univer.dispose());

    it('preserves existing cell type and border style when setting metadata on a styled empty cell', async () => {
        const result = await commandService.executeCommand(SetRangeCustomMetadataCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: {
                startRow: 0,
                endRow: 0,
                startColumn: 2,
                endColumn: 2,
                rangeType: RANGE_TYPE.NORMAL,
            },
            customMetadata: {
                custom: { key: 'value' },
            },
        });

        const workbook = univerInstanceService.getUniverSheetInstance('test')!;
        const cell = workbook.getSheetBySheetId('sheet1')!.getCellRaw(0, 2);
        const style = workbook.getStyles().getStyleByCell(cell);

        expect(result).toBe(true);
        expect(cell?.custom).toEqual({ key: 'value' });
        expect(cell?.t).toBe(CellValueType.STRING);
        expect(style).toMatchObject({
            bd: {
                t: { s: BorderStyleTypes.THIN },
                r: { s: BorderStyleTypes.THIN },
                b: { s: BorderStyleTypes.THIN },
                l: { s: BorderStyleTypes.THIN },
            },
        });
    });
});
