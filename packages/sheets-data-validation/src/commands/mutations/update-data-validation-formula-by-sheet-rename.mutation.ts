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

import type { ICommand, ISheetDataValidationRule, Workbook } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { DataValidationModel, getRuleSetting, UpdateRuleType } from '@univerjs/data-validation';

export interface IUpdateDataValidationFormulaBySheetRenameMutationParams {
    unitId: string;
    subUnitId: string;
    ruleId: string;
    before: Pick<ISheetDataValidationRule, 'formula1' | 'formula2'>;
    after: Pick<ISheetDataValidationRule, 'formula1' | 'formula2'>;
}

export const UpdateDataValidationFormulaBySheetRenameMutation: ICommand<IUpdateDataValidationFormulaBySheetRenameMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheets-data-validation.mutation.update-formula-by-sheet-rename',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const workbook = accessor.get(IUniverInstanceService).getUnit<Workbook>(params.unitId);
        if (!workbook?.getSheetBySheetId(params.subUnitId)) {
            return true;
        }
        const model = accessor.get(DataValidationModel);
        const rule = model.getRuleById(params.unitId, params.subUnitId, params.ruleId);
        if (!rule) {
            return true;
        }
        const formula1 = params.before.formula1 !== params.after.formula1 && rule.formula1 === params.before.formula1
            ? params.after.formula1
            : rule.formula1;
        const formula2 = params.before.formula2 !== params.after.formula2 && rule.formula2 === params.before.formula2
            ? params.after.formula2
            : rule.formula2;
        if (formula1 === rule.formula1 && formula2 === rule.formula2) {
            return true;
        }
        model.updateRule(params.unitId, params.subUnitId, params.ruleId, {
            type: UpdateRuleType.SETTING,
            payload: { ...getRuleSetting(rule), formula1, formula2 },
        }, 'patched');
        return true;
    },
};
