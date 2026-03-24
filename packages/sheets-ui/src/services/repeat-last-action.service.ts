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

import type { ICellData, ICommandInfo, IExecutionOptions } from '@univerjs/core';
import type { IBorderInfo, ISetBorderBasicCommandParams, ISetColWidthCommandParams, ISetStyleCommandParams } from '@univerjs/sheets';
import { createIdentifier, Disposable, ICommandService, Inject, Injector, Tools } from '@univerjs/core';
import {
    AddWorksheetMergeCommand,
    ClearSelectionContentCommand,
    ClearSelectionFormatCommand,
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    RemoveColCommand,
    RemoveRowCommand,
    RemoveWorksheetMergeCommand,
    SetBorderBasicCommand,
    SetColWidthCommand,
    SetRowHeightCommand,
    SetStyleCommand,
    SetWorksheetRowIsAutoHeightCommand,
} from '@univerjs/sheets';
import { SetWorksheetColAutoWidthCommand } from '../commands/commands/set-worksheet-auto-col-width.command';

const SET_NUMFMT_COMMAND_ID = 'sheet.command.numfmt.set.numfmt';
const REPEAT_LAST_ACTION_COMMAND_ID = 'sheet.command.repeat-last-action';

export type RepeatLastActionPermission = 'none' | 'cellStyle' | 'cellValue';
export type RepeatLastActionSelectionRequirement = 'none' | 'fullRows' | 'fullColumns';

export interface IRepeatLastActionCommand {
    kind: 'command';
    commandId: string;
    params?: Record<string, unknown>;
    permission: RepeatLastActionPermission;
    selectionRequirement: RepeatLastActionSelectionRequirement;
}

export interface IRepeatLastActionSetBorder {
    kind: 'set-border-basic';
    value: IBorderInfo;
    permission: 'cellStyle';
    selectionRequirement: 'none';
}

export interface IRepeatLastActionSetNumfmt {
    kind: 'set-numfmt';
    pattern?: string;
    type?: string;
    permission: 'cellStyle';
    selectionRequirement: 'none';
}

export interface IRepeatLastActionSetRangeValues {
    kind: 'set-range-values';
    value: ICellData;
    permission: 'cellValue';
    selectionRequirement: 'none';
}

export type IRepeatLastAction =
    | IRepeatLastActionCommand
    | IRepeatLastActionSetBorder
    | IRepeatLastActionSetNumfmt
    | IRepeatLastActionSetRangeValues;

export interface IRepeatLastActionService {
    getAction(): ICommandInfo | null;
    runWithoutRecording(): Promise<boolean>;
}

export const IRepeatLastActionService = createIdentifier<IRepeatLastActionService>('sheet-ui.repeat-last-action.service');

