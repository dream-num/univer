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

/* eslint-disable ts/no-explicit-any */

import { DOCS_ZEN_EDITOR_UNIT_ID_KEY, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';
import { SheetsHyperLinkPopupService } from '../../../services/popup.service';
import { HyperLinkEditSourceType } from '../../../types/enums/edit-source';
import { CloseHyperLinkPopupOperation, InsertHyperLinkOperation, InsertHyperLinkToolbarOperation, OpenHyperLinkEditPanelOperation } from '../popup.operations';

const mocks = vi.hoisted(() => ({
    getSheetCommandTarget: vi.fn(),
    getShouldDisableCurrentCellLink: vi.fn(),
}));

vi.mock('@univerjs/sheets', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/sheets')>('@univerjs/sheets');
    return {
        ...actual,
        getSheetCommandTarget: mocks.getSheetCommandTarget,
    };
});

vi.mock('../../../utils', async () => {
    const actual = await vi.importActual<typeof import('../../../utils')>('../../../utils');
    return {
        ...actual,
        getShouldDisableCurrentCellLink: mocks.getShouldDisableCurrentCellLink,
    };
});

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
    } as any;
}

describe('hyper-link popup operations', () => {
    it('should start add/edit flows through the popup service', () => {
        const startAddEditing = vi.fn();
        const startEditing = vi.fn();
        const popupService = { startAddEditing, startEditing };
        const accessor = createAccessor([[SheetsHyperLinkPopupService, popupService]]);

        expect(OpenHyperLinkEditPanelOperation.handler(accessor, undefined as any)).toBe(false);
        expect(OpenHyperLinkEditPanelOperation.handler(accessor, { unitId: 'u1', subUnitId: 's1', row: 1, col: 2, type: HyperLinkEditSourceType.VIEWING } as any)).toBe(true);
        expect(OpenHyperLinkEditPanelOperation.handler(accessor, { unitId: 'u1', subUnitId: 's1', row: 1, col: 2, customRangeId: 'range-1', type: HyperLinkEditSourceType.EDITING } as any)).toBe(true);

        expect(startAddEditing).toHaveBeenCalledTimes(1);
        expect(startEditing).toHaveBeenCalledTimes(1);
    });

    it('should close the popup edit session', () => {
        const endEditing = vi.fn();
        const accessor = createAccessor([[SheetsHyperLinkPopupService, { endEditing }]]);

        expect(CloseHyperLinkPopupOperation.handler(accessor)).toBe(true);
        expect(endEditing).toHaveBeenCalledTimes(1);
    });

    it('should derive the correct edit source from current sheet selection state', () => {
        mocks.getSheetCommandTarget.mockReturnValue({ unitId: 'u1', subUnitId: 's1' });
        const executeCommand = vi.fn(() => true);

        const createInsertAccessor = (visible: boolean, focusedUnitId?: string) => createAccessor([
            [IUniverInstanceService, { getFocusedUnit: () => (focusedUnitId ? { getUnitId: () => focusedUnitId } : null) }],
            [ICommandService, { executeCommand }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => ({ range: { startRow: 3, startColumn: 4 } }) }],
            [IEditorBridgeService, { isVisible: () => ({ visible }) }],
        ]);

        expect(InsertHyperLinkOperation.handler(createInsertAccessor(false))).toBe(true);
        expect(InsertHyperLinkOperation.handler(createInsertAccessor(true))).toBe(true);
        expect(InsertHyperLinkOperation.handler(createInsertAccessor(false, DOCS_ZEN_EDITOR_UNIT_ID_KEY))).toBe(true);

        expect(executeCommand).toHaveBeenNthCalledWith(1, OpenHyperLinkEditPanelOperation.id, expect.objectContaining({ type: HyperLinkEditSourceType.VIEWING }));
        expect(executeCommand).toHaveBeenNthCalledWith(2, OpenHyperLinkEditPanelOperation.id, expect.objectContaining({ type: HyperLinkEditSourceType.EDITING }));
        expect(executeCommand).toHaveBeenNthCalledWith(3, OpenHyperLinkEditPanelOperation.id, expect.objectContaining({ type: HyperLinkEditSourceType.ZEN_EDITOR }));

        mocks.getSheetCommandTarget.mockReturnValueOnce(null);
        expect(InsertHyperLinkOperation.handler(createInsertAccessor(false))).toBe(false);

        mocks.getSheetCommandTarget.mockReturnValueOnce({ unitId: 'u1', subUnitId: 's1' });
        expect(InsertHyperLinkOperation.handler(createAccessor([
            [IUniverInstanceService, { getFocusedUnit: () => null }],
            [ICommandService, { executeCommand }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => null }],
            [IEditorBridgeService, { isVisible: () => ({ visible: false }) }],
        ]))).toBe(false);
    });

    it('should respect disabled cells and toggle between insert/close commands from the toolbar', () => {
        const executeCommand = vi.fn(() => true);

        mocks.getShouldDisableCurrentCellLink.mockReturnValueOnce(true);
        expect(InsertHyperLinkToolbarOperation.handler(createAccessor([
            [ICommandService, { executeCommand }],
            [SheetsHyperLinkPopupService, { currentEditing: null }],
        ]))).toBe(false);

        mocks.getShouldDisableCurrentCellLink.mockReturnValue(false);
        expect(InsertHyperLinkToolbarOperation.handler(createAccessor([
            [ICommandService, { executeCommand }],
            [SheetsHyperLinkPopupService, { currentEditing: { row: 1 } }],
        ]))).toBe(true);
        expect(InsertHyperLinkToolbarOperation.handler(createAccessor([
            [ICommandService, { executeCommand }],
            [SheetsHyperLinkPopupService, { currentEditing: null }],
        ]))).toBe(true);

        expect(executeCommand).toHaveBeenCalledWith(CloseHyperLinkPopupOperation.id);
        expect(executeCommand).toHaveBeenCalledWith(InsertHyperLinkOperation.id);
    });
});
