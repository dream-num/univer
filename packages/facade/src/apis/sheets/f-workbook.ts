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

import type { CommandListener, ICommandInfo, IRange, IWorkbookData, Workbook } from '@univerjs/core';
import {
    ICommandService,
    IUniverInstanceService,
    mergeWorksheetSnapshotWithDefault,
    RedoCommand,
    toDisposable,
    UndoCommand,
} from '@univerjs/core';
import type {
    ISheetCommandSharedParams,
} from '@univerjs/sheets';
import { InsertSheetCommand, SelectionManagerService, SetWorksheetActiveOperation } from '@univerjs/sheets';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { FWorksheet } from './f-worksheet';

export class FWorkbook {
    readonly id: string;

    constructor(
        private readonly _workbook: Workbook,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        this.id = this._workbook.getUnitId();
    }

    getId(): string {
        return this._workbook.getUnitId();
    }

    getName(): string {
        return this._workbook.getName();
    }

    getSnapshot(): IWorkbookData {
        return this._workbook.getSnapshot();
    }

    /**
     * Get the active sheet of the workbook.
     * @returns The active sheet of the workbook
     */
    getActiveSheet(): FWorksheet | null {
        const activeSheet = this._workbook.getActiveSheet();
        if (!activeSheet) {
            return null;
        }

        return this._injector.createInstance(FWorksheet, this._workbook, activeSheet);
    }

    /**
     * Create a new worksheet and returns a handle to it.
     * @param name Name of the new sheet
     * @param rows How may rows would the new sheet have
     * @param column How many columns would the new sheet have
     * @returns The new created sheet
     */
    create(name: string, rows: number, column: number): FWorksheet {
        const newSheet = mergeWorksheetSnapshotWithDefault({});
        newSheet.rowCount = rows;
        newSheet.columnCount = column;
        newSheet.name = name;
        newSheet.id = name.toLowerCase().replace(/ /g, '-');

        this._commandService.syncExecuteCommand(InsertSheetCommand.id, {
            unitId: this._workbook.getUnitId(),
            index: this._workbook.getSheets().length,
            sheet: newSheet,
        });
        this._commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._workbook.getSheets()[this._workbook.getSheets().length - 1].getSheetId(),
        });

        return this._injector.createInstance(FWorksheet, this._workbook, this._workbook.getActiveSheet());
    }

    // #region editing

    undo(): Promise<boolean> {
        this._univerInstanceService.focusUniverInstance(this.id);
        return this._commandService.executeCommand(UndoCommand.id);
    }

    redo(): Promise<boolean> {
        this._univerInstanceService.focusUniverInstance(this.id);
        return this._commandService.executeCommand(RedoCommand.id);
    }

    // #endregion

    // #region callbacks

    /**
     * Register a callback that will be triggered before invoking a command targeting the Univer sheet.
     * @param callback the callback.
     * @returns A function to dispose the listening.
     */
    onBeforeCommandExecute(callback: CommandListener): IDisposable {
        return this._commandService.beforeCommandExecuted((command) => {
            if ((command as ICommandInfo<ISheetCommandSharedParams>).params?.unitId !== this.id) {
                return;
            }

            callback(command);
        });
    }

    /**
     * Register a callback that will be triggered when a command is invoked targeting the Univer sheet.
     * @param callback the callback.
     * @returns A function to dispose the listening.
     */
    onCommandExecuted(callback: CommandListener): IDisposable {
        return this._commandService.onCommandExecuted((command) => {
            if ((command as ICommandInfo<ISheetCommandSharedParams>).params?.unitId !== this.id) {
                return;
            }

            callback(command);
        });
    }

    onSelectionChange(callback: (selections: IRange[]) => void): IDisposable {
        return toDisposable(
            this._selectionManagerService.selectionMoveEnd$.subscribe((selections) => {
                if (this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId() !== this.id) {
                    return;
                }

                if (!selections?.length) {
                    callback([]);
                }

                // TODO@wzhudev: filtered out ranges changes not other currently sheet
                callback(selections!.map((s) => s.range));
            })
        );
    }

    // #region callbacks
}
