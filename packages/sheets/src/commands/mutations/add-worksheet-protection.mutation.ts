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

import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { WorksheetProtectionRuleModel } from '../../services/permission/worksheet-permission/worksheet-permission-rule.model';
import type { IWorksheetProtectionRule } from '../../services/permission/type';

export interface IAddWorksheetProtectionParams {
    unitId: string;
    subUnitId: string;
    rule: IWorksheetProtectionRule;
}

export const AddWorksheetProtectionMutation: IMutation<IAddWorksheetProtectionParams> = {
    id: 'sheet.mutation.add-worksheet-protection',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, rule } = params;
        const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
        worksheetProtectionRuleModel.addRule(unitId, rule);
        return true;
    },
};
