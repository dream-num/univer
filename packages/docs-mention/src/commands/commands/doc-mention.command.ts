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

import { CommandType, CustomRangeType, type ICommand, ICommandService, sequenceExecute, Tools } from '@univerjs/core';
import { addCustomRangeBySelectionFactory, deleteCustomRangeFactory } from '@univerjs/docs';
import type { IMention } from '../../types/interfaces/i-mention';
import { AddDocMentionMutation } from '../mutations/doc-mention.mutation';
import { DocMentionModel } from '../../models/doc-mention.model';

export interface IAddDocMentionCommandParams {
    mention: IMention;
    unitId: string;
}

export const AddDocMentionCommand: ICommand<IAddDocMentionCommandParams> = {
    type: CommandType.COMMAND,
    id: 'docs.command.add-doc-mention',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const { mention, unitId } = params;
        const commandService = accessor.get(ICommandService);
        const id = Tools.generateRandomId();
        const doMutation = addCustomRangeBySelectionFactory(
            accessor,
            {
                rangeId: id,
                rangeType: CustomRangeType.MENTION,
                wholeEntity: true,
            }
        );

        if (doMutation) {
            const commentMutation = {
                id: AddDocMentionMutation.id,
                params: {
                    unitId,
                    mention,
                },
            };

            return (await sequenceExecute([commentMutation, doMutation], commandService)).result;
        }

        return true;
    },
};

export interface IDeleteDocMentionCommandParams {
    unitId: string;
    mentionId: string;
}

export const DeleteDocMentionCommand: ICommand<IDeleteDocMentionCommandParams> = {
    type: CommandType.COMMAND,
    id: 'docs.command.delete-doc-mention',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, mentionId } = params;
        const commandService = accessor.get(ICommandService);
        const docMentionModel = accessor.get(DocMentionModel);
        const mention = docMentionModel.getMention(unitId, mentionId);
        if (!mention) {
            return false;
        }

        const doMutation = deleteCustomRangeFactory(accessor, { unitId, rangeId: mention.id });
        if (!doMutation) {
            return false;
        }

        return await commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    },
};