export class RepeatLastActionService extends Disposable implements IRepeatLastActionService {
    private _action: ICommandInfo | null = null;
    private _recordingDepth = 0;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initCommandRecording();
    }

    getAction(): ICommandInfo | null {
        return this._action;
    }

    async runWithoutRecording(): Promise<boolean> {
        if (!this._action) {
            return false;
        }

        this._recordingDepth += 1;

        try {
            const { id, params } = this._action as ICommandInfo;

            return await this._commandService.executeCommand(id, params);
        } finally {
            this._recordingDepth -= 1;
        }
    }

    private _initCommandRecording(): void {
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo, options) => {
            if (this._recordingDepth > 0 || options?.fromCollab || options?.fromChangeset) {
                return;
            }

            if (
                [
                    SetStyleCommand.id,
                ].includes(commandInfo.id)
            ) {
                this._action = commandInfo;
            }
        }));
    }

    private _normalizeAction(commandInfo: Readonly<ICommandInfo>, _options?: IExecutionOptions): IRepeatLastAction | null {
        switch (commandInfo.id) {
            case SetStyleCommand.id:
                return {
                    kind: 'command',
                    commandId: SetStyleCommand.id,
                    params: this._normalizeSetStyleParams(commandInfo.params as ISetStyleCommandParams<unknown> | undefined),
                    permission: 'cellStyle',
                    selectionRequirement: 'none',
                };
            case InsertRowBeforeCommand.id:
            case InsertRowAfterCommand.id:
            case InsertColBeforeCommand.id:
            case InsertColAfterCommand.id:
                return {
                    kind: 'command',
                    commandId: commandInfo.id,
                    params: Tools.deepClone(commandInfo.params as Record<string, unknown> | undefined),
                    permission: 'none',
                    selectionRequirement: 'none',
                };
            case RemoveRowCommand.id:
                return {
                    kind: 'command',
                    commandId: RemoveRowCommand.id,
                    permission: 'none',
                    selectionRequirement: 'fullRows',
                };
            case RemoveColCommand.id:
                return {
                    kind: 'command',
                    commandId: RemoveColCommand.id,
                    permission: 'none',
                    selectionRequirement: 'fullColumns',
                };
            case SetRowHeightCommand.id:
                return {
                    kind: 'command',
                    commandId: SetRowHeightCommand.id,
                    params: this._normalizeSetRowHeightParams(commandInfo.params as { value: number } | undefined),
                    permission: 'none',
                    selectionRequirement: 'none',
                };
            case SetColWidthCommand.id:
                return {
                    kind: 'command',
                    commandId: SetColWidthCommand.id,
                    params: this._normalizeSetColWidthParams(commandInfo.params as ISetColWidthCommandParams | undefined),
                    permission: 'none',
                    selectionRequirement: 'none',
                };
            case SetWorksheetRowIsAutoHeightCommand.id:
            case SetWorksheetColAutoWidthCommand.id:
                return {
                    kind: 'command',
                    commandId: commandInfo.id,
                    permission: 'none',
                    selectionRequirement: 'none',
                };
            case ClearSelectionContentCommand.id:
            case ClearSelectionFormatCommand.id:
            case AddWorksheetMergeCommand.id:
            case RemoveWorksheetMergeCommand.id:
                return {
                    kind: 'command',
                    commandId: commandInfo.id,
                    permission: 'none',
                    selectionRequirement: 'none',
                };
            case SetBorderBasicCommand.id:
                return this._normalizeSetBorderAction(commandInfo.params as ISetBorderBasicCommandParams | undefined);
            case SET_NUMFMT_COMMAND_ID:
                return this._normalizeSetNumfmtAction(commandInfo.params as { values?: Array<{ pattern?: string; type?: string }> } | undefined);
            case REPEAT_LAST_ACTION_COMMAND_ID:
                return null;
            default:
                return null;
        }
    }

    private _normalizeSetStyleParams(params: ISetStyleCommandParams<unknown> | undefined): Record<string, unknown> | undefined {
        if (!params) {
            return undefined;
        }

        return {
            style: Tools.deepClone(params.style),
        };
    }

    private _normalizeSetRowHeightParams(params: { value: number } | undefined): Record<string, unknown> | undefined {
        if (!params) {
            return undefined;
        }

        return {
            value: params.value,
        };
    }

    private _normalizeSetColWidthParams(params: ISetColWidthCommandParams | undefined): Record<string, unknown> | undefined {
        if (!params) {
            return undefined;
        }

        return {
            value: params.value,
        };
    }

    private _normalizeSetBorderAction(params: ISetBorderBasicCommandParams | undefined): IRepeatLastActionSetBorder | null {
        if (!params) {
            return null;
        }

        return {
            kind: 'set-border-basic',
            value: Tools.deepClone(params.value),
            permission: 'cellStyle',
            selectionRequirement: 'none',
        };
    }

    private _normalizeSetNumfmtAction(params: { values?: Array<{ pattern?: string; type?: string }> } | undefined): IRepeatLastActionSetNumfmt | null {
        const values = params?.values;
        if (!values?.length) {
            return null;
        }

        const [firstValue] = values;
        const isUniform = values.every((value) => value.pattern === firstValue.pattern && value.type === firstValue.type);
        if (!isUniform) {
            return null;
        }

        return {
            kind: 'set-numfmt',
            pattern: firstValue.pattern,
            type: firstValue.type,
            permission: 'cellStyle',
            selectionRequirement: 'none',
        };
    }
}
