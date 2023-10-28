import {
    Disposable,
    ICommandService,
    IRange,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Rectangle,
    toDisposable,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../Basics/Interfaces/MutationInterface';
import { getAddMergeMutationRange } from '../commands/commands/add-worksheet-merge.command';
import { IMoveRangeCommandParams, MoveRangeCommand } from '../commands/commands/move-range.command';
import {
    ISetWorksheetActivateCommandParams,
    SetWorksheetActivateCommand,
} from '../commands/commands/set-worksheet-activate.command';
import { AddWorksheetMergeMutation } from '../commands/mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation } from '../commands/mutations/remove-worksheet-merge.mutation';
import { EffectParams, RefRangeService } from '../services/ref-range.service';
import { SelectionManagerService } from '../services/selection/selection-manager.service';
import { ISelectionRenderService } from '../services/selection/selection-render.service';

@OnLifecycle(LifecycleStages.Steady, MoveRangeController)
export class MoveRangeController extends Disposable {
    constructor(
        @Inject(ISelectionRenderService) private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initialize();
        this._initializeMergeCell();
    }

    private _initialize = () => {
        const disposable = new Disposable();

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionInfo$.subscribe(() => {
                    // Each range change requires re-listening
                    disposable.dispose();

                    const selectionControls = this._selectionRenderService.getCurrentControls();
                    selectionControls.forEach((controlSelection) => {
                        disposable.disposeWithMe(
                            toDisposable(
                                controlSelection.selectionMoved$.subscribe((_toRange) => {
                                    if (!_toRange) {
                                        return;
                                    }

                                    const _fromRange = controlSelection.model.getRange();
                                    const fromRange = {
                                        startRow: _fromRange.startRow,
                                        startColumn: _fromRange.startColumn,
                                        endRow: _fromRange.endRow,
                                        endColumn: _fromRange.endColumn,
                                    };
                                    const toRange = {
                                        startRow: _toRange.startRow,
                                        startColumn: _toRange.startColumn,
                                        endRow: _toRange.endRow,
                                        endColumn: _toRange.endColumn,
                                    };

                                    if (
                                        fromRange.startRow === toRange.startRow &&
                                        fromRange.startColumn === toRange.startColumn
                                    ) {
                                        return;
                                    }

                                    const params: IMoveRangeCommandParams = {
                                        fromRange,
                                        toRange,
                                    };
                                    this._commandService.executeCommand(MoveRangeCommand.id, params);
                                })
                            )
                        );
                    });
                })
            )
        );
    };

    private _initializeMergeCell = () => {
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
                            .map((mergeRange) => getRelativeRange(mergeRange, params.fromRange))
                            .map((relativeRange) => getPositionRange(relativeRange, params.toRange));

                        const addMergeCellRanges = getAddMergeMutationRange(willMoveToMergeRanges).filter(
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
                }
                return { redos: [], undos: [] };
            };
            mergeData.forEach((range) => {
                disposable.disposeWithMe(this._refRangeService.registerRefRange(range, handler));
            });
        };
        this.disposeWithMe(
            this._commandService.onCommandExecuted((_params) => {
                if (_params.id === SetWorksheetActivateCommand.id) {
                    const params = _params.params as ISetWorksheetActivateCommandParams;
                    const sheetId = params.worksheetId;
                    const workbookId = params.workbookId;
                    if (!sheetId || !workbookId) {
                        return;
                    }
                    registerRefRange(workbookId, sheetId);
                }
                if (_params.id === AddWorksheetMergeMutation.id) {
                    const params = _params.params as IAddWorksheetMergeMutationParams;
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

const getRelativeRange = (range: IRange, originRange: IRange) =>
    ({
        startRow: range.startRow - originRange.startRow,
        endRow: range.endRow - range.startRow,
        startColumn: range.startColumn - originRange.startColumn,
        endColumn: range.endColumn - range.startColumn,
    }) as IRange;

const getPositionRange = (relativeRange: IRange, originRange: IRange) =>
    ({
        startRow: relativeRange.startRow + originRange.startRow,
        endRow: relativeRange.endRow + relativeRange.startRow + originRange.startRow,
        startColumn: relativeRange.startColumn + originRange.startColumn,
        endColumn: relativeRange.endColumn + relativeRange.startColumn + originRange.startColumn,
    }) as IRange;
