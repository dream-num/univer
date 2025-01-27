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

import type { ICellData, Injector, Nullable } from '@univerjs/core';
import type { LambdaValueObjectObject, PrimitiveValueType } from '@univerjs/engine-formula';
import type {
    ColumnHeaderLayout,
    RenderComponentType,
    RowHeaderLayout,
    SheetComponent,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
} from '@univerjs/engine-render';
import type { FUniver } from '../everything';

import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { RegisterFunctionMutation, SetFormulaCalculationStartMutation } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetRangeValuesCommand, SetRangeValuesMutation, SetStyleCommand } from '@univerjs/sheets';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { SHEET_VIEW_KEY } from '@univerjs/sheets-ui';
import { AddCommentCommand, AddCommentMutation, DeleteCommentCommand, DeleteCommentMutation, DeleteCommentTreeCommand, ResolveCommentMutation, UpdateCommentCommand, UpdateCommentMutation, UpdateCommentRefMutation } from '@univerjs/thread-comment';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';
import { COLUMN_UNIQUE_KEY, ColumnHeaderCustomExtension, MAIN_UNIQUE_KEY, MainCustomExtension, ROW_UNIQUE_KEY, RowHeaderCustomExtension } from './utils/sheet-extension-util';

import '../everything';

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

    let getSheetRenderComponent: (unitId: string, viewKey: SHEET_VIEW_KEY) => Nullable<RenderComponentType>;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(RegisterFunctionMutation);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetFormulaCalculationStartMutation);
        [
            DeleteCommentCommand,
            DeleteCommentTreeCommand,
            UpdateCommentCommand,
            AddCommentCommand,
            AddCommentMutation,
            DeleteCommentMutation,
            ResolveCommentMutation,
            UpdateCommentMutation,
            UpdateCommentRefMutation,
        ].forEach((command) => commandService.registerCommand(command));

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

        vi.useFakeTimers();
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            return setTimeout(callback, 16);
        });
    });

    afterEach(() => {
        (window.requestAnimationFrame as any).mockRestore();
        vi.useRealTimers();
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

    it('Function registerFunction', () => {
        const funcionName = 'CUSTOMSUM';

        const functionsDisposable = univerAPI.registerFunction({
            calculate: [
                [function (...variants) {
                    let sum = 0;

                    const last = variants[variants.length - 1] as LambdaValueObjectObject;

                    if (last.isLambda()) {
                        variants.pop();

                        const variantsList = variants.map((variant) => Array.isArray(variant) ? variant[0][0] : variant) as PrimitiveValueType[];

                        sum += +last.executeCustom(...variantsList).getValue();
                    }

                    for (const variant of variants) {
                        sum += Number(variant) || 0;
                    }

                    return sum;
                }, funcionName, 'Custom sum function'],
            ],
        });

        const descriptionService = get(IDescriptionService);

        const functionInfo = descriptionService.getFunctionInfo(funcionName);

        expect(functionInfo?.functionName).toBe(funcionName);

        functionsDisposable.dispose();

        const functionInfoAfterDispose = descriptionService.getFunctionInfo(funcionName);

        expect(functionInfoAfterDispose).toBeUndefined();
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

    it('Function getSheetBySheetId', () => {
        const worksheet = univerAPI.getActiveWorkbook()?.getSheetBySheetId('sheet1');
        expect(worksheet!.getSheetId()).toBe('sheet1');
    });

    it('Function getMaxColumns', () => {
        const worksheet = univerAPI.getActiveWorkbook()?.getSheetBySheetId('sheet1');
        expect(worksheet!.getMaxColumns()).toBe(100);
    });

    it('Function getMaxRows', () => {
        const worksheet = univerAPI.getActiveWorkbook()?.getSheetBySheetId('sheet1');
        expect(worksheet!.getMaxRows()).toBe(100);
    });

    it('Function getSnapshot', () => {
        const snapshot = univerAPI.getActiveWorkbook()?.save();
        expect(snapshot?.resources).toEqual([
            {
                data: '{}',
                name: 'SHEET_WORKSHEET_PROTECTION_PLUGIN',
            },
            {
                data: '{}',
                name: 'SHEET_WORKSHEET_PROTECTION_POINT_PLUGIN',
            },
            {
                name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
                data: '{"sheet1":[{"cfId":"AEGZdW8C","ranges":[{"startRow":2,"startColumn":1,"endRow":5,"endColumn":5,"startAbsoluteRefType":0,"endAbsoluteRefType":0,"rangeType":0}],"rule":{"type":"highlightCell","subType":"text","operator":"containsText","style":{"cl":{"rgb":"#2f56ef"},"bg":{"rgb":"#e8ecfc"}},"value":""},"stopIfTrue":false},{"cfId":"4ICEXdJj","ranges":[{"startRow":4,"startColumn":1,"endRow":7,"endColumn":7,"startAbsoluteRefType":0,"endAbsoluteRefType":0,"rangeType":0}],"rule":{"type":"highlightCell","subType":"text","operator":"containsText","style":{"cl":{"rgb":"#2f56ef"},"bg":{"rgb":"#e8ecfc"}},"value":""},"stopIfTrue":false},{"cfId":"geCv018z","ranges":[{"startRow":11,"startColumn":1,"endRow":12,"endColumn":5,"startAbsoluteRefType":0,"endAbsoluteRefType":0,"rangeType":0}],"rule":{"type":"highlightCell","subType":"text","operator":"containsText","style":{"cl":{"rgb":"#2f56ef"},"bg":{"rgb":"#e8ecfc"}},"value":""},"stopIfTrue":false}]}',
            },
            {
                data: '{}',
                name: 'SHEET_FILTER_PLUGIN',
            },
            {
                data: '{}',
                name: 'SHEET_DATA_VALIDATION_PLUGIN',
            },
        ]);
    });

    it('Function customizeColumnHeader', () => {
        const unitId = univerAPI.getActiveWorkbook()?.getId() || '';
        const columnRenderComp = getSheetRenderComponent(unitId, SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        if (!columnRenderComp) return;
        const columnHeaderExt = columnRenderComp.extensions.get('DefaultColumnHeaderLayoutExtension')! as ColumnHeaderLayout;

        const spy = vi.spyOn(columnHeaderExt, 'draw');

        univerAPI.customizeColumnHeader({ headerStyle: { backgroundColor: 'pink', fontSize: 9 }, columnsCfg: ['ASC', 'MokaII', undefined, { text: 'Size', textAlign: 'left' }, { text: 'MUJI', fontSize: 15, textAlign: 'right' }, { text: 'SRI-RESOLVE', fontSize: 10, textAlign: 'left', fontColor: 'blue', backgroundColor: 'wheat' }, null, null, 'ss', { fontSize: 29, fontColor: 'red', text: 'hash' }] });
        univerAPI.customizeColumnHeader({ headerStyle: { backgroundColor: 'pink', fontSize: 9 }, columnsCfg: ['ASC', 'MokaII', undefined, { text: 'Size', textAlign: 'left' }, { text: 'MUJI', fontSize: 15, textAlign: 'right' }, { text: 'SRI-RESOLVE', fontSize: 10, textAlign: 'left', fontColor: 'blue', backgroundColor: 'wheat' }, null, null, 'ss', { fontSize: 29, fontColor: 'red', text: 'hash' }] });
        expect(columnHeaderExt.headerStyle.backgroundColor).toBe('pink');
        expect(columnHeaderExt.headerStyle.fontSize).toBe(9);
        expect(columnHeaderExt.headerStyle.borderColor).toBe('rgb(217,217,217)');
        expect(columnHeaderExt.columnsCfg.length).toBe(10);

        vi.advanceTimersByTime(16); // mock time pass by
        expect(spy).toHaveBeenCalled();
    });

    it('Function customizeRowHeader', () => {
        const unitId = univerAPI.getActiveWorkbook()?.getId() || '';
        const rowRenderComp = getSheetRenderComponent(unitId, SHEET_VIEW_KEY.ROW) as SpreadsheetRowHeader;
        if (!rowRenderComp) return;
        const rowHeaderExt = rowRenderComp.extensions.get('DefaultRowHeaderLayoutExtension')! as RowHeaderLayout;

        const spy = vi.spyOn(rowHeaderExt, 'draw');

        univerAPI.customizeRowHeader({ headerStyle: { backgroundColor: 'pink', fontSize: 9 }, rowsCfg: ['ASC', 'MokaII', undefined, { text: 'Size', textAlign: 'left' }, { text: 'MUJI', fontSize: 15, textAlign: 'right' }, { text: 'SRI-RESOLVE', fontSize: 10, textAlign: 'left', fontColor: 'blue', backgroundColor: 'wheat' }, null, null, 'ss', { fontSize: 29, fontColor: 'red', text: 'hash' }] });
        univerAPI.customizeRowHeader({ headerStyle: { backgroundColor: 'pink', fontSize: 9 }, rowsCfg: ['ASC', 'MokaII', undefined, { text: 'Size', textAlign: 'left' }, { text: 'MUJI', fontSize: 15, textAlign: 'right' }, { text: 'SRI-RESOLVE', fontSize: 10, textAlign: 'left', fontColor: 'blue', backgroundColor: 'wheat' }, null, null, 'ss', { fontSize: 29, fontColor: 'red', text: 'hash' }] });
        expect(rowHeaderExt.headerStyle.backgroundColor).toBe('pink');
        expect(rowHeaderExt.headerStyle.fontSize).toBe(9);
        expect(rowHeaderExt.headerStyle.borderColor).toBe('rgb(217,217,217)');
        expect(rowHeaderExt.rowsCfg.length).toBe(10);

        vi.advanceTimersByTime(16); // mock time pass by
        expect(spy).toHaveBeenCalled();
    });

    it('Add Comment', async () => {
        const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
        if (!worksheet) {
            return;
        }

        const range = worksheet.getRange(1, 1, 1, 1);
        await range.addComment({
            dataStream: 'test\r\n',
        });

        const comment = range.getComment()!;
        expect(comment).toBeTruthy();
        expect(comment.getContent().dataStream).toBe('test\r\n');
        expect(worksheet.getComments().length).toBe(1);

        await range.addComment({
            dataStream: 'reply\r\n',
        });
        const newComment = range.getComment()!;
        expect(newComment).toBeTruthy();
        expect(newComment.getContent().dataStream).toBe('test\r\n');
        expect(newComment.getReplies()?.length).toBe(1);

        await newComment.update({
            dataStream: 'test updated\r\n',
        });
        // expect(worksheet.getComments()).toBe([]);
        expect(newComment.getContent().dataStream).toBe('test updated\r\n');
        expect(range.getComment()?.getContent().dataStream).toBe('test updated\r\n');

        await newComment.delete();
        expect(worksheet.getComments().length).toBe(0);
        expect(range.getComment()).toBeNull();
    });

    it('Function registerFunction should handle function', () => {
        const functionName = 'CUSTOMFUNC';
        const functionsDisposable = univerAPI.getFormula().registerFunction(functionName, () => {
            return 42;
        }, 'Custom function');

        const descriptionService = get(IDescriptionService);
        const functionInfo = descriptionService.getFunctionInfo(functionName);

        expect(functionInfo?.functionName).toBe(functionName);

        functionsDisposable.dispose();

        const functionInfoAfterDispose = descriptionService.getFunctionInfo(functionName);
        expect(functionInfoAfterDispose).toBeUndefined();
    });

    it('Function registerFunction should handle async array function', () => {
        const functionName = 'ASYNCARRAY';
        const functionsDisposable = univerAPI.getFormula().registerAsyncFunction(functionName, async () => {
            return [[1, 2], [3, 4]];
        }, 'Async array function');

        const descriptionService = get(IDescriptionService);
        const functionInfo = descriptionService.getFunctionInfo(functionName);

        expect(functionInfo?.functionName).toBe(functionName);

        functionsDisposable.dispose();

        const functionInfoAfterDispose = descriptionService.getFunctionInfo(functionName);
        expect(functionInfoAfterDispose).toBeUndefined();
    });
});
