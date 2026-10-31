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

import type { IMutationInfo, IOperationInfo, Workbook } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../basics';
import type { ISetWorksheetHideMutationParams } from '../commands/mutations/set-worksheet-hide.mutation';
import type { ISetSelectionsOperationParams } from '../commands/operations/selection.operation';
import type { ISetWorksheetActiveOperationParams } from '../commands/operations/set-worksheet-active.operation';
import { InsertSheetMutation } from '../commands/mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../commands/mutations/remove-sheet.mutation';
import { SetWorksheetHideMutation } from '../commands/mutations/set-worksheet-hide.mutation';
import { SetSelectionsOperation } from '../commands/operations/selection.operation';
import { SetWorksheetActiveOperation } from '../commands/operations/set-worksheet-active.operation';

/**
 * This controller is responsible for changing the active worksheet when
 * worksheet tab related mutations executes. We cannot write this logic in
 * commands because it does not take collaborative editing into consideration.
 */
export class ActiveWorksheetController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this.disposeWithMe(this._commandService.beforeCommandExecuted((command) => {
            if (command.id === RemoveSheetMutation.id) {
                return this._adjustActiveSheetBeforeRemoveSheet(
                    command as IMutationInfo<IRemoveSheetMutationParams>
                );
            }
        }));

        this.disposeWithMe(this._commandService.onCommandExecuted((command, options) => {
            if (command.id === SetWorksheetHideMutation.id && (command.params as ISetWorksheetHideMutationParams).hidden) {
                return this._adjustActiveSheetOnHideSheet(command as IMutationInfo<ISetWorksheetHideMutationParams>);
            }

            // It is a mutation that we comes from the collaboration peer so we should not handle them.
            if (options?.fromCollab) return false;

            // We only handle the local mutations, for
            // * add / copy sheet
            // * set sheet visible
            if (command.id === InsertSheetMutation.id) {
                return this._adjustActiveSheetOnInsertSheet(command as IMutationInfo<IInsertSheetMutationParams>);
            }

            if (command.id === SetWorksheetHideMutation.id && !(command.params as ISetWorksheetHideMutationParams).hidden) {
                return this._adjustActiveSheetOnShowSheet(command as IMutationInfo<ISetWorksheetHideMutationParams>);
            }

            if (command.id === SetSelectionsOperation.id) {
                return this._adjustActiveSheetOnSelection(command as IOperationInfo<ISetSelectionsOperationParams>);
            }
        }));
    }

    private _adjustActiveSheetOnHideSheet(mutation: IMutationInfo<ISetWorksheetHideMutationParams>) {
        // If the active sheet is hidden, we need to change the active sheet to the next sheet.
        const { unitId, subUnitId } = mutation.params;
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return;
        }

        const activeSheet = workbook.getActiveSheet()?.getSheetId();
        if (activeSheet !== subUnitId) {
            return;
        }

        const activeIndex = workbook.getActiveSheetIndex();
        const nextId = findTheNextUnhiddenSheet(workbook, activeIndex);

        this._switchToNextSheet(unitId, nextId);
    }

    private _adjustActiveSheetBeforeRemoveSheet(mutation: IMutationInfo<IRemoveSheetMutationParams>) {
        const { unitId, subUnitId } = mutation.params;
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return;
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return;
        }

        if (workbook.getActiveSheet(true)?.getSheetId() !== subUnitId) {
            return;
        }

        const previousIndex = workbook.getSheetIndex(worksheet);
        const nextIndex = previousIndex >= 1 ? previousIndex - 1 : 0;
        const nextId = findTheNextUnhiddenSheet(workbook, nextIndex, subUnitId);
        // Switch before sheet disposal removes its permission points, while observers can still read the active sheet.
        this._commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId, subUnitId: nextId });
    }

    private _adjustActiveSheetOnInsertSheet(mutation: IMutationInfo<IInsertSheetMutationParams>) {
        // This is simple, just change the active sheet to the unhidden sheet.
        const { unitId, sheet } = mutation.params;
        this._switchToNextSheet(unitId, sheet.id);
    }

    private _adjustActiveSheetOnShowSheet(mutation: IMutationInfo<ISetWorksheetHideMutationParams>) {
        // This is simple, just change the active sheet to the unhidden sheet.
        const { unitId, subUnitId } = mutation.params;
        this._switchToNextSheet(unitId, subUnitId);
    }

    private _adjustActiveSheetOnSelection(operation: IOperationInfo<ISetSelectionsOperationParams>) {
        const { unitId, subUnitId } = operation.params;
        if (subUnitId !== this._univerInstanceService.getUnit<Workbook>(unitId)?.getActiveSheet().getSheetId()) {
            this._switchToNextSheet(unitId, subUnitId);
        }
    }

    private _switchToNextSheet(unitId: string, subUnitId: string): void {
        this._commandService.executeCommand(SetWorksheetActiveOperation.id, {
            unitId,
            subUnitId,
        } as ISetWorksheetActiveOperationParams);
    }
}

function findTheNextUnhiddenSheet(workbook: Workbook, startIndex: number, excludedSheetId?: string): string {
    const countOfSheets = workbook.getSheetSize();

    // First look to 0 index, then look to the end.
    for (let i = startIndex; i > -1; i--) {
        const sheet = workbook.getSheetByIndex(i)!;
        if (sheet.getSheetId() !== excludedSheetId && !sheet.getConfig().hidden) {
            return sheet.getSheetId();
        }
    }

    for (let i = startIndex; i < countOfSheets; i++) {
        const sheet = workbook.getSheetByIndex(i)!;
        if (sheet.getSheetId() !== excludedSheetId && !sheet.getConfig().hidden) {
            return sheet.getSheetId();
        }
    }

    throw new Error(
        '[ActiveWorksheetController]: could not find the next unhidden sheet! Collaboration error perhaps.'
    );
}
