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

import type { ICommandInfo, IDisposable, IRange } from '@univerjs/core';
import type {
    IAddMergeCommandParams,
    IClearSelectionAllCommandParams,
    IClearSelectionContentCommandParams,
    IClearSelectionFormatCommandParams,
    IDeleteRangeMoveLeftCommandParams,
    IDeleteRangeMoveUpCommandParams,
    IInsertRangeMoveDownCommandParams,
    IInsertRangeMoveRightCommandParams,
    IRemoveWorksheetMergeCommandParams,
    ISetBorderCommandParams,
    ISetColWidthCommandParams,
    ISetRowHeightCommandParams,
    ISetStyleCommandParams,
} from '@univerjs/sheets';
import { createIdentifier, Disposable, ICommandService, toDisposable } from '@univerjs/core';
import {
    AddWorksheetMergeCommand,
    ClearSelectionAllCommand,
    ClearSelectionContentCommand,
    ClearSelectionFormatCommand,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    RemoveColCommand,
    RemoveRowCommand,
    RemoveWorksheetMergeCommand,
    SetBorderCommand,
    SetColWidthCommand,
    SetRowHeightCommand,
    SetStyleCommand,
} from '@univerjs/sheets';

export type RepeatableCommandHandler<T = any> = (selections: IRange[], params?: T) => T | undefined;

export enum RepeatLastActionPermission {
    None = 'none',
    Editable = 'editable',
    CellStyle = 'cellStyle',
    CellValue = 'cellValue',
    RowStyle = 'rowStyle',
    ColumnStyle = 'columnStyle',
}

type RepeatableCommandRangesParams =
    | ISetBorderCommandParams
    | ISetRowHeightCommandParams
    | ISetColWidthCommandParams
    | IClearSelectionContentCommandParams
    | IClearSelectionFormatCommandParams
    | IClearSelectionAllCommandParams
    | IRemoveWorksheetMergeCommandParams;

export const SHEETS_BASIC_REPEATABLE_COMMANDS = [
    SetStyleCommand.id,
    SetBorderCommand.id,
    AddWorksheetMergeCommand.id,
    RemoveWorksheetMergeCommand.id,
    InsertRowCommand.id,
    InsertColCommand.id,
    RemoveRowCommand.id,
    RemoveColCommand.id,
    SetRowHeightCommand.id,
    SetColWidthCommand.id,
    ClearSelectionContentCommand.id,
    ClearSelectionFormatCommand.id,
    ClearSelectionAllCommand.id,
];

export interface IRepeatLastActionService {
    setAction(commandInfo: ICommandInfo | null): void;
    getAction(): ICommandInfo | null;
    getRepeatableCommands(): Set<string>;
    getActionPermission(): RepeatLastActionPermission | RepeatLastActionPermission[];
    registerRepeatableCommand(commandId: string, handler: RepeatableCommandHandler, permissionType?: RepeatLastActionPermission): IDisposable;
    runWithoutRecording(selections: IRange[]): Promise<boolean>;
}

export const IRepeatLastActionService = createIdentifier<IRepeatLastActionService>('sheet-ui.repeat-last-action.service');

