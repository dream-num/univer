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
import { DocMentionModel } from '../../models/doc-mention.model';
import type { IDocMention } from '../../types/interfaces/i-mention';

export interface IAddDocMentionMutationParams {
    unitId: string;
    mention: IDocMention;
}

export const AddDocMentionMutation: ICommand<IAddDocMentionMutationParams> = {
    id: 'docs.mutation.add-doc-mention',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, mention } = params;
        const docMentionModel = accessor.get(DocMentionModel);
        docMentionModel.addMention(unitId, mention);
        return true;
    },
};

export interface IDeleteDocMentionMutationParams {
    unitId: string;
    id: string;
}

export const DeleteDocMentionMutation: ICommand<IDeleteDocMentionMutationParams> = {
    id: 'docs.mutation.delete-doc-mention',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, id } = params;
        const docMentionModel = accessor.get(DocMentionModel);
        docMentionModel.deleteMention(unitId, id);
        return true;
    },
};
