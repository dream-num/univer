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

import type { ICommand, ICommandInfo, IDisposable, Nullable, Workbook } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import { CommandType, Disposable, ICommandService, ILogService, IUniverInstanceService } from '@univerjs/core';
import { SetSelectionsOperation } from '@univerjs/sheets';
import { ILocalFileService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';

/**
 * This service is for recording commands. What commands should be recorded can be configured by other
 * plugins.
 */
export class ActionRecorderService extends Disposable {
    private readonly _shouldRecordCommands = new Set<string>();

    private readonly _panelOpened$ = new BehaviorSubject<boolean>(false);
    readonly panelOpened$ = this._panelOpened$.asObservable();

    private _recorder: Nullable<IDisposable> = null;

    private readonly _recording$ = new BehaviorSubject<boolean>(false);
    readonly recording$ = this._recording$.asObservable();
    get recording(): boolean { return this._recording$.getValue(); }

    private _recorded$ = new BehaviorSubject<ICommandInfo[]>([]);
    private get _recorded(): ICommandInfo[] { return this._recorded$.getValue(); }

    private _recordedCommands$ = new BehaviorSubject<ICommandInfo[]>([]);
    readonly recordedCommands$ = this._recordedCommands$.asObservable();
    private get _recordedCommands(): ICommandInfo[] { return this._recordedCommands$.getValue(); }

    constructor(
        @ICommandService private readonly _commandSrv: ICommandService,
        @ILogService private readonly _logService: ILogService,
        @ILocalFileService private readonly _localFileService: ILocalFileService,
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService
    ) {
        super();
    }

    registerRecordedCommand(command: ICommand): void {
        if (command.type === CommandType.MUTATION) throw new Error('[CommandRecorderService] Cannot record mutation commands.');
        this._shouldRecordCommands.add(command.id);
    }

    togglePanel(visible: boolean): void {
        this._panelOpened$.next(visible);

        if (visible === false) this.stopRecording();
    }

    startRecording(replaceId = false): void {
        this._recorder = this._commandSrv.onCommandExecuted((rawCommandInfo) => {
            if (this._shouldRecordCommands.has(rawCommandInfo.id)) {
                const recorded = this._recorded;
                const commands = this._recordedCommands;

                let commandInfo = { ...rawCommandInfo };

                const focusUnitId = this._instanceService.getFocusedUnit()?.getUnitId();
                const { unitId = focusUnitId, subUnitId } = commandInfo?.params as ISheetCommandSharedParams;

                if (replaceId && unitId && subUnitId) {
                    const subUnitName = (this._instanceService.getUnit(unitId) as Workbook).getSheetBySheetId(subUnitId)?.getName();
                    commandInfo = {
                        ...commandInfo,
                        params: {
                            ...commandInfo.params,
                            subUnitId: subUnitName,
                        },
                    };
                }

                if (
                    commandInfo.id === SetSelectionsOperation.id &&
                    recorded.length > 0 &&
                    recorded[recorded.length - 1].id === SetSelectionsOperation.id
                ) {
                    recorded[recorded.length - 1] = commandInfo;
                } else {
                    recorded.push(commandInfo);
                    this._recorded$.next(recorded);

                    if (commandInfo.type === CommandType.COMMAND) {
                        commands.push(commandInfo);
                        this._recordedCommands$.next(commands);
                    }
                }
            }
        });

        this._recording$.next(true);
    }

    stopRecording(): void {
        this._recorder?.dispose();
        this._recorder = null;

        this._recorded$.next([]);
        this._recordedCommands$.next([]);
        this._recording$.next(false);
    }

    completeRecording(): void {
        const commands = this._recorded.slice();
        this._localFileService.downloadFile(new Blob([JSON.stringify(commands, null, 2)]), 'recorded-commands.json');

        this._logService.error('Recorded commands:', commands);
        this.stopRecording();
    }
}
