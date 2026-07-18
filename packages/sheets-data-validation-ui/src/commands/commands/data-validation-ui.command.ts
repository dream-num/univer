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

import type { DataValidationType, IAccessor, ICommand, ISheetDataValidationRule } from '@univerjs/core';
import type { IAddSheetDataValidationCommandParams } from '@univerjs/sheets-data-validation';
import {
    CommandType,
    ICommandService,
    IUniverInstanceService,
} from '@univerjs/core';
import { getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import {
    AddSheetDataValidationCommand,
    ClearRangeDataValidationCommand,
    createDefaultNewRule,
} from '@univerjs/sheets-data-validation';
import { OpenValidationPanelOperation } from '../operations/data-validation.operation';

export type IQuickDataValidationRuleInput = Pick<ISheetDataValidationRule, 'type'> & Partial<Omit<ISheetDataValidationRule, 'uid' | 'ranges' | 'type'>>;

interface IInsertQuickSheetDataValidationCommandParams {
    rule: IQuickDataValidationRuleInput;
}

interface IClearQuickSheetDataValidationCommandParams {
    types: DataValidationType[];
}

interface IAddSheetDataValidationAndOpenCommandParams {
    rule?: IQuickDataValidationRuleInput;
}

function createRule(accessor: IAccessor, rule?: IQuickDataValidationRuleInput): ISheetDataValidationRule {
    const defaultRule = createDefaultNewRule(accessor);

    return {
        ...defaultRule,
        ...rule,
        uid: defaultRule.uid,
        ranges: defaultRule.ranges,
    };
}

export const InsertQuickSheetDataValidationCommand: ICommand<IInsertQuickSheetDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.insert-quick-rule',
    handler(accessor, params) {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        const ranges = accessor.get(SheetsSelectionsService).getCurrentSelections().map((selection) => selection.range);
        if (!target || !ranges.length || !params?.rule) return false;

        const rule = createRule(accessor, params.rule);

        return accessor.get(ICommandService).syncExecuteCommand(AddSheetDataValidationCommand.id, {
            unitId: target.workbook.getUnitId(),
            subUnitId: target.worksheet.getSheetId(),
            rule,
        });
    },
};

export const ClearQuickSheetDataValidationCommand: ICommand<IClearQuickSheetDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.clear-quick-rule',
    handler(accessor, params) {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        const ranges = accessor.get(SheetsSelectionsService).getCurrentSelections().map((selection) => selection.range);
        if (!target || !ranges.length || !params?.types?.length) return false;

        return accessor.get(ICommandService).syncExecuteCommand(ClearRangeDataValidationCommand.id, {
            unitId: target.workbook.getUnitId(),
            subUnitId: target.worksheet.getSheetId(),
            ranges,
            types: params.types,
        });
    },
};

export const AddSheetDataValidationAndOpenCommand: ICommand<IAddSheetDataValidationAndOpenCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.addRuleAndOpen',
    handler(accessor, params) {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { workbook, worksheet } = target;
        const ranges = accessor.get(SheetsSelectionsService).getCurrentSelections();
        if (!ranges.length) return false;

        const rule = createRule(accessor, params?.rule);
        const commandService = accessor.get(ICommandService);
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        const addParams: IAddSheetDataValidationCommandParams = {
            rule,
            unitId,
            subUnitId,
        };

        const res = commandService.syncExecuteCommand(AddSheetDataValidationCommand.id, addParams);

        if (res) {
            commandService.syncExecuteCommand(OpenValidationPanelOperation.id, {
                ruleId: rule.uid,
                isAdd: true,
            });

            return true;
        }
        return false;
    },
};
