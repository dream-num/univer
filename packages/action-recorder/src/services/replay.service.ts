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

import type { ICommandInfo, Workbook } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import { awaitTime, Disposable, ICommandService, ILogService, IUniverInstanceService } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { ILocalFileService, IMessageService } from '@univerjs/ui';

export enum ReplayMode {
    DEFAULT = 'default',
    NAME = 'name',
    ACTIVE = 'active',
}

/**
 * This service is for replaying user actions.
 */
export class ActionReplayService extends Disposable {
    constructor(
        @IMessageService private readonly _messageService: IMessageService,
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @ILocalFileService private readonly _localFileService: ILocalFileService,
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    /**
     * Read a local file and try to replay commands in this JSON.
     */
    async replayLocalJSON(mode: ReplayMode = ReplayMode.DEFAULT): Promise<boolean> {
        const files = await this._localFileService.openFile({ multiple: false, accept: '.json' });
        if (files.length !== 1) return false;

        const file = files[0];
        try {
            return this.replayCommands(JSON.parse(await file.text()), { mode });
        } catch {
            this._messageService.show({
                type: MessageType.Error,
                content: `Failed to replay commands from local file ${file.name}.`,
            });

            return false;
        }
    }

    /**
     * Replay a list of commands. Note that `unitId` of these commands would be changed to the focused unit.
     * @param commands - The commands to replay.
     * @returns If the replay is successful.
     */
    async replayCommands(commands: ICommandInfo[], options?: { mode: ReplayMode }): Promise<boolean> {
        const focusedUnitId = this._instanceService.getFocusedUnit()?.getUnitId();
        if (!focusedUnitId) {
            this._logService.error('[ReplayService]', 'no focused unit to replay commands');
        }

        const { mode } = options || {};

        for (const command of commands) {
            const { id, params } = command;
            const commandParams = params as ISheetCommandSharedParams;
            if (commandParams) {
                if (typeof commandParams.unitId !== 'undefined') {
                    commandParams.unitId = focusedUnitId!;
                }

                if (mode === ReplayMode.NAME && commandParams.subUnitId !== 'undefined') {
                    const realSubUnitId = (this._instanceService.getFocusedUnit() as Workbook).getSheetBySheetName(commandParams.subUnitId)?.getSheetId();
                    if (realSubUnitId) {
                        commandParams.subUnitId = realSubUnitId;
                    } else {
                        this._logService.error('[ReplayService]', `failed to find subunit by subUnitName = ${commandParams.subUnitId}`);
                    }
                }

                if (mode === ReplayMode.ACTIVE && commandParams.subUnitId !== 'undefined') {
                    const realSubUnitId = (this._instanceService.getFocusedUnit() as Workbook).getActiveSheet()?.getSheetId();
                    if (realSubUnitId) {
                        commandParams.subUnitId = realSubUnitId;
                    } else {
                        this._logService.error('[ReplayService]', 'failed to find active subunit');
                    }
                }

                const result = await this._commandService.executeCommand(id, params);
                if (!result) return false;
            } else {
                const result = await this._commandService.executeCommand(id);
                if (!result) return false;
            }
        }

        return true;
    }

    /**
     * Replay a list of commands with a random delay between each command.
     * @param commands - The commands to replay.
     */
    async replayCommandsWithDelay(commands: ICommandInfo[]): Promise<boolean> {
        const focusedUnitId = this._instanceService.getFocusedUnit()?.getUnitId();
        if (!focusedUnitId) {
            this._logService.error('[ReplayService]', 'no focused unit to replay commands');
        }

        for (const command of commands) {
            await awaitTime(randomBetween200And1k());

            const { id, params } = command;
            if (params) {
                if (typeof (params as ISharedCommandParams).unitId !== 'undefined') {
                    (params as ISharedCommandParams).unitId = focusedUnitId;
                }

                const result = await this._commandService.executeCommand(id, params);
                if (!result) return false;
            } else {
                const result = await this._commandService.executeCommand(id);
                if (!result) return false;
            }
        }

        return true;
    }
}

interface ISharedCommandParams {
    unitId?: string;
}

function randomBetween200And1k() {
    return Math.floor(Math.random() * 800) + 200;
}