export class RepeatLastActionService extends Disposable implements IRepeatLastActionService {
    private _action: ICommandInfo | null = null;
    private _recordingDepth = 0;
    private _repeatableCommands = new Set<string>(SHEETS_BASIC_REPEATABLE_COMMANDS);
    private _customCommandHandlers = new Map<string, RepeatableCommandHandler>();
    private _permissionCheckMap = new Map<RepeatLastActionPermission, Set<string>>([
        [
            RepeatLastActionPermission.Editable,
            new Set<string>([
                InsertRowCommand.id,
                InsertColCommand.id,
                RemoveRowCommand.id,
                RemoveColCommand.id,
            ]),
        ],
        [
            RepeatLastActionPermission.CellStyle,
            new Set<string>([
                SetStyleCommand.id,
                SetBorderCommand.id,
                ClearSelectionFormatCommand.id,
                ClearSelectionAllCommand.id,
            ]),
        ],
        [
            RepeatLastActionPermission.CellValue,
            new Set<string>([
                ClearSelectionContentCommand.id,
                ClearSelectionAllCommand.id,
            ]),
        ],
        [
            RepeatLastActionPermission.RowStyle,
            new Set<string>([
                SetRowHeightCommand.id,
            ]),
        ],
        [
            RepeatLastActionPermission.ColumnStyle,
            new Set<string>([
                SetColWidthCommand.id,
            ]),
        ],
    ]);

    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        this._action = null;
        this._repeatableCommands.clear();
        this._customCommandHandlers.clear();
        this._permissionCheckMap.clear();
    }

    setAction(commandInfo: ICommandInfo | null): void {
        if (this._recordingDepth > 0) {
            return;
        }

        this._action = commandInfo;
    }

    getAction(): ICommandInfo | null {
        return this._action;
    }

    getRepeatableCommands(): Set<string> {
        return this._repeatableCommands;
    }

    getActionPermission(): RepeatLastActionPermission | RepeatLastActionPermission[] {
        if (!this._action) {
            return RepeatLastActionPermission.None;
        }

        const permissions: RepeatLastActionPermission[] = [];

        for (const [permission, commandSet] of this._permissionCheckMap.entries()) {
            if (commandSet.has(this._action.id)) {
                permissions.push(permission);
            }
        }

        if (permissions.length === 0) {
            return RepeatLastActionPermission.None;
        }

        return permissions.length === 1 ? permissions[0] : permissions;
    }

    registerRepeatableCommand(commandId: string, handler: RepeatableCommandHandler, permissionType: RepeatLastActionPermission = RepeatLastActionPermission.None): IDisposable {
        this._repeatableCommands.add(commandId);
        this._customCommandHandlers.set(commandId, handler);

        if (!this._permissionCheckMap.has(permissionType)) {
            this._permissionCheckMap.set(permissionType, new Set<string>());
        }
        this._permissionCheckMap.get(permissionType)?.add(commandId);

        return toDisposable(() => {
            this._repeatableCommands.delete(commandId);
            this._customCommandHandlers.delete(commandId);
            this._permissionCheckMap.get(permissionType)?.delete(commandId);
        });
    }

    // eslint-disable-next-line max-lines-per-function
    async runWithoutRecording(selections: IRange[]): Promise<boolean> {
        if (!this._action) {
            return false;
        }

        this._recordingDepth += 1;

        try {
            const { id, params } = this._action as ICommandInfo;

            if (id === SetStyleCommand.id) {
                const styleParams: ISetStyleCommandParams<unknown> = {
                    ...(params as ISetStyleCommandParams<unknown>),
                    range: selections[selections.length - 1],
                };
                return await this._commandService.executeCommand(id, styleParams);
            }

            if (id === AddWorksheetMergeCommand.id) {
                const mergeParams: IAddMergeCommandParams = {
                    ...(params as IAddMergeCommandParams),
                    selections,
                };
                return await this._commandService.executeCommand(id, mergeParams);
            }

            if (id === InsertRowCommand.id) {
                const insertRangeMoveDownParams: IInsertRangeMoveDownCommandParams = {
                    range: selections[selections.length - 1],
                };
                return await this._commandService.executeCommand(InsertRangeMoveDownCommand.id, insertRangeMoveDownParams);
            }

            if (id === InsertColCommand.id) {
                const insertRangeMoveRightParams: IInsertRangeMoveRightCommandParams = {
                    range: selections[selections.length - 1],
                };
                return await this._commandService.executeCommand(InsertRangeMoveRightCommand.id, insertRangeMoveRightParams);
            }

            if (id === RemoveRowCommand.id) {
                const deleteRangeMoveUpParams: IDeleteRangeMoveUpCommandParams = {
                    range: selections[selections.length - 1],
                };
                return await this._commandService.executeCommand(DeleteRangeMoveUpCommand.id, deleteRangeMoveUpParams);
            }

            if (id === RemoveColCommand.id) {
                const deleteRangeMoveLeftParams: IDeleteRangeMoveLeftCommandParams = {
                    range: selections[selections.length - 1],
                };
                return await this._commandService.executeCommand(DeleteRangeMoveLeftCommand.id, deleteRangeMoveLeftParams);
            }

            if (
                id === SetBorderCommand.id ||
                id === SetRowHeightCommand.id ||
                id === SetColWidthCommand.id ||
                id === ClearSelectionContentCommand.id ||
                id === ClearSelectionFormatCommand.id ||
                id === ClearSelectionAllCommand.id ||
                id === RemoveWorksheetMergeCommand.id
            ) {
                const newRangesParams: RepeatableCommandRangesParams = {
                    ...(params as RepeatableCommandRangesParams),
                    ranges: selections,
                };
                return await this._commandService.executeCommand(id, newRangesParams);
            }

            if (this._customCommandHandlers.has(id)) {
                const handler = this._customCommandHandlers.get(id) as RepeatableCommandHandler;
                const customParams = handler(selections, params);
                return await this._commandService.executeCommand(id, customParams);
            }

            return await this._commandService.executeCommand(id, params);
        } finally {
            this._recordingDepth -= 1;
        }
    }
}
