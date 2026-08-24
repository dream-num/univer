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

import type { ICommand } from '@univerjs/core';
import type { IAddDocTextRangeCommentParams } from '@univerjs/docs-thread-comment';
import { CommandType, ICommandService, sequenceExecute } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import {

    prepareDocTextRangeComment,
} from '@univerjs/docs-thread-comment';
import { SetActiveCommentOperation } from '@univerjs/thread-comment-ui';

export type IAddDocCommentComment = IAddDocTextRangeCommentParams;

/** Adds a document comment and activates it in the UI comment panel. */
export const AddDocCommentComment: ICommand<IAddDocCommentComment> = {
    id: 'docs.command.add-comment',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }

        const prepared = await prepareDocTextRangeComment(accessor, params);
        if (!prepared) {
            return false;
        }
        const activeOperation = {
            id: SetActiveCommentOperation.id,
            params: {
                unitId: prepared.comment.unitId,
                subUnitId: prepared.comment.subUnitId,
                commentId: prepared.comment.id,
            },
        };
        const decorationMutation = {
            id: RichTextEditingMutation.id,
            params: {
                ...prepared.decorationMutationParams,
                textRanges: null,
                noNeedSetTextRange: true,
            },
        };
        return (await sequenceExecute([
            prepared.commentMutation,
            decorationMutation,
            activeOperation,
        ], accessor.get(ICommandService))).result;
    },
};
