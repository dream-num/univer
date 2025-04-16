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

import type { ICommand, ITextRange } from '@univerjs/core';
import type { IThreadComment } from '@univerjs/thread-comment';
import { CommandType, CustomDecorationType, ICommandService, sequenceExecute } from '@univerjs/core';
import { addCustomDecorationBySelectionFactory } from '@univerjs/docs-ui';
import { AddCommentMutation, IThreadCommentDataSourceService } from '@univerjs/thread-comment';
import { SetActiveCommentOperation } from '@univerjs/thread-comment-ui';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../common/const';

export interface IAddDocCommentComment {
    unitId: string;
    comment: IThreadComment;
    range: ITextRange;
}

export const AddDocCommentComment: ICommand<IAddDocCommentComment> = {
    id: 'docs.command.add-comment',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { comment: originComment, unitId } = params;
        const dataSourceService = accessor.get(IThreadCommentDataSourceService);
        const comment = await dataSourceService.addComment(originComment);
        const commandService = accessor.get(ICommandService);

        const doMutation = addCustomDecorationBySelectionFactory(
            accessor,
            {
                id: comment.threadId,
                type: CustomDecorationType.COMMENT,
                unitId,
            }
        );
        if (doMutation) {
            const addComment = {
                id: AddCommentMutation.id,
                params: {
                    unitId,
                    subUnitId: DEFAULT_DOC_SUBUNIT_ID,
                    comment,
                },
            };

            const activeOperation = {
                id: SetActiveCommentOperation.id,
                params: {
                    unitId,
                    subUnitId: DEFAULT_DOC_SUBUNIT_ID,
                    commentId: comment.id,
                },
            };

            return (await sequenceExecute([addComment, doMutation, activeOperation], commandService)).result;
        }

        return false;
    },
};
