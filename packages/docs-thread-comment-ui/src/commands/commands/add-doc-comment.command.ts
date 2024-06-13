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

import { CommandType, CustomRangeType, type ICommand, ICommandService, sequenceExecuteAsync } from '@univerjs/core';
import { addCustomRangeBySelectionFactory } from '@univerjs/docs';
import type { IThreadComment } from '@univerjs/thread-comment';
import { AddCommentMutation, IThreadCommentDataSourceService } from '@univerjs/thread-comment';

interface IAddDocCommentComment {
    unitId: string;
    comment: IThreadComment;
}

export const AddDocCommentComment: ICommand<IAddDocCommentComment> = {
    id: 'docs.command.add-comment',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { comment: originComment } = params;
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const comment = await dataSourceService.addComment(originComment);
        const commandService = accessor.get(ICommandService);

        const doMutation = addCustomRangeBySelectionFactory(accessor, {
            rangeId: comment.id,
            rangeType: CustomRangeType.COMMENT,
        });

        if (doMutation) {
            const commentMutation = {
                id: AddCommentMutation.id,
                params,
            };

            return (await sequenceExecuteAsync([commentMutation, doMutation], commandService)).result;
        }

        return false;
    },
};

