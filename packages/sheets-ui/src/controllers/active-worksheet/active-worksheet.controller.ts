import type { IMutationInfo, Workbook } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type {
    IInsertSheetMutationParams,
    IRemoveSheetMutationParams,
    ISetWorksheetActiveOperationParams,
    ISetWorksheetHideMutationParams,
} from '@univerjs/sheets';
import {
    InsertSheetMutation,
    RemoveSheetMutation,
    SetWorksheetActiveOperation,
    SetWorksheetHideMutation,
} from '@univerjs/sheets';

/**
 * This controller is responsible for changing the active worksheet when
 * worksheet tab related mutations executes. We cannot write this logic in
 * commands because it does not take collaborative editing into consideration.
 */
@OnLifecycle(LifecycleStages.Ready, ActiveWorksheetController)
export class ActiveWorksheetController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command, options) => {
                if (command.id === RemoveSheetMutation.id) {
                    return this._adjustActiveSheetOnRemoveSheet(command as IMutationInfo<IRemoveSheetMutationParams>);
                }
                if (
                    command.id === SetWorksheetHideMutation.id &&
                    (command.params as ISetWorksheetHideMutationParams).hidden
                ) {
                    return this._adjustActiveSheetOnHideSheet(
                        command as IMutationInfo<ISetWorksheetHideMutationParams>
                    );
                }

                // It is a mutation that we comes from the collaboration peer so we should not handle them.
                if (options?.local) {
                    return;
                }

                // We only handle the local mutations, for
                // * add / copy sheet
                // * set sheet visible
                if (command.id === InsertSheetMutation.id) {
                    return this._adjustActiveSheetOnInsertSheet(command as IMutationInfo<IInsertSheetMutationParams>);
                }
                if (
                    command.id === SetWorksheetHideMutation.id &&
                    !(command.params as ISetWorksheetHideMutationParams).hidden
                ) {
                    return this._adjustActiveSheetOnShowSheet(
                        command as IMutationInfo<ISetWorksheetHideMutationParams>
                    );
                }
            })
        );
    }

    private _adjustActiveSheetOnHideSheet(mutation: IMutationInfo<ISetWorksheetHideMutationParams>) {
        // If the active sheet is hidden, we need to change the active sheet to the next sheet.
        const { workbookId, worksheetId } = mutation.params;
        const workbook = this._univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) {
            return;
        }

        const activeSheet = workbook?.getRawActiveSheet();
        if (activeSheet !== worksheetId) {
            return;
        }

        const activeIndex = workbook.getActiveSheetIndex();
        const nextId = findTheNextUnhiddenSheet(workbook, activeIndex);

        this._switchToNextSheet(workbookId, nextId);
    }

    private _adjustActiveSheetOnRemoveSheet(mutation: IMutationInfo<IRemoveSheetMutationParams>) {
        // If the active sheet is removed, we need to change the active sheet to the previous sheet.
        // But how to decide which one is the previous sheet? We store the deleted sheet' index
        // in the `IRemoteSheetMutationParams` and use it to decide the previous sheet.

        // If the selected sheet is not the deleted one, we don't have to do things.
        const { previousIndex, workbookId } = mutation.params;
        const workbook = this._univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) {
            return;
        }

        // The deleted sheet is not the currently active sheet, we don't have to do things.
        const activeSheet = workbook.getRawActiveSheet();
        if (activeSheet) {
            return;
        }

        const nextIndex = previousIndex >= 1 ? previousIndex - 1 : 0;
        const nextSheet = workbook.getSheetByIndex(nextIndex);
        if (!nextSheet) {
            throw new Error('[ActiveWorksheetController]: cannot find the next sheet!');
        }

        this._switchToNextSheet(workbookId, nextSheet.getSheetId());
    }

    private _adjustActiveSheetOnInsertSheet(mutation: IMutationInfo<IInsertSheetMutationParams>) {
        // This is simple, just change the active sheet to the unhidden sheet.
        const { workbookId, sheet } = mutation.params;
        this._switchToNextSheet(workbookId, sheet.id);
    }

    private _adjustActiveSheetOnShowSheet(mutation: IMutationInfo<ISetWorksheetHideMutationParams>) {
        // This is simple, just change the active sheet to the unhidden sheet.
        const { workbookId, worksheetId } = mutation.params;
        this._switchToNextSheet(workbookId, worksheetId);
    }

    private _switchToNextSheet(workbookId: string, worksheetId: string): void {
        this._commandService.executeCommand(SetWorksheetActiveOperation.id, {
            workbookId,
            worksheetId,
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
