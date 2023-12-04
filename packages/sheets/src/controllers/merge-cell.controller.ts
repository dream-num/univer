import type { IMutationInfo, IRange, Workbook } from '@univerjs/core';
import {
    Disposable,
    DisposableCollection,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Rectangle,
    Tools,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import type {
    IAddWorksheetMergeMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../basics/interfaces/mutation-interface';
import { getAddMergeMutationRangeByType } from '../commands/commands/add-worksheet-merge.command';
import { ClearSelectionAllCommand } from '../commands/commands/clear-selection-all.command';
import { ClearSelectionFormatCommand } from '../commands/commands/clear-selection-format.command';
import type { IDeleteRangeMoveLeftCommandParams } from '../commands/commands/delete-range-move-left.command';
import { DeleteRangeMoveLeftCommand } from '../commands/commands/delete-range-move-left.command';
import type { IDeleteRangeMoveUpCommandParams } from '../commands/commands/delete-range-move-up.command';
import { DeleteRangeMoveUpCommand } from '../commands/commands/delete-range-move-up.command';
import type { InsertRangeMoveDownCommandParams } from '../commands/commands/insert-range-move-down.command';
import { InsertRangeMoveDownCommand } from '../commands/commands/insert-range-move-down.command';
import type { InsertRangeMoveRightCommandParams } from '../commands/commands/insert-range-move-right.command';
import { InsertRangeMoveRightCommand } from '../commands/commands/insert-range-move-right.command';
import type { IInsertColCommandParams, IInsertRowCommandParams } from '../commands/commands/insert-row-col.command';
import { InsertColCommand, InsertRowCommand } from '../commands/commands/insert-row-col.command';
import type { IMoveRangeCommandParams } from '../commands/commands/move-range.command';
import { MoveRangeCommand } from '../commands/commands/move-range.command';
import { RemoveColCommand, RemoveRowCommand } from '../commands/commands/remove-row-col.command';
import type { ISetWorksheetActivateCommandParams } from '../commands/commands/set-worksheet-activate.command';
import { SetWorksheetActivateCommand } from '../commands/commands/set-worksheet-activate.command';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
} from '../commands/mutations/add-worksheet-merge.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../commands/mutations/remove-worksheet-merge.mutation';
import { RefRangeService } from '../services/ref-range/ref-range.service';
import type { EffectRefRangeParams } from '../services/ref-range/type';
import { SelectionManagerService } from '../services/selection-manager.service';
import { SheetInterceptorService } from '../services/sheet-interceptor/sheet-interceptor.service';

@OnLifecycle(LifecycleStages.Steady, MergeCellController)
export class MergeCellController extends Disposable {
    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService
    ) {
        super();
        this._onRefRangeChange();
        this._initCommandInterceptor();
    }

    private _initCommandInterceptor() {
        const self = this;
        this._sheetInterceptorService.interceptCommand({
            getMutations(commandInfo) {
                switch (commandInfo.id) {
                    case ClearSelectionAllCommand.id:
                    case ClearSelectionFormatCommand.id: {
                        const workbook = self._univerInstanceService.getCurrentUniverSheetInstance();
                        const workbookId = workbook.getUnitId();
                        const worksheet = workbook.getActiveSheet();
                        const worksheetId = worksheet.getSheetId();
                        const mergeData = worksheet.getConfig().mergeData;
                        const selections = self._selectionManagerService.getSelectionRanges();
                        if (selections && selections.length > 0) {
                            const isHasMerge = selections.some((range) =>
                                mergeData.some((item) => Rectangle.intersects(item, range))
                            );
                            if (isHasMerge) {
                                const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
                                    workbookId,
                                    worksheetId,
                                    ranges: selections,
                                };
                                const undoRemoveMergeParams: IAddWorksheetMergeMutationParams =
                                    RemoveMergeUndoMutationFactory(self._injector, removeMergeParams);
                                const redos: IMutationInfo[] = [
                                    { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
                                ];
                                const undos: IMutationInfo[] = [
                                    { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeParams },
                                ];
                                return { redos, undos };
                            }
                        }
                    }
                }

                return { redos: [], undos: [] };
            },
        });
    }

    private _onRefRangeChange() {
        const disposableCollection = new DisposableCollection();
        const registerRefRange = (workbookId: string, worksheetId: string) => {
            const workbook = this._univerInstanceService.getUniverSheetInstance(workbookId);
            if (!workbook) {
                return;
            }
            const workSheet = workbook?.getSheetBySheetId(worksheetId);
            if (!workSheet) {
                return;
            }

            disposableCollection.dispose();
            const mergeData = workSheet.getMergeData();
            // Handles all merged unit tasks,if multiple range effect and called only once.
            const handler = (config: EffectRefRangeParams) => {
                switch (config.id) {
                    case MoveRangeCommand.id: {
                        const params = config.params as IMoveRangeCommandParams;
                        return this._handleMoveRangeCommand(params, workbookId, worksheetId);
                    }
                    case InsertRowCommand.id: {
                        const params = config.params as unknown as IInsertRowCommandParams;
                        const _workbookId = params.workbookId || workbookId;
                        const _worksheetId = params.worksheetId || worksheetId;
                        return this._handleInsertRowCommand(params, _workbookId, _worksheetId);
                    }
                    case InsertColCommand.id: {
                        const params = config.params as unknown as IInsertColCommandParams;
                        const _workbookId = params.workbookId || workbookId;
                        const _worksheetId = params.worksheetId || worksheetId;
                        return this._handleInsertColCommand(params, _workbookId, _worksheetId);
                    }
                    case RemoveColCommand.id: {
                        const params = config.params as unknown as IRemoveColMutationParams;
                        return this._handleRemoveColCommand(params, workbookId, worksheetId);
                    }
                    case RemoveRowCommand.id: {
                        const params = config.params as unknown as IRemoveRowsMutationParams;
                        return this._handleRemoveRowCommand(params, workbookId, worksheetId);
                    }
                    case InsertRangeMoveRightCommand.id: {
                        const params = config.params as unknown as InsertRangeMoveRightCommandParams;
                        return this._handleInsertRangeMoveRightCommand(params, workbookId, worksheetId);
                    }
                    case InsertRangeMoveDownCommand.id: {
                        const params = config.params as unknown as InsertRangeMoveDownCommandParams;
                        return this._handleInsertRangeMoveDownCommand(params, workbookId, worksheetId);
                    }
                    case DeleteRangeMoveUpCommand.id: {
                        const params = config.params as unknown as IDeleteRangeMoveUpCommandParams;
                        return this._handleDeleteRangeMoveUpCommand(params, workbookId, worksheetId);
                    }
                    case DeleteRangeMoveLeftCommand.id: {
                        const params = config.params as unknown as IDeleteRangeMoveLeftCommandParams;
                        return this._handleDeleteRangeMoveLeftCommand(params, workbookId, worksheetId);
                    }
                }
                return { redos: [], undos: [] };
            };
            mergeData.forEach((range) => {
                disposableCollection.add(
                    this._refRangeService.registerRefRange(range, handler, workbookId, worksheetId)
                );
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
    }

    private _handleMoveRangeCommand(params: IMoveRangeCommandParams, workbookId: string, worksheetId: string) {
        const workbook = getWorkbook(this._univerInstanceService, workbookId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, worksheetId);
        if (!worksheet) {
            return this._handleNull();
        }
        const mergeData = worksheet.getMergeData();
        const fromMergeRanges = mergeData.filter((item) => Rectangle.intersects(item, params.fromRange));
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

    private _handleInsertRowCommand(config: IInsertRowCommandParams, workbookId: string, worksheetId: string) {
        const workbook = getWorkbook(this._univerInstanceService, workbookId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, worksheetId);
        if (!worksheet) {
            return this._handleNull();
        }
        const { range } = config;
        const { startRow, endRow } = range;
        const oldMergeCells = Tools.deepClone(worksheet.getMergeData());
        const newMergeCells = Tools.deepClone(worksheet.getMergeData()).map((mergedCell: IRange) => {
            const count = endRow - startRow + 1;
            if (startRow > mergedCell.endRow) {
                return mergedCell;
            }
            if (startRow <= mergedCell.startRow) {
                return Rectangle.moveVertical(mergedCell, count);
            }
            mergedCell.endRow += count;

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

    private _handleInsertColCommand(config: IInsertColCommandParams, workbookId: string, worksheetId: string) {
        const { range } = config;
        const workbook = getWorkbook(this._univerInstanceService, workbookId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, worksheetId);
        if (!worksheet) {
            return this._handleNull();
        }
        const { startColumn, endColumn } = range;
        const oldMergeCells = Tools.deepClone(worksheet.getMergeData());
        const newMergeCells = Tools.deepClone(worksheet.getMergeData()).map((mergedCell: IRange) => {
            const count = endColumn - startColumn + 1;
            if (startColumn > mergedCell.endColumn) {
                return mergedCell;
            }
            if (startColumn <= mergedCell.startColumn) {
                return Rectangle.moveHorizontal(mergedCell, count);
            }
            mergedCell.endColumn += count;

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

    private _handleRemoveColCommand(config: IRemoveColMutationParams, workbookId: string, worksheetId: string) {
        const workbook = getWorkbook(this._univerInstanceService, workbookId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, worksheetId);
        if (!worksheet) {
            return this._handleNull();
        }
        const { ranges } = config;
        const mergeData: IRange[] = Tools.deepClone(worksheet.getMergeData());
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
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeMutationParams
        );
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

    private _handleRemoveRowCommand(config: IRemoveRowsMutationParams, workbookId: string, worksheetId: string) {
        const { ranges } = config;
        const workbook = getWorkbook(this._univerInstanceService, workbookId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, worksheetId);
        if (!worksheet) {
            return this._handleNull();
        }
        const mergeData: IRange[] = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergeData.length; i++) {
            const merge = mergeData[i];
            const { startRow: mergeStartRow, endRow: mergeEndRow } = merge;
            const mergedCellRowCount = mergeEndRow - mergeStartRow + 1;
            for (let j = 0; j < ranges.length; j++) {
                const { startRow, endRow } = ranges[j];
                const count = endRow - startRow + 1;
                if (endRow < mergeStartRow) {
                    merge.startRow -= count;
                    merge.endRow -= count;
                } else if (startRow > mergeEndRow) {
                    continue;
                } else if (startRow <= mergeStartRow && endRow >= mergeEndRow) {
                    mergeData.splice(i, 1);
                    i--;
                } else {
                    const intersects = Rectangle.getIntersects(ranges[j], merge)!;
                    const interLength = intersects.endRow - intersects.startRow + 1;
                    if (interLength === mergedCellRowCount - 1) {
                        mergeData.splice(i, 1);
                        i--;
                    } else {
                        merge.endRow -= intersects.endRow - intersects.startRow + 1;
                    }
                }
            }
        }
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeMutationParams
        );
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

    private _handleInsertRangeMoveRightCommand(
        config: InsertRangeMoveRightCommandParams,
        workbookId: string,
        worksheetId: string
    ) {
        const workbook = getWorkbook(this._univerInstanceService, workbookId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, worksheetId);
        if (!worksheet) {
            return this._handleNull();
        }
        const ranges = config.ranges;
        const maxCol = worksheet.getMaxColumns() - 1;
        const mergeData = worksheet.getMergeData();
        const removeMergeData: IRange[] = [];
        const addMergeData: IRange[] = [];
        mergeData.forEach((rect) => {
            for (let i = 0; i < ranges.length; i++) {
                const { startRow, endRow, startColumn, endColumn } = ranges[i];
                const intersects = Rectangle.intersects(
                    {
                        startRow,
                        startColumn,
                        endRow,
                        endColumn: maxCol,
                    },
                    rect
                );
                if (intersects) {
                    removeMergeData.push(rect);
                    const contains = Rectangle.contains(
                        {
                            startRow,
                            startColumn,
                            endRow,
                            endColumn: maxCol,
                        },
                        rect
                    );
                    if (contains) {
                        const currentColumnsCount = endColumn - startColumn + 1;
                        addMergeData.push({
                            startRow: rect.startRow,
                            startColumn: rect.startColumn + currentColumnsCount,
                            endRow: rect.endRow,
                            endColumn: rect.endColumn + currentColumnsCount,
                        });
                        break;
                    }
                }
            }
        });
        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: removeMergeData,
        };
        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeParams
        );
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: addMergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,
            addMergeParams
        );
        return {
            redos: [
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
                {
                    id: AddWorksheetMergeMutation.id,
                    params: addMergeParams,
                },
            ],
            undos: [
                {
                    id: AddWorksheetMergeMutation.id,
                    params: undoRemoveMergeParams,
                },
                { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
            ],
        };
    }

    private _handleInsertRangeMoveDownCommand(
        config: InsertRangeMoveDownCommandParams,
        workbookId: string,
        worksheetId: string
    ) {
        const workbook = getWorkbook(this._univerInstanceService, workbookId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, worksheetId);
        if (!worksheet) {
            return this._handleNull();
        }
        const ranges = config.ranges;
        const maxRow = worksheet.getMaxRows() - 1;
        const mergeData = worksheet.getMergeData();
        const removeMergeData: IRange[] = [];
        const addMergeData: IRange[] = [];
        mergeData.forEach((rect) => {
            for (let i = 0; i < ranges.length; i++) {
                const { startRow, startColumn, endColumn, endRow } = ranges[i];
                const intersects = Rectangle.intersects({ startRow, startColumn, endRow: maxRow, endColumn }, rect);
                if (intersects) {
                    removeMergeData.push(rect);
                    const contains = Rectangle.contains({ startRow, startColumn, endRow: maxRow, endColumn }, rect);
                    if (contains) {
                        const rowCount = endRow - startRow + 1;
                        addMergeData.push({
                            startRow: rect.startRow + rowCount,
                            startColumn: rect.startColumn,
                            endRow: rect.endRow + rowCount,
                            endColumn: rect.endColumn,
                        });
                        break;
                    }
                }
            }
        });
        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: removeMergeData,
        };
        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeParams
        );
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: addMergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,

            addMergeParams
        );
        const redos = [
            {
                id: RemoveWorksheetMergeMutation.id,
                params: removeMergeParams,
            },
            {
                id: AddWorksheetMergeMutation.id,
                params: addMergeParams,
            },
        ];
        const undos = [
            {
                id: AddWorksheetMergeMutation.id,
                params: undoRemoveMergeParams,
            },
            {
                id: RemoveWorksheetMergeMutation.id,
                params: undoAddMergeParams,
            },
        ];
        return { redos, undos };
    }

    private _handleDeleteRangeMoveUpCommand(
        config: IDeleteRangeMoveUpCommandParams,
        workbookId: string,
        worksheetId: string
    ) {
        const workbook = getWorkbook(this._univerInstanceService, workbookId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, worksheetId);
        if (!worksheet) {
            return this._handleNull();
        }
        const ranges = config.ranges;
        const maxRow = worksheet.getMaxRows() - 1;
        const mergeData = worksheet.getMergeData();
        const removeMergeData: IRange[] = [];
        const addMergeData: IRange[] = [];
        mergeData.forEach((rect) => {
            for (let i = 0; i < ranges.length; i++) {
                const { startRow, startColumn, endColumn, endRow } = ranges[i];
                const intersects = Rectangle.intersects({ startRow, startColumn, endRow: maxRow, endColumn }, rect);
                if (intersects) {
                    removeMergeData.push(rect);
                    const contains = Rectangle.contains({ startRow, startColumn, endRow: maxRow, endColumn }, rect);
                    if (contains) {
                        const rowCount = endRow - startRow + 1;
                        const range = Rectangle.moveVertical(rect, -rowCount);
                        addMergeData.push(range);
                        break;
                    }
                }
            }
        });
        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: removeMergeData,
        };
        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeParams
        );
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: addMergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,
            addMergeParams
        );
        const redos = [
            {
                id: RemoveWorksheetMergeMutation.id,
                params: removeMergeParams,
            },
            {
                id: AddWorksheetMergeMutation.id,
                params: addMergeParams,
            },
        ];
        const undos = [
            {
                id: AddWorksheetMergeMutation.id,
                params: undoRemoveMergeParams,
            },
            {
                id: RemoveWorksheetMergeMutation.id,
                params: undoAddMergeParams,
            },
        ];
        return { redos, undos };
    }

    private _handleDeleteRangeMoveLeftCommand(
        config: IDeleteRangeMoveLeftCommandParams,
        workbookId: string,
        worksheetId: string
    ) {
        const workbook = getWorkbook(this._univerInstanceService, workbookId);
        if (!workbook) {
            return this._handleNull();
        }
        const worksheet = getWorksheet(workbook, worksheetId);
        if (!worksheet) {
            return this._handleNull();
        }
        const ranges = config.ranges;
        const maxCol = worksheet.getMaxColumns() - 1;
        const mergeData = worksheet.getMergeData();
        const removeMergeData: IRange[] = [];
        const addMergeData: IRange[] = [];
        mergeData.forEach((rect) => {
            for (let i = 0; i < ranges.length; i++) {
                const { startRow, endRow, startColumn, endColumn } = ranges[i];
                const intersects = Rectangle.intersects(
                    {
                        startRow,
                        startColumn,
                        endRow,
                        endColumn: maxCol,
                    },
                    rect
                );
                if (intersects) {
                    removeMergeData.push(rect);
                    const contains = Rectangle.contains(
                        {
                            startRow,
                            startColumn,
                            endRow,
                            endColumn: maxCol,
                        },
                        rect
                    );
                    if (contains) {
                        const currentColumnsCount = endColumn - startColumn + 1;
                        addMergeData.push({
                            startRow: rect.startRow,
                            startColumn: rect.startColumn - currentColumnsCount,
                            endRow: rect.endRow,
                            endColumn: rect.endColumn - currentColumnsCount,
                        });
                        break;
                    }
                }
            }
        });
        const removeMergeParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: removeMergeData,
        };
        const undoRemoveMergeParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            this._injector,
            removeMergeParams
        );
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: addMergeData,
        };
        const undoAddMergeParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            this._injector,
            addMergeParams
        );
        return {
            redos: [
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeParams },
                {
                    id: AddWorksheetMergeMutation.id,
                    params: addMergeParams,
                },
            ],
            undos: [
                {
                    id: AddWorksheetMergeMutation.id,
                    params: undoRemoveMergeParams,
                },
                { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
            ],
        };
    }

    private _handleNull() {
        return { redos: [], undos: [] };
    }
}

function getWorkbook(univerInstanceService: IUniverInstanceService, workbookId?: string) {
    if (workbookId) {
        return univerInstanceService.getUniverSheetInstance(workbookId);
    }
    return univerInstanceService.getCurrentUniverSheetInstance();
}

function getWorksheet(workbook: Workbook, worksheetId?: string) {
    if (worksheetId) {
        return workbook.getSheetBySheetId(worksheetId);
    }
    return workbook.getActiveSheet();
}
