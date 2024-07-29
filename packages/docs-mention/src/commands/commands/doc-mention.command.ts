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

import type { ICommand, IDocumentBody } from '@univerjs/core';
import { CommandType, CustomRangeType, DataStreamTreeTokenType, ICommandService, sequenceExecute } from '@univerjs/core';
import { deleteCustomRangeFactory, replaceSelectionFactory, TextSelectionManagerService } from '@univerjs/docs';
import type { IDocMention } from '../../types/interfaces/i-mention';
import { AddDocMentionMutation } from '../mutations/doc-mention.mutation';
import { DocMentionModel } from '../../models/doc-mention.model';

export interface IAddDocMentionCommandParams {
    mention: IDocMention;
    unitId: string;
    startIndex: number;
}

export const AddDocMentionCommand: ICommand<IAddDocMentionCommandParams> = {
    type: CommandType.COMMAND,
    id: 'docs.command.add-doc-mention',
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const { mention, unitId, startIndex } = params;
        const commandService = accessor.get(ICommandService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const activeRange = textSelectionManagerService.getActiveTextRangeWithStyle();
        if (!activeRange) {
            return false;
        }
        const dataStream = `${DataStreamTreeTokenType.CUSTOM_RANGE_START} @${mention.label} ${DataStreamTreeTokenType.CUSTOM_RANGE_END}`;
        const body: IDocumentBody = {
            dataStream,
            customRanges: [{
                startIndex: 0,
                endIndex: dataStream.length - 1,
                rangeId: mention.id,
                rangeType: CustomRangeType.MENTION,
                wholeEntity: true,
            }],
        };

        const doMutation = replaceSelectionFactory(
            accessor,
            {
                unitId,
                body,
                selection: {
                    startOffset: startIndex,
                    endOffset: activeRange.endOffset,
                    collapsed: startIndex === activeRange.endOffset,
                },
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
