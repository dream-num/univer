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
import { Subscription } from 'rxjs';
import type { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../basics/interfaces/mutation-interface';
import type { ISetWorksheetHideMutationParams } from '../commands/mutations/set-worksheet-hide.mutation';
import type { ISetWorksheetOrderMutationParams } from '../commands/mutations/set-worksheet-order.mutation';
import type { ISetSelectionsOperationParams } from '../commands/operations/selection.operation';
import type { ISetWorksheetActiveOperationParams } from '../commands/operations/set-worksheet-active.operation';
import { InsertSheetMutation } from '../commands/mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../commands/mutations/remove-sheet.mutation';
import { SetWorksheetHideMutation } from '../commands/mutations/set-worksheet-hide.mutation';
import { SetWorksheetOrderMutation } from '../commands/mutations/set-worksheet-order.mutation';
import { SetSelectionsOperation } from '../commands/operations/selection.operation';
import { SetWorksheetActiveOperation } from '../commands/operations/set-worksheet-active.operation';

/**
 * This controller is responsible for changing the active worksheet when
 * worksheet lifecycle and tab mutations execute. Model-level removals also
 * occur inside atomic mutations, including collaborative replay.
 */
export class ActiveWorksheetController extends Disposable {
    private readonly _workbookSubscriptions = new Map<Workbook, Subscription>();
    private readonly _sheetOrders = new Map<Workbook, readonly string[]>();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this.disposeWithMe(this._commandService.beforeCommandExecuted((command) => {
            if (command.id === RemoveSheetMutation.id) {
                return this._beforeAdjustActiveSheetOnRemoveSheet(
                    command as IMutationInfo<IRemoveSheetMutationParams>
                );
            }
        }));

        this.disposeWithMe(this._commandService.onCommandExecuted((command, options) => {
            if (command.id === SetWorksheetOrderMutation.id) {
                const { unitId } = command.params as ISetWorksheetOrderMutationParams;
                const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                if (workbook) {
                    this._sheetOrders.set(workbook, workbook.getSheetOrders().slice());
                }
            }

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

        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .forEach((workbook) => this._watchWorkbook(workbook));
        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .subscribe(({ unit }) => this._watchWorkbook(unit)));
        this.disposeWithMe(this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .subscribe((workbook) => {
                this._workbookSubscriptions.get(workbook)?.unsubscribe();
                this._workbookSubscriptions.delete(workbook);
                this._sheetOrders.delete(workbook);
            }));
        this.disposeWithMe(() => {
            this._workbookSubscriptions.forEach((subscription) => subscription.unsubscribe());
            this._workbookSubscriptions.clear();
            this._sheetOrders.clear();
        });
    }

    private _watchWorkbook(workbook: Workbook): void {
        this._sheetOrders.set(workbook, workbook.getSheetOrders().slice());
        const subscription = new Subscription();
        subscription.add(workbook.sheetCreated$.subscribe(() => {
            this._sheetOrders.set(workbook, workbook.getSheetOrders().slice());
        }));
        subscription.add(workbook.sheetDisposed$.subscribe((worksheet) => {
            const removedIndex = this._sheetOrders.get(workbook)!.indexOf(worksheet.getSheetId());
            this._sheetOrders.set(workbook, workbook.getSheetOrders().slice());
            if (workbook.getActiveSheet()?.getSheetId() !== worksheet.getSheetId() || !workbook.getSheetSize()) {
                return;
            }
            const nextId = findTheNextUnhiddenSheet(workbook, Math.max(removedIndex - 1, 0));
            this._switchToNextSheet(workbook.getUnitId(), nextId);
        }));
        this._workbookSubscriptions.set(workbook, subscription);
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

    private _beforeAdjustActiveSheetOnRemoveSheet(mutation: IMutationInfo<IRemoveSheetMutationParams>) {
        const { unitId, subUnitId } = mutation.params;
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return;
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return;
        }

        this._sheetOrders.set(workbook, workbook.getSheetOrders().slice());
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

function findTheNextUnhiddenSheet(workbook: Workbook, startIndex: number): string {
    const countOfSheets = workbook.getSheetSize();

    // First look to 0 index, then look to the end.
    for (let i = startIndex; i > -1; i--) {
        const sheet = workbook.getSheetByIndex(i)!;
        if (!sheet.getConfig().hidden) {
            return sheet.getSheetId();
        }
    }

    for (let i = startIndex; i < countOfSheets; i++) {
        const sheet = workbook.getSheetByIndex(i)!;
        if (!sheet.getConfig().hidden) {
            return sheet.getSheetId();
        }
    }

    throw new Error(
        '[ActiveWorksheetController]: could not find the next unhidden sheet! Collaboration error perhaps.'
    );
}
