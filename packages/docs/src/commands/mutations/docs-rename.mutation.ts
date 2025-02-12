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

import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { DocumentDataModel, ICommand } from '@univerjs/core';

export interface IDocsRenameMutationParams {
    name: string;
    unitId: string;
}

export const DocsRenameMutation: ICommand = {
    id: 'doc.mutation.rename-doc',
    type: CommandType.MUTATION,
    handler: (accessor, params: IDocsRenameMutationParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const doc = univerInstanceService.getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);
        if (!doc) {
            return false;
        }
        doc.setName(params.name);

        return true;
    },
};
