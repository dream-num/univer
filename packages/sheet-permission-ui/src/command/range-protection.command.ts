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
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, Rectangle, sequenceExecute, UniverInstanceType } from '@univerjs/core';
import type { IRangeProtectionRule } from '@univerjs/sheets';
import { AddRangeProtectionMutation, AddWorksheetProtectionMutation, DeleteRangeProtectionMutation, DeleteWorksheetProtectionMutation, RangeProtectionRuleModel, SelectionManagerService, SetRangeProtectionMutation, SetWorksheetProtectionMutation, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { UnitObject } from '@univerjs/protocol';
import { SheetPermissionOpenPanelOperation } from '../operation/sheet-permission-open-panel.operation';
import { SheetPermissionPanelModel } from '../service/sheet-permission-panel.model';
import { DeleteWorksheetProtectionCommand } from './worksheet-protection.command';
import type { IAddRangeProtectionParams, IDeleteRangeProtectionParams, ISetProtectionParams, ISetRangeProtectionParams } from './type';

export const AddRangeProtectionFromToolbarCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheets.command.add-range-protection-from-toolbar',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        const sheetPermissionPanelModel = accessor.get(SheetPermissionPanelModel);
        sheetPermissionPanelModel.resetRule();
        await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: true });
        return true;
    },
};

export const AddRangeProtectionFromContextMenuCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheets.command.add-range-protection-from-context-menu',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        const sheetPermissionPanelModel = accessor.get(SheetPermissionPanelModel);
        sheetPermissionPanelModel.resetRule();
        await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: true });
        return true;
    },
};

export const ViewSheetPermissionFromContextMenuCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheets.command.view-sheet-permission-from-context-menu',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: false });
        return true;
    },
};

export const AddRangeProtectionFromSheetBarCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheets.command.add-range-protection-from-sheet-bar',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        const sheetPermissionPanelModel = accessor.get(SheetPermissionPanelModel);
        sheetPermissionPanelModel.resetRule();
        await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { fromSheetBar: true, showDetail: true });
        return true;
    },
};

export const ViewSheetPermissionFromSheetBarCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheets.command.view-sheet-permission-from-sheet-bar',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: false });
        return true;
    },
};

export const AddRangeProtectionCommand: ICommand<IAddRangeProtectionParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.add-range-protection',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionProtectionModel = accessor.get(RangeProtectionRuleModel);
        const { rule, permissionId } = params;

        const { unitId, subUnitId, ranges, name, description } = rule;
        const rules = [{
            ranges,
            permissionId,
            id: selectionProtectionModel.createRuleId(unitId, subUnitId),
            name,
            description,
        }];

        const result = await commandService.executeCommand(AddRangeProtectionMutation.id, {
            unitId,
            subUnitId,
            rules,
        });

        if (result) {
            const redoMutations = [{ id: AddRangeProtectionMutation.id, params: { unitId, subUnitId, rules } }];
            const undoMutations = [{ id: DeleteRangeProtectionMutation.id, params: { unitId, subUnitId, ruleIds: rules.map((rule) => rule.id) } }];
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations,
                undoMutations,
            });
        }

        return true;
    },
};

export const DeleteRangeSelectionCommand: ICommand<IDeleteRangeProtectionParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.delete-range-protection',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { unitId, subUnitId, rule } = params;

        const redoMutationParam = {
            unitId,
            subUnitId,
            ruleIds: [rule.id],
        };
        const result = await commandService.executeCommand(DeleteRangeProtectionMutation.id, redoMutationParam);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: [{ id: DeleteRangeProtectionMutation.id, params: redoMutationParam }],
                undoMutations: [{ id: AddRangeProtectionMutation.id, params: { unitId, subUnitId, rules: [rule] } }],
            });
        }

        return true;
    },
};

export const SetRangeProtectionCommand: ICommand<ISetRangeProtectionParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.set-range-protection',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const selectionProtectionModel = accessor.get(RangeProtectionRuleModel);
        const sheetPermissionPanelModel = accessor.get(SheetPermissionPanelModel);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { rule, permissionId } = params;

        const { unitId, subUnitId, ranges, name, description } = rule;

        if (rule.id) {
            const redoMutationParam = {
                unitId,
                subUnitId,
                ruleId: rule.id,
                rule: {
                    ranges,
                    permissionId,
                    id: selectionProtectionModel.createRuleId(unitId, subUnitId),
                    name,
                    description,
                },
            };
            const result = await commandService.executeCommand(SetRangeProtectionMutation.id, redoMutationParam);

            if (result) {
                const redoMutations = [{
                    id: SetRangeProtectionMutation.id, params: redoMutationParam,
                }];
                const undoMutations = [{
                    id: SetRangeProtectionMutation.id, params: {
                        unitId,
                        subUnitId,
                        ruleId: rule.id,
                        rule: sheetPermissionPanelModel.oldRule,
                    },
                }];
                undoRedoService.pushUndoRedo({
                    unitID: unitId,
                    redoMutations,
                    undoMutations,
                });
            }
        }
        return true;
    },
};

export const DeleteRangeProtectionFromContextMenuCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheets.command.delete-range-protection-from-context-menu',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);

        if (worksheetRule?.permissionId && worksheetRule?.name) {
            return commandService.executeCommand(DeleteWorksheetProtectionCommand.id, { unitId, subUnitId, rule: worksheetRule });
        } else {
            const selectRange = selectionManagerService.getLast()?.range;
            if (!selectRange) {
                return false;
            }
            const sheetPermissionRuleModal = accessor.get(RangeProtectionRuleModel);

            const subRuleList = sheetPermissionRuleModal.getSubunitRuleList(unitId, subUnitId);
            const rule = subRuleList.find((item) => {
                return item.ranges.some((range) => Rectangle.intersects(range, selectRange));
            });

            if (rule) {
                const redoMutationParam = {
                    unitId,
                    subUnitId,
                    ruleIds: [rule.id],
                };
                const result = await commandService.executeCommand(DeleteRangeProtectionMutation.id, redoMutationParam);
                if (result) {
                    undoRedoService.pushUndoRedo({
                        unitID: unitId,
                        redoMutations: [{ id: DeleteRangeProtectionMutation.id, params: redoMutationParam }],
                        undoMutations: [{ id: AddRangeProtectionMutation.id, params: { unitId, subUnitId, rules: [rule] } }],
                    });
                }
                return true;
            } else {
                return false;
            }
        }
    },

};

export const SetRangeProtectionFromContextMenuCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheets.command.set-range-protection-from-context-menu',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
        const sheetPermissionPanelModel = accessor.get(SheetPermissionPanelModel);
        if (worksheetRule?.permissionId && worksheetRule?.name) {
            const oldRule = {
                ...worksheetRule,
                unitId,
                subUnitId,
                ranges: [],
            };
            sheetPermissionPanelModel.setRule(oldRule);
            sheetPermissionPanelModel.setOldRule(oldRule);
            await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: true });
            return true;
        } else {
            const selectRange = selectionManagerService.getLast()?.range;
            if (!selectRange) {
                return false;
            }
            const sheetPermissionRuleModal = accessor.get(RangeProtectionRuleModel);
            const subRuleList = sheetPermissionRuleModal.getSubunitRuleList(unitId, subUnitId);
            const rule = subRuleList.find((item) => {
                return item?.ranges?.some((range) => Rectangle.intersects(range, selectRange));
            });

            if (rule) {
                const oldRule = {
                    ...rule,
                    unitId,
                    subUnitId,
                };
                sheetPermissionPanelModel.setRule(oldRule);
                sheetPermissionPanelModel.setOldRule(oldRule);
                await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: true });
                return true;
            } else {
                return false;
            }
        }
    },
};

export const SetProtectionCommand: ICommand<ISetProtectionParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.set-protection',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetPermissionPanelModel = accessor.get(SheetPermissionPanelModel);
        const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
        const { rule } = params;
        const { unitId, subUnitId } = rule;

        const redoMutations = [];
        const undoMutations = [];

        const oldRule = sheetPermissionPanelModel.oldRule;

        if (oldRule?.unitType === rule.unitType) {
            if (rule.unitType === UnitObject.Worksheet) {
                redoMutations.push({ id: SetWorksheetProtectionMutation.id, params: { unitId, subUnitId, rule } });
                undoMutations.push({ id: SetWorksheetProtectionMutation.id, params: { unitId, subUnitId, rule: oldRule } });
            } else {
                redoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule, ruleId: (rule as IRangeProtectionRule).id } });
                undoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, ruleId: (oldRule as IRangeProtectionRule).id, rule: oldRule } });
            }
        } else {
            if (oldRule) {
                if (oldRule.unitType === UnitObject.Worksheet) {
                    redoMutations.push({ id: DeleteWorksheetProtectionMutation.id, params: { unitId, subUnitId } });
                    undoMutations.push({ id: AddWorksheetProtectionMutation.id, params: { unitId, rule: oldRule } });
                } else if (oldRule.unitType === UnitObject.SelectRange) {
                    redoMutations.push({ id: DeleteRangeProtectionMutation.id, params: { unitId, subUnitId, ruleIds: [(oldRule as IRangeProtectionRule).id] } });
                    undoMutations.push({ id: AddRangeProtectionMutation.id, params: { unitId, subUnitId, rules: [oldRule] } });
                }
            }

            if (rule.unitType === UnitObject.Worksheet) {
                redoMutations.push({ id: AddWorksheetProtectionMutation.id, params: { unitId, rule } });
                undoMutations.unshift({ id: DeleteWorksheetProtectionMutation.id, params: { unitId, subUnitId } });
            } else if (rule.unitType === UnitObject.SelectRange) {
                (rule as IRangeProtectionRule).id = rangeProtectionRuleModel.createRuleId(unitId, subUnitId);
                redoMutations.push({ id: AddRangeProtectionMutation.id, params: { unitId, subUnitId, rules: [rule] } });
                undoMutations.unshift({ id: DeleteRangeProtectionMutation.id, params: { unitId, subUnitId, ruleIds: [(rule as IRangeProtectionRule).id] } });
            }
        }

        const result = sequenceExecute(redoMutations, commandService);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations,
                redoMutations,
            });
        }

        return true;
    },
};
