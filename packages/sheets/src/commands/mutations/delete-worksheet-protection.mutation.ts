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

import { CommandType, type IMutation } from '@univerjs/core';
import { WorksheetProtectionRuleModel } from '../../services/permission/worksheet-permission/worksheet-permission-rule.model';

export interface IDeleteWorksheetProtectionParams {
    unitId: string;
    subUnitId: string;
}

export const DeleteWorksheetProtectionMutation: IMutation<IDeleteWorksheetProtectionParams> = {
    id: 'sheet.mutation.delete-worksheet-protection',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId } = params;
        const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
        worksheetProtectionRuleModel.deleteRule(unitId, subUnitId);
        return true;
    },
};
