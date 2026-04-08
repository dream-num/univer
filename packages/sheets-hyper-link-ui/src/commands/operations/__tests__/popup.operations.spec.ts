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

import type { IOpenHyperLinkEditPanelOperationParams } from '../popup.operations';
import { DOCS_ZEN_EDITOR_UNIT_ID_KEY, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';
import { SheetsHyperLinkPopupService } from '../../../services/popup.service';
import { HyperLinkEditSourceType } from '../../../types/enums/edit-source';
import {
    CloseHyperLinkPopupOperation,
    InsertHyperLinkOperation,
    InsertHyperLinkToolbarOperation,
    OpenHyperLinkEditPanelOperation,
} from '../popup.operations';

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
        has(token: unknown) {
            return map.has(token);
        },
    } as never;
}

function createWorksheet(cell: Record<string, unknown> | null = null) {
    return {
        getSheetId: () => 's1',
        getUnitId: () => 'u1',
        getCell: vi.fn(() => cell),
    };
}

function createWorkbook(worksheet: ReturnType<typeof createWorksheet>) {
    return {
        getUnitId: () => 'u1',
        getActiveSheet: () => worksheet,
        getSheetBySheetId: () => worksheet,
    };
}

function createUniverInstanceService(options?: {
    workbook?: ReturnType<typeof createWorkbook> | null;
    focusedUnitId?: string;
}) {
    return {
        getCurrentUnitOfType: () => options?.workbook ?? null,
        getCurrentUnitForType: () => options?.workbook ?? null,
        getFocusedUnit: () => options?.focusedUnitId ? { getUnitId: () => options.focusedUnitId } : null,
    };
}

describe('hyper-link popup operations', () => {
    it('starts add and edit flows through the popup service', () => {
        const startAddEditing = vi.fn();
        const startEditing = vi.fn();
        const popupService = { startAddEditing, startEditing };
        const accessor = createAccessor([[SheetsHyperLinkPopupService, popupService]]);
        const startAddParams: IOpenHyperLinkEditPanelOperationParams = {
            unitId: 'u1',
            subUnitId: 's1',
            row: 1,
            col: 2,
            type: HyperLinkEditSourceType.VIEWING,
        };
        const startEditParams: IOpenHyperLinkEditPanelOperationParams = {
            ...startAddParams,
            customRangeId: 'range-1',
            type: HyperLinkEditSourceType.EDITING,
        };

        expect(OpenHyperLinkEditPanelOperation.handler(accessor, undefined)).toBe(false);
        expect(OpenHyperLinkEditPanelOperation.handler(accessor, startAddParams)).toBe(true);
        expect(OpenHyperLinkEditPanelOperation.handler(accessor, startEditParams)).toBe(true);

        expect(startAddEditing).toHaveBeenCalledTimes(1);
        expect(startEditing).toHaveBeenCalledTimes(1);
    });

    it('closes the popup edit session', () => {
        const endEditing = vi.fn();
        const accessor = createAccessor([[SheetsHyperLinkPopupService, { endEditing }]]);

        expect(CloseHyperLinkPopupOperation.handler(accessor)).toBe(true);
        expect(endEditing).toHaveBeenCalledTimes(1);
    });

    it('derives the correct edit source from the current sheet selection state', () => {
        const executeCommand = vi.fn(() => true);
        const worksheet = createWorksheet();
        const workbook = createWorkbook(worksheet);

        const createInsertAccessor = (visible: boolean, focusedUnitId?: string, hasSelection = true, activeWorkbook: ReturnType<typeof createWorkbook> | null = workbook) => createAccessor([
            [IUniverInstanceService, createUniverInstanceService({ workbook: activeWorkbook, focusedUnitId })],
            [ICommandService, { executeCommand }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => (hasSelection ? { range: { startRow: 3, startColumn: 4 } } : null) }],
            [IEditorBridgeService, { isVisible: () => ({ visible }) }],
        ]);

        expect(InsertHyperLinkOperation.handler(createInsertAccessor(false))).toBe(true);
        expect(InsertHyperLinkOperation.handler(createInsertAccessor(true))).toBe(true);
        expect(InsertHyperLinkOperation.handler(createInsertAccessor(false, DOCS_ZEN_EDITOR_UNIT_ID_KEY))).toBe(true);

        expect(executeCommand).toHaveBeenNthCalledWith(1, OpenHyperLinkEditPanelOperation.id, expect.objectContaining({ type: HyperLinkEditSourceType.VIEWING }));
        expect(executeCommand).toHaveBeenNthCalledWith(2, OpenHyperLinkEditPanelOperation.id, expect.objectContaining({ type: HyperLinkEditSourceType.EDITING }));
        expect(executeCommand).toHaveBeenNthCalledWith(3, OpenHyperLinkEditPanelOperation.id, expect.objectContaining({ type: HyperLinkEditSourceType.ZEN_EDITOR }));

        expect(InsertHyperLinkOperation.handler(createInsertAccessor(false, undefined, true, null))).toBe(false);

        expect(InsertHyperLinkOperation.handler(createInsertAccessor(false, undefined, false))).toBe(false);
    });

    it('respects disabled cells and toggles between insert and close commands from the toolbar', () => {
        const executeCommand = vi.fn(() => true);
        const disabledWorksheet = createWorksheet({ f: '=A1' });
        const enabledWorksheet = createWorksheet({ v: 'cell' });

        expect(InsertHyperLinkToolbarOperation.handler(createAccessor([
            [IUniverInstanceService, createUniverInstanceService({ workbook: createWorkbook(disabledWorksheet) })],
            [SheetsSelectionsService, { getCurrentSelections: () => [{ range: { startRow: 1, startColumn: 1 } }] }],
            [ICommandService, { executeCommand }],
            [SheetsHyperLinkPopupService, { currentEditing: null }],
        ]))).toBe(false);

        expect(InsertHyperLinkToolbarOperation.handler(createAccessor([
            [IUniverInstanceService, createUniverInstanceService({ workbook: createWorkbook(enabledWorksheet) })],
            [SheetsSelectionsService, { getCurrentSelections: () => [{ range: { startRow: 1, startColumn: 1 } }] }],
            [ICommandService, { executeCommand }],
            [SheetsHyperLinkPopupService, { currentEditing: { row: 1 } }],
        ]))).toBe(true);
        expect(InsertHyperLinkToolbarOperation.handler(createAccessor([
            [IUniverInstanceService, createUniverInstanceService({ workbook: createWorkbook(enabledWorksheet) })],
            [SheetsSelectionsService, { getCurrentSelections: () => [{ range: { startRow: 1, startColumn: 1 } }] }],
            [ICommandService, { executeCommand }],
            [SheetsHyperLinkPopupService, { currentEditing: null }],
        ]))).toBe(true);

        expect(executeCommand).toHaveBeenCalledWith(CloseHyperLinkPopupOperation.id);
        expect(executeCommand).toHaveBeenCalledWith(InsertHyperLinkOperation.id);
    });
});
