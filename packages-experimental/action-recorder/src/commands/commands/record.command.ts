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
import { ActionRecorderService } from '../../services/action-recorder.service';

interface IStartRecordingActionCommandParams {
    replaceId?: boolean;
}

export const StartRecordingActionCommand: ICommand<IStartRecordingActionCommandParams> = {
    id: 'action-recorder.command.start-recording',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        const actionRecorderService = accessor.get(ActionRecorderService);
        actionRecorderService.startRecording(!!params?.replaceId);
        return true;
    },
};

export const CompleteRecordingActionCommand: ICommand = {
    id: 'action-recorder.command.complete-recording',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const actionRecorderService = accessor.get(ActionRecorderService);
        actionRecorderService.completeRecording();
        return true;
    },
};

export const StopRecordingActionCommand: ICommand = {
    id: 'action-recorder.command.stop-recording',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const actionRecorderService = accessor.get(ActionRecorderService);
        actionRecorderService.completeRecording();
        return true;
    },
};
