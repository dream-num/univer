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
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IReplaceSelectionCommandParams } from './replace-content.command';
import { CommandType, CustomRangeType, generateRandomId, ICommandService } from '@univerjs/core';
import { ReplaceSelectionCommand } from './replace-content.command';

export interface IInsertCustomRangeCommandParams {
    unitId: string;
    rangeId?: string;
    textRanges?: ITextRangeWithStyle[];
    properties?: Record<string, any>;
    text: string;
    wholeEntity?: boolean;
}

export const InsertCustomRangeCommand: ICommand<IInsertCustomRangeCommandParams> = {
    id: 'doc.command.insert-custom-range',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) return false;
        const commandService = accessor.get(ICommandService);
        const { unitId, rangeId = generateRandomId(), textRanges, properties, text, wholeEntity } = params;
        const replaceSelectionParams: IReplaceSelectionCommandParams = {
            unitId,
            textRanges,
            body: {
                dataStream: text,
                customRanges: [{
                    startIndex: 0,
                    endIndex: text.length - 1,
                    rangeId,
                    rangeType: CustomRangeType.CUSTOM,
                    properties,
                    wholeEntity,
                }],
            },
        };

        return commandService.syncExecuteCommand(ReplaceSelectionCommand.id, replaceSelectionParams);
    },
};
