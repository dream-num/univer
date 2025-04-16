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
import { CommandType, ICommandService, sequenceExecuteAsync } from '@univerjs/core';
import { DocAutoFormatService } from '../../services/doc-auto-format.service';

const TabCommandId = 'doc.command.tab';

export interface ITabCommandParams {
    shift?: boolean;
}

export const TabCommand: ICommand<ITabCommandParams> = {
    id: TabCommandId,
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        const autoFormatService = accessor.get(DocAutoFormatService);
        const mutations = autoFormatService.onAutoFormat(TabCommand.id, params);

        return (await sequenceExecuteAsync(mutations, accessor.get(ICommandService))).result;
    },
};

const AfterSpaceCommandId = 'doc.command.after-space';

export const AfterSpaceCommand: ICommand = {
    id: AfterSpaceCommandId,
    type: CommandType.COMMAND,
    async handler(accessor) {
        const autoFormatService = accessor.get(DocAutoFormatService);
        const mutations = autoFormatService.onAutoFormat(AfterSpaceCommand.id);

        return (await sequenceExecuteAsync(mutations, accessor.get(ICommandService))).result;
    },
};

export const EnterCommand: ICommand = {
    id: 'doc.command.enter',
    type: CommandType.COMMAND,
    async handler(accessor) {
        const autoFormatService = accessor.get(DocAutoFormatService);
        const mutations = autoFormatService.onAutoFormat(EnterCommand.id);

        return (await sequenceExecuteAsync(mutations, accessor.get(ICommandService))).result;
    },
};
