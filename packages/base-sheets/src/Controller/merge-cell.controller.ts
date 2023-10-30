import {
    Disposable,
    ICommandService,
    IRange,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Rectangle,
    Tools,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../Basics/Interfaces/MutationInterface';
import { getAddMergeMutationRangeByType } from '../commands/commands/add-worksheet-merge.command';
import {
    IInsertColCommandParams,
    IInsertRowCommandParams,
    InsertColCommand,
    InsertRowCommand,
} from '../commands/commands/insert-row-col.command';
import { IMoveRangeCommandParams, MoveRangeCommand } from '../commands/commands/move-range.command';
import {
    RemoveColCommand,
    RemoveRowColCommandParams,
    RemoveRowCommand,
} from '../commands/commands/remove-row-col.command';
import {
    ISetWorksheetActivateCommandParams,
    SetWorksheetActivateCommand,
} from '../commands/commands/set-worksheet-activate.command';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
} from '../commands/mutations/add-worksheet-merge.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../commands/mutations/remove-worksheet-merge.mutation';
import { EffectParams, RefRangeService } from '../services/ref-range.service';
import { SelectionManagerService } from '../services/selection/selection-manager.service';

@OnLifecycle(LifecycleStages.Steady, MergeCellController)
export class MergeCellController extends Disposable {
    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(Injector) private _injector: Injector
    ) {
        super();
        this._onRefRangeChange();
    }

    private _onRefRangeChange = () => {
        const disposable = new Disposable();
        const registerRefRange = (workbookId: string, sheetId: string) => {
            const workbook = this._univerInstanceService.getUniverSheetInstance(workbookId);
            if (!workbook) {
                return;
            }
            const workSheet = workbook?.getSheetBySheetId(sheetId);
            if (!workSheet) {
                return;
            }
            disposable.dispose();
            const mergeData = workSheet.getMergeData();
            // Handles all merged unit tasks,if multiple range effect and called only once.
            const handler = (config: EffectParams) => {
                switch (config.id) {
                    case MoveRangeCommand.id: {
                        const params = config.params as IMoveRangeCommandParams;
                        const workbookId = workbook.getUnitId();
                        const worksheetId = workSheet.getSheetId();
                        const mergeData = workSheet.getMergeData();
                        const fromMergeRanges = mergeData.filter((item) =>
                            Rectangle.intersects(item, params.fromRange)
                        );
                        const toMergeRanges = mergeData.filter((item) => Rectangle.intersects(item, params.toRange));

                        const willMoveToMergeRanges = fromMergeRanges
                            .map((mergeRange) => Rectangle.getRelativeRange(mergeRange, params.fromRange))
                            .map((relativeRange) => Rectangle.getPositionRange(relativeRange, params.toRange));

                        const addMergeCellRanges = getAddMergeMutationRangeByType(willMoveToMergeRanges).filter(
                            (range) => !mergeData.some((mergeRange) => Rectangle.equals(range, mergeRange))
                        );

                        const redos: Array<{
                            id: string;
                            params: IAddWorksheetMergeMutationParams | IRemoveWorksheetMergeMutationParams;
                        }> = [
                            {
                                id: RemoveWorksheetMergeMutation.id,
                                params: {
                                    workbookId,
                                    worksheetId,
                                    ranges: fromMergeRanges,
                                },
                            },
                            {
                                id: RemoveWorksheetMergeMutation.id,
                                params: {
                                    workbookId,
                                    worksheetId,
                                    ranges: toMergeRanges,
                                },
                            },
                            {
                                id: AddWorksheetMergeMutation.id,
                                params: {
                                    workbookId,
                                    worksheetId,
                                    ranges: addMergeCellRanges,
                                },
                            },
                        ];
                        const undos: Array<{
                            id: string;
                            params: IAddWorksheetMergeMutationParams | IRemoveWorksheetMergeMutationParams;
                        }> = [
                            {
                                id: RemoveWorksheetMergeMutation.id,
                                params: {
                                    workbookId,
                                    worksheetId,
                                    ranges: addMergeCellRanges,
                                },
                            },
                            {
                                id: AddWorksheetMergeMutation.id,
                                params: {
                                    workbookId,
                                    worksheetId,
                                    ranges: toMergeRanges,
                                },
                            },
                            {
                                id: AddWorksheetMergeMutation.id,
                                params: {
                                    workbookId,
                                    worksheetId,
                                    ranges: fromMergeRanges,
                                },
                            },
                        ];
                        return { redos, undos };
                    }
                    case InsertRowCommand.id: {
                        const { range, workbookId, worksheetId } = config.params as unknown as IInsertRowCommandParams;
                        const { startRow, endRow } = range;
                        const oldMergeCells = Tools.deepClone(workSheet.getMergeData());
                        const newMergeCells = Tools.deepClone(workSheet.getMergeData()).map((mergedCell: IRange) => {
                            const count = endRow - startRow + 1;
                            if (startRow > mergedCell.endRow) {
                                return mergedCell;
                            }
                            if (startRow <= mergedCell.startRow) {
                                mergedCell.startRow += count;
                                mergedCell.endRow += count;
                            } else {
                                mergedCell.endRow += count;
                            }
                            return mergedCell;
                        });

                        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
                            workbookId,
                            worksheetId,
                            ranges: oldMergeCells,
                        };
                        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
                            this._injector,
                            removeMergeParams
                        );
                        const addMergeParams: IAddWorksheetMergeMutationParams = {
                            workbookId,
                            worksheetId,
                            ranges: newMergeCells,
                        };
                        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
                            this._injector,
                            addMergeParams
                        );
                        const redos = [
                            { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
                            { id: AddWorksheetMergeMutation.id, params: addMergeParams },
                        ];
                        const undos = [
                            { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
                            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeParams },
                        ];
                        return { redos, undos };
                    }
                    case InsertColCommand.id: {
                        const { range, workbookId, worksheetId } = config.params as unknown as IInsertColCommandParams;
                        const { startColumn, endColumn } = range;
                        const oldMergeCells = Tools.deepClone(workSheet.getMergeData());
                        const newMergeCells = Tools.deepClone(workSheet.getMergeData()).map((mergedCell: IRange) => {
                            const count = endColumn - startColumn + 1;
                            if (startColumn > mergedCell.endColumn) {
                                return mergedCell;
                            }
                            if (startColumn <= mergedCell.startColumn) {
                                mergedCell.startColumn += count;
                                mergedCell.endColumn += count;
                            } else {
                                mergedCell.endColumn += count;
                            }
                            return mergedCell;
                        });

                        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
                            workbookId,
                            worksheetId,
                            ranges: oldMergeCells,
                        };
                        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
                            this._injector,
                            removeMergeParams
                        );
                        const addMergeParams: IAddWorksheetMergeMutationParams = {
                            workbookId,
                            worksheetId,
                            ranges: newMergeCells,
                        };
                        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
                            this._injector,
                            addMergeParams
                        );
                        const redos = [
                            { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
                            { id: AddWorksheetMergeMutation.id, params: addMergeParams },
                        ];
                        const undos = [
                            { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
                            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeParams },
                        ];
                        return { redos, undos };
                    }
                    case RemoveColCommand.id: {
                        let ranges = (config.params as unknown as RemoveRowColCommandParams)?.ranges;
                        const worksheetId = workSheet.getSheetId();

                        if (!ranges) {
                            if (!ranges) {
                                const selections = this._selectionManagerService.getSelections();
                                if (!selections?.length) {
                                    break;
                                }
                                ranges = selections.map((s) => Rectangle.clone(s.range));
                            }
                        }
                        const mergeData: IRange[] = Tools.deepClone(workSheet.getMergeData());
                        for (let i = 0; i < mergeData.length; i++) {
                            const merge = mergeData[i];
                            const { startColumn: mergeStartColumn, endColumn: mergeEndColumn } = merge;
                            const mergedCellColumnCount = mergeEndColumn - mergeStartColumn + 1;
                            for (let j = 0; j < ranges.length; j++) {
                                const { startColumn, endColumn } = ranges[j];
                                const count = endColumn - startColumn + 1;
                                if (endColumn < merge.startColumn) {
                                    merge.startColumn -= count;
                                    merge.endColumn -= count;
                                } else if (startColumn > merge.endColumn) {
                                    continue;
                                } else if (startColumn <= merge.startColumn && endColumn >= merge.endColumn) {
                                    mergeData.splice(i, 1);
                                    i--;
                                } else {
                                    const intersects = Rectangle.getIntersects(ranges[j], merge)!;
                                    const interLength = intersects.endColumn - intersects.startColumn + 1;

                                    if (interLength === mergedCellColumnCount - 1) {
                                        mergeData.splice(i, 1);
                                        i--;
                                    } else {
                                        merge.endColumn -= intersects.endColumn - intersects.startColumn + 1;
                                    }
                                }
                            }
                        }
                        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
                            workbookId,
                            worksheetId,
                            ranges: Tools.deepClone(workSheet.getMergeData()),
                        };
                        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams =
                            RemoveMergeUndoMutationFactory(this._injector, removeMergeMutationParams);
                        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
                            workbookId,
                            worksheetId,
                            ranges: mergeData,
                        };
                        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
                            this._injector,
                            addMergeMutationParams
                        );
                        const redos = [
                            { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                            { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
                        ];
                        const undos = [
                            { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
                            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
                        ];
                        return { redos, undos };
                    }
                    case RemoveRowCommand.id: {
                        let ranges = (config.params as unknown as RemoveRowColCommandParams)?.ranges;
                        const worksheetId = workSheet.getSheetId();

                        if (!ranges) {
                            if (!ranges) {
                                const selections = this._selectionManagerService.getSelections();
                                if (!selections?.length) {
                                    break;
                                }
                                ranges = selections.map((s) => Rectangle.clone(s.range));
                            }
                        }
                        const mergeData: IRange[] = Tools.deepClone(workSheet.getMergeData());
                        for (let i = 0; i < mergeData.length; i++) {
                            const merge = mergeData[i];
                            const { startRow: mergeStartRow, endRow: mergeEndRow } = merge;
                            const mergedCellRowCount = mergeEndRow - mergeStartRow + 1;
                            for (let j = 0; j < ranges.length; j++) {
                                const { startRow, endRow } = ranges[j];
                                const count = endRow - startRow + 1;
                                if (endRow < mergeStartRow) {
                                    // this merged cell should be moved up
                                    merge.startRow -= count;
                                    merge.endRow -= count;
                                } else if (startRow > mergeEndRow) {
                                    // this merged cell would not be affected
                                    continue;
                                } else if (startRow <= mergeStartRow && endRow >= mergeEndRow) {
                                    // this merged cell should be removed
                                    mergeData.splice(i, 1);
                                    i--;
                                } else {
                                    const intersects = Rectangle.getIntersects(ranges[j], merge)!;
                                    const interLength = intersects.endRow - intersects.startRow + 1;

                                    if (interLength === mergedCellRowCount - 1) {
                                        // if the merged cell's row count is reduced to 1 we should remove it as a merged cell
                                        mergeData.splice(i, 1);
                                        i--;
                                    } else {
                                        // otherwise we only need to shrink the merged cell's row count
                                        merge.endRow -= intersects.endRow - intersects.startRow + 1;
                                    }
                                }
                            }
                        }
                        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
                            workbookId,
                            worksheetId,
                            ranges: Tools.deepClone(workSheet.getMergeData()),
                        };
                        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams =
                            RemoveMergeUndoMutationFactory(this._injector, removeMergeMutationParams);
                        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
                            workbookId,
                            worksheetId,
                            ranges: mergeData,
                        };
                        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
                            this._injector,
                            addMergeMutationParams
                        );
                        const redos = [
                            { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                            { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
                        ];
                        const undos = [
                            { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
                            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
                        ];
                        return { redos, undos };
                    }
                }
                return { redos: [], undos: [] };
            };
            mergeData.forEach((range) => {
                disposable.disposeWithMe(this._refRangeService.registerRefRange(range, handler));
            });
        };
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetActivateCommand.id) {
                    const params = commandInfo.params as ISetWorksheetActivateCommandParams;
                    const sheetId = params.worksheetId;
                    const workbookId = params.workbookId;
                    if (!sheetId || !workbookId) {
                        return;
                    }
                    registerRefRange(workbookId, sheetId);
                }
                if (commandInfo.id === AddWorksheetMergeMutation.id) {
                    const params = commandInfo.params as IAddWorksheetMergeMutationParams;
                    const sheetId = params.worksheetId;
                    const workbookId = params.workbookId;
                    if (!sheetId || !workbookId) {
                        return;
                    }
                    registerRefRange(params.workbookId, params.worksheetId);
                }
            })
        );

        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        registerRefRange(workbook.getUnitId(), sheet.getSheetId());
    };
}
