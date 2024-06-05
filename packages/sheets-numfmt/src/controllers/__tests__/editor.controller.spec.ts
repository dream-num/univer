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

import type { ICellDataForSheetInterceptor, Workbook, Worksheet } from '@univerjs/core';
import { createInterceptorKey, ICommandService, InterceptorManager, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { ISetNumfmtMutationParams, ISheetLocation } from '@univerjs/sheets';
import { SetNumfmtMutation } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { beforeEach, describe, expect, it } from 'vitest';

import { SheetsNumfmtCellContentController } from '../numfmt.cell-content.controller';
import { NumfmtEditorController } from '../numfmt.editor.controller';
import { createTestBed } from './test.util';

const BEFORE_CELL_EDIT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation>('BEFORE_CELL_EDIT');
const AFTER_CELL_EDIT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation>('AFTER_CELL_EDIT');
class MockEditorBridgeService {
    interceptor = new InterceptorManager({
        BEFORE_CELL_EDIT,
        AFTER_CELL_EDIT,
    });
}
describe('test editor', () => {
    let unitId: string = '';
    let subUnitId: string = '';
    let workbook: Workbook;
    let worksheet: Worksheet;
    let testBed: ReturnType<typeof createTestBed>;
    let commandService: ICommandService;

    beforeEach(() => {
        testBed = createTestBed([
            [NumfmtEditorController],
            [SheetsNumfmtCellContentController],
            [IEditorBridgeService, { useClass: MockEditorBridgeService }],
        ]);
        unitId = testBed.unitId;
        subUnitId = testBed.subUnitId;
        commandService = testBed.get(ICommandService);
        const univerInstanceService = testBed.get(IUniverInstanceService);
        testBed.get(NumfmtEditorController);
        testBed.get(SheetsNumfmtCellContentController);
        workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        worksheet = workbook.getActiveSheet();
    });

    it('before edit with currency', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                },
            },
            refMap: {
                1: {
                    pattern: '$#,##0;(#,##0)',
                },
            },
        };
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const editorBridgeService = testBed.get(IEditorBridgeService);
        const location = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            row: 0,
            col: 0,
        };
        const cellData = worksheet.getCell(0, 0);
        expect(cellData!.v).toEqual('$0');
        expect(cellData!.t).toEqual(2);

        const result = editorBridgeService.interceptor.fetchThroughInterceptors(
            editorBridgeService.interceptor.getInterceptPoints().BEFORE_CELL_EDIT
        )(cellData, location);
        // The currency  format needs to be entered in the editor with real values, not with currency symbols
        expect(result!.v).toEqual(0);
        expect(result!.t).toEqual(2);
    });
    it('before edit with data', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                },
            },
            refMap: {
                1: {
                    pattern: 'A/P h:mm:ss',
                },
            },
        };
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const editorBridgeService = testBed.get(IEditorBridgeService);
        const location = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            row: 0,
            col: 0,
        };
        const cellData = worksheet.getCell(0, 0);
        const result = editorBridgeService.interceptor.fetchThroughInterceptors(
            editorBridgeService.interceptor.getInterceptPoints().BEFORE_CELL_EDIT
        )(cellData, location);
        // The data format needs to be entered in the editor with data string, not with real values
        expect(result!.v).toEqual(cellData!.v);
    });
    it('after edit with data', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                },
            },
            refMap: {
                1: {
                    pattern: 'h:mm:ss',
                },
            },
        };
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const editorBridgeService = testBed.get(IEditorBridgeService);
        const location = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            row: 0,
            col: 0,
        };
        const cellData = { v: '12:33:22', t: 2 };
        const result = editorBridgeService.interceptor.fetchThroughInterceptors(
            editorBridgeService.interceptor.getInterceptPoints().AFTER_CELL_EDIT
        )(cellData, location);
        // The date-time drop is a numeric value, not a literal string
        expect(result?.v).toBe(0.5231712962962963);
    });
});
