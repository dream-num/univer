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

import { ICommandService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import { DefinedNamesService, IDefinedNamesService } from '@univerjs/engine-formula';
import { IRefSelectionsService, RefSelectionsService, SheetsSelectionsService } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { EditorBridgeService, IEditorBridgeService } from '../../services/editor-bridge.service';
import { createFacadeTestBed } from './create-test-bed';
import '../f-workbook';
import '../f-worksheet';

describe('Test FWorkbook/FWorksheet UI mixin', () => {
    it('workbook and worksheet api basic flows', async () => {
        const testBed = createFacadeTestBed(undefined, [
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [IEditorService, { useClass: EditorService }],
            [DocSelectionManagerService],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
            [SheetsSelectionsService],
        ]);

        const workbook = testBed.univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetCellEditVisibleOperation);

        const startResult = workbook.startEditing();
        expect(startResult).toBe(true);
        expect(workbook.isCellEditing()).toBe(true);

        await workbook.endEditingAsync(true);
        expect(workbook.isCellEditing()).toBe(false);

        await workbook.abortEditingAsync();

        const scrollState = workbook.getScrollStateBySheetId(worksheet.getSheetId());
        expect(scrollState === null || typeof scrollState === 'object').toBe(true);

        expect(workbook.disableSelection()).toBe(workbook);
        expect(workbook.enableSelection()).toBe(workbook);
        expect(workbook.transparentSelection()).toBe(workbook);
        expect(workbook.showSelection()).toBe(workbook);

        expect(typeof worksheet.getZoom()).toBe('number');

        const visibleRange = worksheet.getVisibleRange();
        expect(visibleRange === null || typeof visibleRange === 'object').toBe(true);

        const allViewportRanges = worksheet.getVisibleRangesOfAllViewports();
        expect(allViewportRanges === null || allViewportRanges instanceof Map).toBe(true);

        expect(worksheet.scrollToCell(10, 10, 0)).toBe(worksheet);
        expect(worksheet.getScrollState()).toBeTruthy();

        const onScrollSpy = vi.fn();
        const onScrollDis = worksheet.onScroll(onScrollSpy);
        onScrollDis.dispose();

        const skeleton = worksheet.getSkeleton();
        expect(skeleton == null || typeof skeleton === 'object').toBe(true);
    });
});
