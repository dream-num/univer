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
import { CommandType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IMessageService } from '@univerjs/ui';
import { ActionReplayService, ReplayMode } from '../../services/replay.service';

export const ReplayLocalRecordCommand: ICommand = {
    id: 'action-recorder.command.replay-local-records',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const replayService = accessor.get(ActionReplayService);
        const result = await replayService.replayLocalJSON();

        if (result) {
            const messageService = accessor.get(IMessageService);
            messageService.show({
                type: MessageType.Success,
                content: 'Successfully replayed local records',
            });
        }

        return result;
    },
};

export const ReplayLocalRecordOnNamesakeCommand: ICommand = {
    id: 'action-recorder.command.replay-local-records-name',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const replayService = accessor.get(ActionReplayService);
        const result = await replayService.replayLocalJSON(ReplayMode.NAME);

        if (result) {
            const messageService = accessor.get(IMessageService);
            messageService.show({
                type: MessageType.Success,
                content: 'Successfully replayed local records',
            });
        }

        return result;
    },
};

export const ReplayLocalRecordOnActiveCommand: ICommand = {
    id: 'action-recorder.command.replay-local-records-active',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const replayService = accessor.get(ActionReplayService);
        const result = await replayService.replayLocalJSON(ReplayMode.ACTIVE);

        if (result) {
            const messageService = accessor.get(IMessageService);
            messageService.show({
                type: MessageType.Success,
                content: 'Successfully replayed local records',
            });
        }

        return result;
    },
};
