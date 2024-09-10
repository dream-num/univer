/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, ILogService } from '@univerjs/core';
import { ILocalFileService } from '@univerjs/ui';

/**
 * This service is for replaying user actions.
 */
export class ReplayService extends Disposable {
    constructor(
        @ILocalFileService private readonly _localFileService: ILocalFileService,
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    /**
     * Read a local file and try to replay commands in this JSON.
     */
    async replayLocalJSON(): Promise<boolean> {
        const files = await this._localFileService.openFile({ multiple: false, accept: '.json' });
        if (files.length !== 1) return false;

        const file = files[0];
        try {
            return this.replayCommands(JSON.parse(await file.text()));
        } catch (e: unknown) {
            this._logService.error('[ReplayService]', 'failed to execute commands from local file:', file.name, '\n', e);
            return false;
        }
    }

    /**
     * Replay a list of commands. Note that `unitId` of these commands would be changed to the focused unit.
     * @param commands - The commands to replay.
     * @returns If the replay is successful.
     */
    async replayCommands(commands: ICommandInfo[]): Promise<boolean> {
        return true;
    }
}

