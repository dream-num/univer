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

import { CommandType, type ICommand, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget, type ISheetCommandSharedParams, SelectionManagerService } from '@univerjs/sheets';
import { HyperLinkModel } from '@univerjs/sheets-hyper-link';
import { ISidebarService } from '@univerjs/ui';
import { CellLinkEdit } from '../../views/CellLinkEdit';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';

export interface IOpenHyperLinkSidebarOperationParams extends ISheetCommandSharedParams {
    row: number;
    column: number;
}

export const OpenHyperLinkSidebarOperation: ICommand<IOpenHyperLinkSidebarOperationParams> = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.open-hyper-link-sidebar',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const { unitId, subUnitId, row, column } = params;
        const hyperLinkModel = accessor.get(HyperLinkModel);
        const sidebarService = accessor.get(ISidebarService);
        const popupService = accessor.get(SheetsHyperLinkPopupService);
        const currentLink = hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, column);
        popupService.startEditing(params);

        sidebarService.open({
            header: {
                title: !currentLink ? 'hyperLink.form.addTitle' : 'hyperLink.form.editTitle',
            },
            children: {
                label: CellLinkEdit.componentKey,
            },
        });

        return true;
    },
};

export const CloseHyperLinkSidebarOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.close-hyper-link-sidebar',
    handler(accessor) {
        const sidebarService = accessor.get(ISidebarService);
        const popupService = accessor.get(SheetsHyperLinkPopupService);

        sidebarService.close();
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
        if (!target) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selection = selectionManagerService.getFirst();
        if (!selection?.primary) {
            return false;
        }
        const row = selection.primary.startRow;
        const column = selection.primary.startColumn;
        return commandService.executeCommand(OpenHyperLinkSidebarOperation.id, {
            unitId: target.unitId,
            subUnitId: target.subUnitId,
            row,
            column,
        });
    },
};

export const InsertHyperLinkToolbarOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.insert-hyper-link-toolbar',
    handler(accessor) {
        const commandService = accessor.get(ICommandService);
        const popupService = accessor.get(SheetsHyperLinkPopupService);
        if (popupService.currentEditing) {
            return commandService.executeCommand(CloseHyperLinkSidebarOperation.id);
        } else {
            return commandService.executeCommand(InsertHyperLinkOperation.id);
        }
    },
};
