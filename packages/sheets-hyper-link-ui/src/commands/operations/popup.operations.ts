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

import { CommandType, DOCS_ZEN_EDITOR_UNIT_ID_KEY, type ICommand, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget, type ISheetCommandSharedParams, SheetsSelectionsService } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';
import { getShouldDisableCurrentCellLink } from '../../utils';

export interface IOpenHyperLinkEditPanelOperationParams extends ISheetCommandSharedParams {
    row: number;
    col: number;
    customRangeId?: string;
    type: HyperLinkEditSourceType;
}

export const OpenHyperLinkEditPanelOperation: ICommand<IOpenHyperLinkEditPanelOperationParams> = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.open-hyper-link-edit-panel',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const popupService = accessor.get(SheetsHyperLinkPopupService);
        if (!params.customRangeId) {
            popupService.startAddEditing(params);
        } else {
            popupService.startEditing(params as Required<IOpenHyperLinkEditPanelOperationParams>);
        }
        return true;
    },
};

export const CloseHyperLinkPopupOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.close-hyper-link-popup',
    handler(accessor) {
        const popupService = accessor.get(SheetsHyperLinkPopupService);

        popupService.endEditing();
        return true;
    },
};

export const InsertHyperLinkOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.insert-hyper-link',
    handler(accessor) {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        const editorBridgeService = accessor.get(IEditorBridgeService);
        if (!target) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selection = selectionManagerService.getCurrentLastSelection();
        if (!selection) {
            return false;
        }

        const row = selection.range.startRow;
        const col = selection.range.startColumn;
        const visible = editorBridgeService.isVisible();
        const isZenEditor = univerInstanceService.getFocusedUnit()?.getUnitId() === DOCS_ZEN_EDITOR_UNIT_ID_KEY;
        return commandService.executeCommand(OpenHyperLinkEditPanelOperation.id, {
            unitId: target.unitId,
            subUnitId: target.subUnitId,
            row,
            col,
            type: isZenEditor ?
                HyperLinkEditSourceType.ZEN_EDITOR
                : visible.visible ? HyperLinkEditSourceType.EDITING : HyperLinkEditSourceType.VIEWING,
        });
    },
};

export const InsertHyperLinkToolbarOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.insert-hyper-link-toolbar',
    handler(accessor) {
        if (getShouldDisableCurrentCellLink(accessor)) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const popupService = accessor.get(SheetsHyperLinkPopupService);
        if (popupService.currentEditing) {
            return commandService.executeCommand(CloseHyperLinkPopupOperation.id);
        } else {
            return commandService.executeCommand(InsertHyperLinkOperation.id);
        }
    },
};
