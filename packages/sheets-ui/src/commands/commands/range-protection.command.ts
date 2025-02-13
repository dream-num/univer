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
import type { IRangeProtectionRule } from '@univerjs/sheets';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, Rectangle, Tools, UniverInstanceType } from '@univerjs/core';
import { AddRangeProtectionMutation, DeleteRangeProtectionMutation, DeleteWorksheetProtectionCommand, RangeProtectionRuleModel, SheetsSelectionsService, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { SheetPermissionOpenPanelOperation } from '../operations/sheet-permission-open-panel.operation';

export interface IAddRangeProtectionParams {
    permissionId: string;
    rule: IRangeProtectionRule;
}

export type ISetRangeProtectionParams = IAddRangeProtectionParams;

export interface IDeleteRangeProtectionParams {
    unitId: string;
    subUnitId: string;
    rule: IRangeProtectionRule;
}

export const AddRangeProtectionFromToolbarCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-range-protection-from-toolbar',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: true });
        return true;
    },
};

export const AddRangeProtectionFromContextMenuCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-range-protection-from-context-menu',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: true });
        return true;
    },
};

export const ViewSheetPermissionFromContextMenuCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.view-sheet-permission-from-context-menu',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: false });
        return true;
    },
};

export const AddRangeProtectionFromSheetBarCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-range-protection-from-sheet-bar',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { fromSheetBar: true, showDetail: true });
        return true;
    },
};

export const ViewSheetPermissionFromSheetBarCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.view-sheet-permission-from-sheet-bar',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: false });
        return true;
    },
};

export const DeleteRangeProtectionFromContextMenuCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-range-protection-from-context-menu',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);

        if (worksheetRule?.permissionId) {
            return commandService.executeCommand(DeleteWorksheetProtectionCommand.id, { unitId, subUnitId, rule: worksheetRule });
        } else {
            const selectRange = selectionManagerService.getCurrentLastSelection()?.range;
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
    id: 'sheet.command.set-range-protection-from-context-menu',
    async handler(accessor) {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
        if (worksheetRule?.permissionId) {
            const oldRule = {
                ...worksheetRule,
                unitId,
                subUnitId,
                ranges: [],
            };
            await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: true, rule: Tools.deepClone(oldRule), oldRule: Tools.deepClone(oldRule) });
            return true;
        } else {
            const selectRange = selectionManagerService.getCurrentLastSelection()?.range;
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
                await commandService.executeCommand(SheetPermissionOpenPanelOperation.id, { showDetail: true, rule: Tools.deepClone(oldRule), oldRule: Tools.deepClone(oldRule) });
                return true;
            } else {
                return false;
            }
        }
    },
};
