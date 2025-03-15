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
import { CommandType, DashStyleType, ICommandService } from '@univerjs/core';
import { BreakLineCommand } from './break-line.command';

interface IHorizontalCommandParams {}

export const HorizontalLineCommand: ICommand<IHorizontalCommandParams> = {
    id: 'doc.command.horizontal-line',

    type: CommandType.COMMAND,

    handler: (accessor, _params: IHorizontalCommandParams) => {
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(BreakLineCommand.id, {
            horizontalLine: {
                padding: 5,
                color: {
                    rgb: '#CDD0D8',
                },
                width: 1,
                dashStyle: DashStyleType.SOLID,
            },
        });
    },
};
