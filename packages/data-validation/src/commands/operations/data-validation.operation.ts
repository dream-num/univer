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
import { ISidebarService } from '@univerjs/ui';
import { DataValidationPanelService } from '../../services/data-validation-panel.service';
import { DataValidationModel } from '../..';

export const DataValidationPanelName = 'DataValidationPanel';

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
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const rule = ruleId ? dataValidationModel.getRuleById(unitId, subUnitId, ruleId) : undefined;
        dataValidationPanelService.open();
        dataValidationPanelService.setActiveRule(rule);
        sidebarService.open({
            header: { title: isAdd ? 'dataValidation.panel.addTitle' : 'dataValidation.panel.title' },
            children: { label: DataValidationPanelName },
            width: 312,
        });
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
