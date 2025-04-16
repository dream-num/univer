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

import { CommandType, type ICommand, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { ISidebarService } from '@univerjs/ui';
import { DataValidationPanelService } from '../../services/data-validation-panel.service';
import { DataValidationDropdownManagerService } from '../../services/dropdown-manager.service';

export const DATA_VALIDATION_PANEL = 'DataValidationPanel';

export interface IOpenValidationPanelOperationParams {
    ruleId?: string;
    isAdd?: boolean;
}

export const OpenValidationPanelOperation: ICommand<IOpenValidationPanelOperationParams> = {
    id: 'data-validation.operation.open-validation-panel',
    type: CommandType.OPERATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { ruleId, isAdd } = params;
        const dataValidationPanelService = accessor.get(DataValidationPanelService);
        const dataValidationModel = accessor.get(DataValidationModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sidebarService = accessor.get(ISidebarService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const rule = ruleId ? dataValidationModel.getRuleById(unitId, subUnitId, ruleId) : undefined;
        dataValidationPanelService.open();
        dataValidationPanelService.setActiveRule(rule && {
            unitId,
            subUnitId,
            rule,
        });

        const disposable = sidebarService.open({
            id: DATA_VALIDATION_PANEL,
            header: { title: isAdd ? 'dataValidation.panel.addTitle' : 'dataValidation.panel.title' },
            children: { label: DATA_VALIDATION_PANEL },
            width: 312,
            onClose: () => dataValidationPanelService.close(),
        });

        dataValidationPanelService.setCloseDisposable(disposable);

        return true;
    },
};

export const CloseValidationPanelOperation: ICommand = {
    id: 'data-validation.operation.close-validation-panel',
    type: CommandType.OPERATION,
    handler(accessor) {
        const dataValidationPanelService = accessor.get(DataValidationPanelService);
        dataValidationPanelService.close();
        return true;
    },
};

export const ToggleValidationPanelOperation: ICommand = {
    id: 'data-validation.operation.toggle-validation-panel',
    type: CommandType.OPERATION,
    handler(accessor) {
        const commandService = accessor.get(ICommandService);
        const dataValidationPanelService = accessor.get(DataValidationPanelService);
        dataValidationPanelService.open();
        const isOpen = dataValidationPanelService.isOpen;

        if (isOpen) {
            commandService.executeCommand(CloseValidationPanelOperation.id);
        } else {
            commandService.executeCommand(OpenValidationPanelOperation.id);
        }
        return true;
    },
};

export interface IShowDataValidationDropdownParams {
    unitId: string;
    subUnitId: string;
    row: number;
    column: number;
}

export const ShowDataValidationDropdown: ICommand<IShowDataValidationDropdownParams> = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.show-data-validation-dropdown',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const dataValidationDropdownManagerService = accessor.get(DataValidationDropdownManagerService);
        const { unitId, subUnitId, row, column } = params;
        const activeDropdown = dataValidationDropdownManagerService.activeDropdown;
        const currLoc = activeDropdown?.location;
        if (
            currLoc &&
            currLoc.unitId === unitId &&
            currLoc.subUnitId === subUnitId &&
            currLoc.row === row &&
            currLoc.col === column
        ) {
            return true;
        }

        dataValidationDropdownManagerService.showDataValidationDropdown(
            unitId,
            subUnitId,
            row,
            column
        );
        return true;
    },
};

export const HideDataValidationDropdown: ICommand = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.hide-data-validation-dropdown',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const dataValidationDropdownManagerService = accessor.get(DataValidationDropdownManagerService);
        dataValidationDropdownManagerService.hideDropdown();
        return true;
    },
};
