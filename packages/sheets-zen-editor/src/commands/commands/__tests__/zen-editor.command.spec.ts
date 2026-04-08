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

import { DOCS_ZEN_EDITOR_UNIT_ID_KEY, DocumentFlavor, IUniverInstanceService } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { ISidebarService, IZenZoneService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { CancelZenEditCommand, ConfirmZenEditCommand, OpenZenEditorCommand } from '../zen-editor.command';

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

describe('zen-editor commands', () => {
    it('OpenZenEditorCommand should clone edit snapshot into zen editor and clear history', async () => {
        const zenZoneService = { open: vi.fn() };
        const setDocumentData = vi.fn();
        const editor = {
            getDocumentData: () => ({ id: 'zen-doc-origin', documentStyle: {}, body: { dataStream: 'origin' } }),
            focus: vi.fn(),
            setDocumentData,
            clearUndoRedoHistory: vi.fn(),
        };

        const accessor = createAccessor([
            [IZenZoneService, zenZoneService],
            [IEditorService, { getEditor: () => editor }],
            [IEditorBridgeService, {
                getLatestEditCellState: () => ({
                    documentLayoutObject: {
                        documentModel: {
                            getSnapshot: () => ({
                                body: { dataStream: 'new content' },
                                drawings: { d1: {} },
                                drawingsOrder: ['d1'],
                                tableSource: { source: 'table' },
                                settings: { zoomRatio: 2 },
                            }),
                        },
                    },
                }),
            }],
            [IUniverInstanceService, { focusUnit: vi.fn() }],
            [ISidebarService, { visible: false }],
        ]);

        const result = await OpenZenEditorCommand.handler(accessor);

        expect(result).toBe(true);
        expect(zenZoneService.open).toHaveBeenCalled();
        expect(editor.focus).toHaveBeenCalled();
        expect(setDocumentData).toHaveBeenCalledWith(expect.objectContaining({
            id: 'zen-doc-origin',
            body: { dataStream: 'new content' },
            drawings: { d1: {} },
            drawingsOrder: ['d1'],
            tableSource: { source: 'table' },
            settings: { zoomRatio: 2 },
        }), [{ startOffset: 0, endOffset: 0, collapsed: true }]);
        expect(editor.clearUndoRedoHistory).toHaveBeenCalled();
    });

    it('OpenZenEditorCommand should fail when editor or edit snapshot is missing', async () => {
        const noEditorAccessor = createAccessor([
            [IZenZoneService, { open: vi.fn() }],
            [IEditorService, { getEditor: () => null }],
            [IEditorBridgeService, { getLatestEditCellState: () => null }],
            [IUniverInstanceService, { focusUnit: vi.fn() }],
            [ISidebarService, { visible: false }],
        ]);
        await expect(OpenZenEditorCommand.handler(noEditorAccessor)).resolves.toBe(false);

        const noSnapshotAccessor = createAccessor([
            [IZenZoneService, { open: vi.fn() }],
            [IEditorService, { getEditor: () => ({ getDocumentData: () => ({ documentStyle: {} }), focus: vi.fn(), setDocumentData: vi.fn(), clearUndoRedoHistory: vi.fn() }) }],
            [IEditorBridgeService, { getLatestEditCellState: () => ({ documentLayoutObject: { documentModel: { getSnapshot: () => null } } }) }],
            [IUniverInstanceService, { focusUnit: vi.fn() }],
            [ISidebarService, { visible: false }],
        ]);
        await expect(OpenZenEditorCommand.handler(noSnapshotAccessor)).resolves.toBe(false);
    });

    it('CancelZenEditCommand should close zen zone and return to current sheet', async () => {
        const focusUnit = vi.fn();
        const refreshEditCellState = vi.fn();

        const result = await CancelZenEditCommand.handler(createAccessor([
            [IZenZoneService, { close: vi.fn() }],
            [IEditorBridgeService, { refreshEditCellState }],
            [IUniverInstanceService, {
                getCurrentUnitForType: () => ({ getUnitId: () => 'sheet-unit' }),
                focusUnit,
            }],
            [ISidebarService, { visible: false }],
        ]));

        expect(result).toBe(true);
        expect(focusUnit).toHaveBeenCalledWith('sheet-unit');
        expect(refreshEditCellState).toHaveBeenCalled();
    });

    it('CancelZenEditCommand should return false without an active sheet', async () => {
        const result = await CancelZenEditCommand.handler(createAccessor([
            [IZenZoneService, { close: vi.fn() }],
            [IEditorBridgeService, { refreshEditCellState: vi.fn() }],
            [IUniverInstanceService, { getCurrentUnitForType: () => null, focusUnit: vi.fn() }],
            [ISidebarService, { visible: false }],
        ]));

        expect(result).toBe(false);
    });

    it('ConfirmZenEditCommand should submit doc snapshot back to sheet editor', async () => {
        const submitCellData = vi.fn();
        const refreshEditCellState = vi.fn();
        const focusUnit = vi.fn();

        const result = await ConfirmZenEditCommand.handler(createAccessor([
            [IZenZoneService, { close: vi.fn() }],
            [IEditorBridgeService, { refreshEditCellState }],
            [IUniverInstanceService, {
                getCurrentUnitForType: () => ({ getUnitId: () => 'sheet-unit' }),
                focusUnit,
            }],
            [IEditorService, {
                getEditor: (unitId: string) => {
                    if (unitId !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                        return null;
                    }
                    return {
                        getDocumentData: () => ({
                            id: 'doc-1',
                            documentStyle: { documentFlavor: DocumentFlavor.UNSPECIFIED },
                            body: { dataStream: '' },
                        }),
                    };
                },
            }],
            [IRenderManagerService, {
                getRenderById: () => ({
                    with: () => ({ submitCellData }),
                }),
            }],
            [ISidebarService, { visible: false }],
        ]));

        expect(result).toBe(true);
        expect(submitCellData).toHaveBeenCalledTimes(1);
        const submittedModel = submitCellData.mock.calls[0][0];
        expect(submittedModel.getSnapshot().documentStyle.documentFlavor).toBe(DocumentFlavor.UNSPECIFIED);
        expect(focusUnit).toHaveBeenCalledWith('sheet-unit');
        expect(refreshEditCellState).toHaveBeenCalled();
    });

    it('ConfirmZenEditCommand should return false without zen editor instance', async () => {
        const result = await ConfirmZenEditCommand.handler(createAccessor([
            [IZenZoneService, { close: vi.fn() }],
            [IEditorBridgeService, { refreshEditCellState: vi.fn() }],
            [IUniverInstanceService, {
                getCurrentUnitForType: () => ({ getUnitId: () => 'sheet-unit' }),
                focusUnit: vi.fn(),
            }],
            [IEditorService, { getEditor: () => null }],
            [IRenderManagerService, { getRenderById: () => null }],
            [ISidebarService, { visible: false }],
        ]));

        expect(result).toBe(false);
    });
});
