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

import type { ICommand, Workbook } from '@univerjs/core';
import { CommandType, delayAnimationFrame, DOCS_ZEN_EDITOR_UNIT_ID_KEY, DocumentDataModel, DocumentFlavor, IUniverInstanceService, Tools, UniverInstanceType } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { EditingRenderController, IEditorBridgeService } from '@univerjs/sheets-ui';
import { ISidebarService, IZenZoneService } from '@univerjs/ui';

export const OpenZenEditorCommand: ICommand = {
    id: 'zen-editor.command.open-zen-editor',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const zenZoneService = accessor.get(IZenZoneService);
        const editorService = accessor.get(IEditorService);
        const editorBridgeService = accessor.get(IEditorBridgeService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sideBarService = accessor.get(ISidebarService);

        if (sideBarService.visible) {
            sideBarService.close();
            await delayAnimationFrame();
        }

        zenZoneService.open();

        const editor = editorService.getEditor(DOCS_ZEN_EDITOR_UNIT_ID_KEY);

        if (editor == null) {
            return false;
        }
        const editCellState = editorBridgeService.getLatestEditCellState();

        if (editCellState == null) {
            return false;
        }

        const snapshot = editCellState.documentLayoutObject.documentModel?.getSnapshot();

        if (snapshot == null) {
            return false;
        }

        univerInstanceService.focusUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY);

        const { body, drawings, drawingsOrder, tableSource, settings } = Tools.deepClone(snapshot);

        const originSnapshot = editor.getDocumentData();

        const newSnapshot = {
            ...originSnapshot,
            body,
            drawings,
            drawingsOrder,
            tableSource,
            settings,
        };

        const textRanges = [
            {
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
            },
        ];
        editor.focus();
        editor.setDocumentData(newSnapshot, textRanges);
        // Need to clear undo/redo service when open zen mode.
        editor.clearUndoRedoHistory();

        return true;
    },
};

export const CancelZenEditCommand: ICommand = {
    id: 'zen-editor.command.cancel-zen-edit',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const zenZoneEditorService = accessor.get(IZenZoneService);
        const editorBridgeService = accessor.get(IEditorBridgeService);
        const univerInstanceManager = accessor.get(IUniverInstanceService);
        const sideBarService = accessor.get(ISidebarService);

        if (sideBarService.visible) {
            sideBarService.close();
            await delayAnimationFrame();
        }
        zenZoneEditorService.close();

        const currentSheetInstance = univerInstanceManager.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (currentSheetInstance) {
            univerInstanceManager.focusUnit(currentSheetInstance.getUnitId());
            editorBridgeService.refreshEditCellState();

            return true;
        }

        return false;
    },
};

export const ConfirmZenEditCommand: ICommand = {
    id: 'zen-editor.command.confirm-zen-edit',

    type: CommandType.COMMAND,

    handler: async (accessor) => {
        const zenZoneEditorService = accessor.get(IZenZoneService);
        const editorBridgeService = accessor.get(IEditorBridgeService);
        const univerInstanceManager = accessor.get(IUniverInstanceService);
        const editorService = accessor.get(IEditorService);
        const sideBarService = accessor.get(ISidebarService);

        if (sideBarService.visible) {
            sideBarService.close();
            await delayAnimationFrame();
        }
        zenZoneEditorService.close();

        const editor = editorService.getEditor(DOCS_ZEN_EDITOR_UNIT_ID_KEY);

        if (editor == null) {
            return false;
        }

        const renderManagerService = accessor.get(IRenderManagerService);

        const currentSheetInstance = univerInstanceManager.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (currentSheetInstance) {
            const currentSheetId = currentSheetInstance.getUnitId();

            const editingRenderController = renderManagerService.getRenderById(currentSheetId)?.with(EditingRenderController);

            if (editingRenderController) {
                const snapshot = Tools.deepClone(editor.getDocumentData());
                // Maybe we need a third Document flavor for sheet editor?
                snapshot.documentStyle.documentFlavor = DocumentFlavor.UNSPECIFIED;
                editingRenderController.submitCellData(new DocumentDataModel(snapshot));
            }

            univerInstanceManager.focusUnit(currentSheetInstance.getUnitId());
            editorBridgeService.refreshEditCellState();
            return true;
        }

        return false;
    },
};
