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

import type { ICommand, IDocMention, IDocumentBody } from '@univerjs/core';
import { CommandType, CustomRangeType, ICommandService } from '@univerjs/core';
import { deleteCustomRangeFactory, DocSelectionManagerService, replaceSelectionFactory } from '@univerjs/docs';

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
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const activeRange = docSelectionManagerService.getActiveTextRange();
        if (!activeRange) {
            return false;
        }

        const { metadata, ...mentionConfig } = mention;
        const dataStream = `@${mention.label}`;
        const body: IDocumentBody = {
            dataStream,
            customRanges: [{
                startIndex: 0,
                endIndex: dataStream.length - 1,
                rangeId: mention.id,
                rangeType: CustomRangeType.MENTION,
                wholeEntity: true,
                properties: {
                    ...mentionConfig,
                    ...metadata,
                },
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
            return commandService.syncExecuteCommand(doMutation.id, doMutation.params);
        }

        return false;
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

        const doMutation = deleteCustomRangeFactory(accessor, { unitId, rangeId: mentionId });
        if (!doMutation) {
            return false;
        }

        return await commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    },
};
