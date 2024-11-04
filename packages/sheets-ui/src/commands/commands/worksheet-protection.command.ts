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

import type { ICommand, Workbook } from '@univerjs/core';
import type { IWorksheetProtectionRule } from '@univerjs/sheets';

import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';

import { UniverType } from '@univerjs/protocol';
import { AddWorksheetProtectionMutation, DeleteWorksheetProtectionMutation, SetWorksheetProtectionMutation, WorksheetProtectionRuleModel } from '@univerjs/sheets';

export interface IAddWorksheetProtectionParams {
    unitId: string;
    rule: IWorksheetProtectionRule;
}

export interface IDeleteWorksheetProtectionParams {
    unitId: string;
    subUnitId: string;
    rule: IWorksheetProtectionRule;
}

export interface ISetWorksheetProtectionParams {
    permissionId: string;
    rule: IWorksheetProtectionRule;
    oldRule: IWorksheetProtectionRule;
}

export const AddWorksheetProtectionCommand: ICommand<IAddWorksheetProtectionParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-protection',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { rule, unitId } = params;
        const subUnitId = rule.subUnitId;

        const result = await commandService.executeCommand(AddWorksheetProtectionMutation.id, {
            unitId,
            rule,
            subUnitId: rule.subUnitId,
        });

        if (result) {
            const redoMutations = [{ id: AddWorksheetProtectionMutation.id, params: { unitId, rule, subUnitId: rule.subUnitId } }];
            const undoMutations = [{ id: DeleteWorksheetProtectionMutation.id, params: { unitId, subUnitId } }];
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations,
                undoMutations,
            });
        }

        return true;
    },
};

export const DeleteWorksheetProtectionCommand: ICommand<IDeleteWorksheetProtectionParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-worksheet-protection',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { rule, unitId, subUnitId } = params;

        commandService.executeCommand(DeleteWorksheetProtectionMutation.id, {
            unitId,
            subUnitId,
        });

        const redoMutations = [{ id: DeleteWorksheetProtectionMutation.id, params: { unitId, subUnitId } }];
        const undoMutations = [{ id: AddWorksheetProtectionMutation.id, params: { unitId, rule, subUnitId } }];
        undoRedoService.pushUndoRedo({
            unitID: unitId,
            redoMutations,
            undoMutations,
        });

        return true;
    },
};

export const SetWorksheetProtectionCommand: ICommand<ISetWorksheetProtectionParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-protection',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { rule, permissionId, oldRule } = params;
        const { unitId, subUnitId } = rule;

        const newRule = { ...rule, permissionId };

        const result = await commandService.executeCommand(SetWorksheetProtectionMutation.id, {
            unitId,
            subUnitId,
            newRule,
        });

        if (result) {
            const redoMutations = [{ id: SetWorksheetProtectionMutation.id, params: { unitId, subUnitId, newRule } }];
            const undoMutations = [{ id: SetWorksheetProtectionMutation.id, params: { unitId, subUnitId, rule: oldRule } }];
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations,
                undoMutations,
            });
        }

        return true;
    },
};

export const DeleteWorksheetProtectionFormSheetBarCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-worksheet-protection-from-sheet-bar',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverType.UNIVER_SHEET)!;
        const worksheet = workbook?.getActiveSheet();
        const unitId = workbook.getUnitId();

        if (!worksheet) {
            return false;
        }

        const subUnitId = worksheet.getSheetId();

        const rule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);

        const result = await commandService.executeCommand(DeleteWorksheetProtectionCommand.id, {
            unitId,
            subUnitId,
        });

        if (result) {
            const redoMutations = [{ id: DeleteWorksheetProtectionCommand.id, params: { unitId, subUnitId } }];
            const undoMutations = [{ id: AddWorksheetProtectionCommand.id, params: { unitId, rule } }];
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations,
                undoMutations,
            });
        }

        return true;
    },
};

export const ChangeSheetProtectionFromSheetBarCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.change-sheet-protection-from-sheet-bar',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand('sheet-permission.operation.openDialog');
        return true;
    },
};
