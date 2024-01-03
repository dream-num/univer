/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, IStyleData, Nullable, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { SetRangeValuesCommand, SetRangeValuesMutation } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import type { FUniver } from '../../facade';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test FRange', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;
    let getStyleByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<IStyleData>;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();

        getStyleByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<IStyleData> => {
            const value = getValueByPosition(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (value && styles) {
                return styles.getStyleByCell(value);
            }
        };
    });

    it('Range setValue', () => {
        const activeSheet = univerAPI.getCurrentSheet()?.getActiveSheet();

        // A1 sets the number
        const range1 = activeSheet?.getRange(0, 0, 1, 1);
        range1?.setValue(1);

        expect(activeSheet?.getRange(0, 0, 1, 1)?.getValue()).toBe(1);

        // B1:C2 sets the string
        const range2 = activeSheet?.getRange(0, 1, 2, 2);
        range2?.setValue({ v: 'test' });

        expect(activeSheet?.getRange(0, 1, 1, 1)?.getValue()).toBe('test');
        expect(activeSheet?.getRange(0, 2, 1, 1)?.getValue()).toBe('test');
        expect(activeSheet?.getRange(1, 1, 1, 1)?.getValue()).toBe('test');
        expect(activeSheet?.getRange(1, 2, 1, 1)?.getValue()).toBe('test');

        // D1:E2 sets numbers and background color
        const range3 = activeSheet?.getRange(0, 3, 2, 2);
        range3?.setValue({
            v: 2,
            s: {
                bg: { rgb: 'red' },
            },
        });

        expect(activeSheet?.getRange(0, 3, 1, 1)?.getValue()).toBe(2);
        expect(activeSheet?.getRange(0, 4, 1, 1)?.getValue()).toBe(2);
        expect(activeSheet?.getRange(1, 3, 1, 1)?.getValue()).toBe(2);
        expect(activeSheet?.getRange(1, 4, 1, 1)?.getValue()).toBe(2);

        expect(getStyleByPosition(0, 3, 0, 3)?.bg?.rgb).toBe('red');
        expect(getStyleByPosition(0, 4, 0, 4)?.bg?.rgb).toBe('red');
        expect(getStyleByPosition(1, 3, 1, 3)?.bg?.rgb).toBe('red');
        expect(getStyleByPosition(1, 4, 1, 4)?.bg?.rgb).toBe('red');
    });

    it('Range setValues', () => {
        const activeSheet = univerAPI.getCurrentSheet()?.getActiveSheet();

        // B3:C4 sets value
        const range1 = activeSheet?.getRange(2, 1, 2, 2);
        range1?.setValues([
            [1, 1],
            [1, 1],
        ]);

        expect(activeSheet?.getRange(2, 1, 1, 1)?.getValue()).toBe(1);
        expect(activeSheet?.getRange(2, 2, 1, 1)?.getValue()).toBe(1);
        expect(activeSheet?.getRange(3, 1, 1, 1)?.getValue()).toBe(1);
        expect(activeSheet?.getRange(3, 2, 1, 1)?.getValue()).toBe(1);

        // D3:E4 sets value and background color
        const range2 = activeSheet?.getRange(2, 3, 2, 2);
        range2?.setValues({
            2: {
                3: {
                    v: 3,
                    s: {
                        bg: { rgb: 'yellow' },
                    },
                },
                4: {
                    v: 4,
                    s: {
                        bg: { rgb: 'green' },
                    },
                },
            },
            3: {
                3: {
                    v: 5,
                    s: {
                        bg: { rgb: 'orange' },
                    },
                },
                4: {
                    v: 6,
                    s: {
                        bg: { rgb: 'red' },
                    },
                },
            },
        });

        expect(activeSheet?.getRange(2, 3, 1, 1)?.getValue()).toBe(3);
        expect(activeSheet?.getRange(2, 4, 1, 1)?.getValue()).toBe(4);
        expect(activeSheet?.getRange(3, 3, 1, 1)?.getValue()).toBe(5);
        expect(activeSheet?.getRange(3, 4, 1, 1)?.getValue()).toBe(6);

        expect(getStyleByPosition(2, 3, 2, 3)?.bg?.rgb).toBe('yellow');
        expect(getStyleByPosition(2, 4, 2, 4)?.bg?.rgb).toBe('green');
        expect(getStyleByPosition(3, 3, 3, 3)?.bg?.rgb).toBe('orange');
        expect(getStyleByPosition(3, 4, 3, 4)?.bg?.rgb).toBe('red');
    });
});
