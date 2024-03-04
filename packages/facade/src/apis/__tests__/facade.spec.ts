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
import { SetRangeValuesCommand, SetRangeValuesMutation, SetStyleCommand } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RenderComponentType, SheetComponent } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SHEET_VIEW_KEY } from '@univerjs/sheets-ui';
import type { FUniver } from '../facade';
import { createTestBed } from './create-test-bed';
import { COLUMN_UNIQUE_KEY, ColumnHeaderCustomExtension, MAIN_UNIQUE_KEY, MainCustomExtension, ROW_UNIQUE_KEY, RowHeaderCustomExtension } from './utils/sheet-extension-util';

describe('Test FUniver', () => {
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
    let getSheetRenderComponent: (unitId: string, viewKey: SHEET_VIEW_KEY) => Nullable<RenderComponentType>;

    beforeEach(() => {
        const testBed = createTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetStyleCommand);

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

        getSheetRenderComponent = (unitId: string, viewKey: SHEET_VIEW_KEY): Nullable<RenderComponentType> => {
            const render = get(IRenderManagerService).getRenderById(unitId);

            if (!render) {
                throw new Error('Render not found');
            }

            const { components } = render;

            const renderComponent = components.get(viewKey);

            if (!renderComponent) {
                throw new Error('Render component not found');
            }

            return renderComponent;
        };
    });

    it('Function onBeforeCommandExecute', () => {
        const callback = vi.fn();
        univerAPI.onBeforeCommandExecute(callback);

        univerAPI.executeCommand(SetRangeValuesCommand.id, {
            subUnitId: 'sheet1',
            unitId: 'test',
            range: {
                startRow: 1,
                startColumn: 1,
                endRow: 2,
                endColumn: 2,
            },

            value: [
                [{ v: 1 }, { v: 2 }],
                [{ v: 3 }, { v: 4 }],
            ],
        });

        expect(callback).toHaveBeenCalled();
    });

    it('Function executeCommand', () => {
        univerAPI.executeCommand(SetRangeValuesCommand.id, {
            subUnitId: 'sheet1',
            unitId: 'test',
            range: {
                startRow: 1,
                startColumn: 1,
                endRow: 2,
                endColumn: 2,
            },

            value: [
                [{ v: 1 }, { v: 2 }],
                [{ v: 3 }, { v: 4 }],
            ],
        });

        expect(getValueByPosition(1, 1, 1, 1)).toStrictEqual({
            v: 1,
            t: 2,
        });
        expect(getValueByPosition(1, 2, 1, 2)).toStrictEqual({
            v: 2,
            t: 2,
        });
        expect(getValueByPosition(2, 1, 2, 1)).toStrictEqual({
            v: 3,
            t: 2,
        });
        expect(getValueByPosition(2, 2, 2, 2)).toStrictEqual({
            v: 4,
            t: 2,
        });
    });

    it('Function createSocket', () => {
        expect(() => univerAPI.createSocket('URL')).toThrowError();
    });

    it('Function registerSheetRowHeaderExtension and unregisterSheetRowHeaderExtension', () => {
        const rowHeader = univerAPI.registerSheetRowHeaderExtension('test', new RowHeaderCustomExtension());

        const sheetComponent = getSheetRenderComponent('test', SHEET_VIEW_KEY.ROW) as SheetComponent;

        let rowHeaderExtension = sheetComponent.getExtensionByKey(ROW_UNIQUE_KEY);

        expect(rowHeaderExtension).toBeDefined();

        rowHeader.dispose();

        rowHeaderExtension = sheetComponent.getExtensionByKey(ROW_UNIQUE_KEY);

        expect(rowHeaderExtension).toBeUndefined();
    });

    it('Function registerSheetColumnHeaderExtension and unregisterSheetColumnHeaderExtension', () => {
        const columnHeader = univerAPI.registerSheetColumnHeaderExtension('test', new ColumnHeaderCustomExtension());

        const sheetComponent = getSheetRenderComponent('test', SHEET_VIEW_KEY.COLUMN) as SheetComponent;

        let columnHeaderExtension = sheetComponent.getExtensionByKey(COLUMN_UNIQUE_KEY);

        expect(columnHeaderExtension).toBeDefined();

        columnHeader.dispose();

        columnHeaderExtension = sheetComponent.getExtensionByKey(COLUMN_UNIQUE_KEY);

        expect(columnHeaderExtension).toBeUndefined();
    });

    it('Function registerSheetMainExtension and unregisterSheetMainExtension', () => {
        const main = univerAPI.registerSheetMainExtension('test', new MainCustomExtension());

        const sheetComponent = getSheetRenderComponent('test', SHEET_VIEW_KEY.MAIN) as SheetComponent;

        let mainExtension = sheetComponent.getExtensionByKey(MAIN_UNIQUE_KEY);

        expect(mainExtension).toBeDefined();

        main.dispose();

        mainExtension = sheetComponent.getExtensionByKey(MAIN_UNIQUE_KEY);

        expect(mainExtension).toBeUndefined();
    });
});
