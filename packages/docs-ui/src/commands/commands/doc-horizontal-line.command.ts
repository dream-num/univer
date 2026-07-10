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

import type { ICommand, ITextRangeParam } from '@univerjs/core';
import { CommandType, DashStyleType, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocContentInsertService } from '@univerjs/docs';
import { BreakLineCommand } from './break-line.command';
import { getCurrentParagraph } from './util';

interface IHorizontalCommandParams {
    insertionMode?: 'split-paragraph' | 'insert-gap';
    insertRange?: ITextRangeParam;
}

export const HorizontalLineCommand: ICommand<IHorizontalCommandParams> = {
    id: 'doc.command.horizontal-line',

    type: CommandType.COMMAND,

    handler: (accessor, params: IHorizontalCommandParams) => {
        const commandService = accessor.get(ICommandService);

        return commandService.syncExecuteCommand(BreakLineCommand.id, {
            horizontalLine: {
                padding: 5,
                color: {
                    rgb: '#CDD0D8',
                },
                width: 1,
                dashStyle: DashStyleType.SOLID,
            },
            insertionMode: params?.insertionMode,
            textRange: params?.insertRange,
        });
    },
};

export const InsertHorizontalLineBellowCommand: ICommand<IHorizontalCommandParams> = {
    id: 'doc.command.insert-horizontal-line-bellow',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        const doc = accessor.get(IUniverInstanceService).getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
        let contentInsertRange: ReturnType<DocContentInsertService['consumeInsertRange']> = null;
        try {
            contentInsertRange = accessor.get(DocContentInsertService).consumeInsertRange(doc?.getUnitId());
        } catch {
            contentInsertRange = null;
        }
        if (contentInsertRange) {
            return commandService.syncExecuteCommand(HorizontalLineCommand.id, {
                insertionMode: 'insert-gap',
                insertRange: {
                    startOffset: contentInsertRange.startOffset,
                    endOffset: contentInsertRange.endOffset,
                },
            });
        }

        const paragraph = getCurrentParagraph(accessor);
        if (!paragraph) {
            return false;
        }

        return commandService.syncExecuteCommand(HorizontalLineCommand.id, {
            insertRange: {
                startOffset: paragraph.startIndex + 1,
                endOffset: paragraph.startIndex + 1,
            },
        });
    },
};
