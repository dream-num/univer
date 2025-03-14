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
import type { IInnerCutCommandParams } from '@univerjs/docs-ui';
import { CommandType, ICommandService, RANGE_DIRECTION } from '@univerjs/core';
import { CutContentCommand } from '@univerjs/docs-ui';

interface IDeleteSearchKeyCommandParams {
    start: number;
    end: number;
}

export const DeleteSearchKeyCommand: ICommand<IDeleteSearchKeyCommandParams> = {
    id: 'doc.command.delete-search-key',

    type: CommandType.COMMAND,

    handler: (accessor, params: IDeleteSearchKeyCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const { start, end } = params;
        return commandService.syncExecuteCommand(CutContentCommand.id, {
            segmentId: '',
            textRanges: [{
                startOffset: start,
                endOffset: start,
                collapsed: true,
            }],
            selections: [{
                startOffset: start,
                endOffset: end,
                collapsed: false,
                direction: RANGE_DIRECTION.FORWARD,
            }],
        } as IInnerCutCommandParams);
    },
};
