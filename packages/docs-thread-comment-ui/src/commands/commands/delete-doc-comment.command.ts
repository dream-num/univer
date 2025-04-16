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
import { CommandType, ICommandService, sequenceExecute } from '@univerjs/core';
import { deleteCustomDecorationFactory } from '@univerjs/docs-ui';

export interface IDeleteDocCommentComment {
    unitId: string;
    commentId: string;
}

export const DeleteDocCommentComment: ICommand<IDeleteDocCommentComment> = {
    id: 'docs.command.delete-comment',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { commentId, unitId } = params;
        const commandService = accessor.get(ICommandService);

        const doMutation = deleteCustomDecorationFactory(accessor, {
            id: commentId,
            unitId,
        });

        if (doMutation) {
            return (await sequenceExecute([doMutation], commandService)).result;
        }

        return false;
    },
};
