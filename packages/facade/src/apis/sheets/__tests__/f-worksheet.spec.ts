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

import type { ICellData, IStyleData, Nullable } from '@univerjs/core';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetStyleCommand, SetTextWrapCommand, SetVerticalTextAlignCommand } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import type { FUniver } from '../../facade';
import { createFacadeTestBed } from '../../__tests__/create-test-bed';

describe('Test FWorksheet', () => {
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
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);

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

    it('Worksheet getSheetName', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        expect(activeSheet?.getSheetName()).toBe('sheet1');
    });
});
