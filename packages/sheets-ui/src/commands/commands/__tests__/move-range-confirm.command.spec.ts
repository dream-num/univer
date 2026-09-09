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

import type { Injector, IWorkbookData, Univer, Workbook } from '@univerjs/core';
import {
    ICommandService,
    IConfirmService,
    LocaleService,
    LocaleType,
    TestConfirmService,
} from '@univerjs/core';
import {
    MoveRangeCommand,
    MoveRangeMutation,
    SetSelectionsOperation,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MoveRangeConfirmCommand } from '../move-range-confirm.command';
import { createCommandTestBed } from './create-command-test-bed';

const FROM_RANGE = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };
const TO_RANGE = { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 };

describe('MoveRangeConfirmCommand', () => {
    let univer: Univer;
    let get: Injector['get'];
    let workbook: Workbook;
    let commandService: ICommandService;
    let confirmService: TestConfirmService<unknown>;

    beforeEach(() => {
        const testBed = createCommandTestBed(createWorkbookData(), [
            [IConfirmService, { useClass: TestConfirmService }],
        ]);
        univer = testBed.univer;
        get = testBed.get;
        workbook = testBed.sheet;
        commandService = get(ICommandService);
        confirmService = get(IConfirmService) as TestConfirmService<unknown>;
        get(LocaleService).setLocale(LocaleType.EN_US);

        [MoveRangeCommand, MoveRangeConfirmCommand, MoveRangeMutation, SetSelectionsOperation].forEach((command) => {
            commandService.registerCommand(command);
        });
    });

    afterEach(() => {
        univer.dispose();
    });

    it('does not overwrite target content when confirmation is canceled', async () => {
        const confirm = vi.spyOn(confirmService, 'confirm').mockResolvedValue(false);

        expect(await commandService.executeCommand(MoveRangeConfirmCommand.id, {
            fromRange: FROM_RANGE,
            toRange: TO_RANGE,
        })).toBeFalsy();
        expect(confirm).toHaveBeenCalledWith({
            id: MoveRangeConfirmCommand.id,
            title: { title: 'Warning' },
            children: {
                title: 'There is already data in the target area. This action will overwrite the existing data. Do you want to continue?',
            },
            cancelText: 'Cancel',
            confirmText: 'OK',
        });
        expect(getCellValue(0, 0)).toBe('source');
        expect(getCellValue(0, 1)).toBe('target');
    });

    it('overwrites target content after confirmation', async () => {
        const confirm = vi.spyOn(confirmService, 'confirm').mockResolvedValue(true);

        expect(await commandService.executeCommand(MoveRangeConfirmCommand.id, {
            fromRange: FROM_RANGE,
            toRange: TO_RANGE,
        })).toBeTruthy();
        expect(confirm).toHaveBeenCalledTimes(1);
        expect(getCellValue(0, 0)).toBeUndefined();
        expect(getCellValue(0, 1)).toBe('source');
    });

    function getCellValue(row: number, column: number) {
        return workbook.getActiveSheet().getCellRaw(row, column)?.v;
    }
});

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: '',
        sheetOrder: ['sheet1'],
        styles: {},
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: {
                        0: { v: 'source' },
                        1: { v: 'target' },
                    },
                },
            },
        },
    };
}
