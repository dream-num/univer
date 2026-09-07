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

import type { IMutation, ISetObjectPermissionRuleMutationParams } from '@univerjs/core';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocumentPermissionRuleModel } from '../../services/permission/document-permission-rule.model';

export const SetDocumentPermissionRuleMutation: IMutation<ISetObjectPermissionRuleMutationParams> = {
    id: 'doc.mutation.set-permission-rule',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params || !accessor.get(IUniverInstanceService).getUnit(params.unitId, UniverInstanceType.UNIVER_DOC)) {
            return false;
        }
        return accessor.get(DocumentPermissionRuleModel).setRule(params.unitId, params.objectType, params.objectId, params.rule);
    },
};
