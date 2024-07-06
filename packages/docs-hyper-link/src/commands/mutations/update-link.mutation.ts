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

import { CommandType, type ICommand } from '@univerjs/core';
import { DocHyperLinkModel } from '../../models/hyper-link.model';

export interface IUpdateDocHyperLinkMutationParams {
    unitId: string;
    linkId: string;
    payload: string;
}

export const UpdateDocHyperLinkMutation: ICommand<IUpdateDocHyperLinkMutationParams> = {
    type: CommandType.MUTATION,
    id: 'docs.mutation.update-hyper-link',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const docHyperLinkModel = accessor.get(DocHyperLinkModel);
        return docHyperLinkModel.updateLink(params.unitId, params.linkId, params.payload);
    },
};
