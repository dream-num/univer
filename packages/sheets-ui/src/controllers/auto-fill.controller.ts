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

import type { ICellData, ICommandInfo, IExecutionOptions, IMutationCommonParams, IMutationInfo, IRange, Nullable, UnitModel, Workbook } from '@univerjs/core';
import type {
    IAddWorksheetMergeMutationParams,
    IRemoveSheetMutationParams,
    IRemoveWorksheetMergeMutationParams,
    ISetRangeValuesMutationParams,
} from '@univerjs/sheets';
import type {
    APPLY_FUNCTIONS,
    IAutoFillLocation,
    ICopyDataInType,
    ICopyDataPiece,
    IRuleConfirmedData,
    ISheetAutoFillHook,
} from '../services/auto-fill/type';
import type { IDiscreteRange } from './utils/range-tools';
import {
    Direction,
    Disposable,
    DisposableCollection,
    ICommandService,
    Inject,
    Injector,
    IUniverInstanceService,
    ObjectMatrix,
    Rectangle,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';

import { DeviceInputEventType, getCurrentTypeOfRenderer, IRenderManagerService } from '@univerjs/engine-render';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
    getAddMergeMutationRangeByType,
    InsertColMutation,
    InsertRowMutation,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsMutation,
    RemoveColMutation,
    RemoveMergeUndoMutationFactory,
    RemoveRowMutation,
    RemoveSheetMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
} from '@univerjs/sheets';
import { AutoClearContentCommand, AutoFillCommand } from '../commands/commands/auto-fill.command';
import { RefillCommand } from '../commands/commands/refill.command';
import { SetCellEditVisibleOperation } from '../commands/operations/cell-edit.operation';
import { SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { IAutoFillService } from '../services/auto-fill/auto-fill.service';
import { otherRule } from '../services/auto-fill/rules';
import { fillCopy, fillCopyStyles, getDataIndex, getLenS } from '../services/auto-fill/tools';
import { APPLY_TYPE, AutoFillHookType, DATA_TYPE } from '../services/auto-fill/type';
import { IEditorBridgeService } from '../services/editor-bridge.service';
import { ISheetSelectionRenderService } from '../services/selection/base-selection-render.service';
import { SheetsRenderService } from '../services/sheets-render.service';
import { discreteRangeToRange, generateNullCellValueRowCol } from './utils/range-tools';

export class AutoFillController extends Disposable {
    private _beforeApplyData: Array<Array<Nullable<ICellData>>> = [];
    private _currentLocation: Nullable<IAutoFillLocation> = null;

    private _copyData: ICopyDataPiece[] = [];
    private _defaultHook: ISheetAutoFillHook;
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IAutoFillService private readonly _autoFillService: IAutoFillService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetsRenderService) private _sheetsRenderService: SheetsRenderService
    ) {
        super();
        this._defaultHook = {
            id: 'default',
            type: AutoFillHookType.Default,
            priority: 0,
            onBeforeFillData: (location: IAutoFillLocation, direction: Direction) => {
                return this._presetAndCacheData(location, direction);
            },
            onFillData: (location: IAutoFillLocation, direction: Direction, applyType: APPLY_TYPE) => {
                return this._fillData(location, direction, applyType);
            },
        };
        this._init();
    }

    private _init() {
        this._initDefaultHook();
        this._initSelectionControlFillChanged();
        this._initQuitListener();
        this._initSkeletonChange();
    }

    private _initSkeletonChange() {
        this.disposeWithMe(this._sheetsRenderService.registerSkeletonChangingMutations(AutoFillCommand.id));
    }

    private _initDefaultHook() {
        this.disposeWithMe(this._autoFillService.addHook(this._defaultHook));
    }

    private _initQuitListener() {
        const quitCommands = [
            SetCellEditVisibleOperation.id,
            AutoClearContentCommand.id,
            SetRangeValuesCommand.id,
            SetZoomRatioOperation.id,
            SetWorksheetActiveOperation.id,
            MoveRangeMutation.id,
            RemoveRowMutation.id,
            RemoveColMutation.id,
            InsertRowMutation.id,
            InsertColMutation.id,
            MoveRowsMutation.id,
            MoveColsMutation.id,
            SetWorksheetColWidthMutation.id,
            SetWorksheetRowHeightMutation.id,
            SetRangeValuesMutation.id,
        ];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
            const fromCollab = options?.fromCollab;
            const fromSync = options?.fromSync;
            const fromFormula = options?.fromFormula;
            if (quitCommands.includes(command.id)
                && !fromCollab
                && !fromSync
                && !fromFormula
                && (command.params as IMutationCommonParams).trigger !== AutoFillCommand.id
                && (command.params as IMutationCommonParams).trigger !== RefillCommand.id
            ) {
                this._quit();
            }
            if (command.id === RemoveSheetMutation.id) {
                if ((command.params as IRemoveSheetMutationParams).unitId === this._currentLocation?.unitId &&
                    (command.params as IRemoveSheetMutationParams).subUnitId === this._currentLocation?.subUnitId) {
                    this._quit();
                }
            }
        }));
        this.disposeWithMe(this._univerInstanceService.unitDisposed$.subscribe((unit: UnitModel) => {
            if (unit.getUnitId() === this._currentLocation?.unitId) {
                this._quit();
            }
        }));
    }

    private _quit() {
        this._currentLocation = null;
        this._beforeApplyData = [];
        this._copyData = [];
        this._autoFillService.setShowMenu(false);
    }

    private _initSelectionControlFillChanged() {
        const disposableCollection = new DisposableCollection();
        const updateListener = () => {
            // Each range change requires re-listening.
            disposableCollection.dispose();

            const currentRenderer = getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET, this._univerInstanceService, this._renderManagerService);
            if (!currentRenderer) return;

            const selectionRenderService = currentRenderer.with(ISheetSelectionRenderService);
            const selectionControls = selectionRenderService.getSelectionControls();
            selectionControls.forEach((controlSelection) => {
                disposableCollection.add(controlSelection.selectionFilled$.subscribe((filled) => {
                    if (
                        filled == null ||
                                filled.startColumn === -1 ||
                                filled.startRow === -1 ||
                                filled.endColumn === -1 ||
                                filled.endRow === -1
                    ) {
                        return;
                    }
                    const source: IRange = {
                        startColumn: controlSelection.model.startColumn,
                        endColumn: controlSelection.model.endColumn,
                        startRow: controlSelection.model.startRow,
                        endRow: controlSelection.model.endRow,
                    };
                    const selection: IRange = {
                        startColumn: filled.startColumn,
                        endColumn: filled.endColumn,
                        startRow: filled.startRow,
                        endRow: filled.endRow,
                    };

                    this._commandService.executeCommand(AutoFillCommand.id, { sourceRange: source, targetRange: selection });
                }));

                // double click to fill range, range length will align to left or right column.
                // fill results will be as same as drag operation
                disposableCollection.add(controlSelection.fillControl.onDblclick$.subscribeEvent(() => {
                    const source = {
                        startColumn: controlSelection.model.startColumn,
                        endColumn: controlSelection.model.endColumn,
                        startRow: controlSelection.model.startRow,
                        endRow: controlSelection.model.endRow,
                    };
                    this._handleDbClickFill(source);
                }));

                disposableCollection.add(controlSelection.fillControl.onPointerDown$.subscribeEvent(() => {
                    const visibleState = this._editorBridgeService.isVisible();
                    if (visibleState.visible) {
                        this._commandService.syncExecuteCommand(
                            SetCellEditVisibleOperation.id,
                            {
                                visible: false,
                                eventType: DeviceInputEventType.PointerDown,
                                unitId: currentRenderer.unitId,
                            }
                        );
                    }
                }));
            });
        };

        updateListener();

        // Should subscribe current current renderer change as well.
        // TODO@yuhongz: this seems not ideal. This should be an `IRenderModule` for running with multiple renderers?
        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id === SetSelectionsOperation.id) {
                updateListener();
            }
        }));

        this.disposeWithMe(this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET)
            .subscribe(() => updateListener()));
    }

    private _handleDbClickFill(source: IRange) {
        const selection = this._detectFillRange(source);
        // double click only works when dest range is longer than source range
        if (selection.endRow <= source.endRow) {
            return;
        }

        // double click effect is the same as drag effect, but the apply area is automatically calculated (by method '_detectFillRange')
        this._commandService.executeCommand(AutoFillCommand.id, { sourceRange: source, targetRange: selection });
    }

    private _detectFillRange(source: IRange) {
        const { startRow, endRow, startColumn, endColumn } = source;
        const worksheet = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        if (!worksheet) {
            return source;
        }
        const matrix = worksheet.getCellMatrix();
        const maxRow = worksheet.getMaxRows() - 1;
        const maxColumn = worksheet.getMaxColumns() - 1;
        let detectEndRow = endRow;
        // left column first, or consider right column.
        if (startColumn > 0 && matrix.getValue(startRow, startColumn - 1)?.v != null) {
            let cur = startRow;
            while (matrix.getValue(cur, startColumn - 1)?.v != null && cur < maxRow) {
                cur += 1;
            }
            detectEndRow = cur - 1;
        } else if (endColumn < maxColumn && matrix.getValue(endRow, endColumn + 1)?.v != null) {
            let cur = startRow;
            while (matrix.getValue(cur, endColumn + 1)?.v != null && cur < maxRow) {
                cur += 1;
            }
            detectEndRow = cur - 1;
        }

        for (let i = endRow + 1; i <= detectEndRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                if (matrix.getValue(i, j)?.v != null) {
                    detectEndRow = i - 1;
                    break;
                }
            }
        }

        return {
            startColumn,
            endColumn,
            startRow,
            endRow: detectEndRow,
        };
    }

    // calc apply data according to copy data and direction
    private _getApplyData(
        copyDataPiece: ICopyDataPiece,
        csLen: number,
        asLen: number,
        direction: Direction,
        applyType: APPLY_TYPE,
        hasStyle: boolean = true,
        location: IAutoFillLocation
    ) {
        const applyData: Array<Nullable<ICellData>> = [];
        const num = Math.floor(asLen / csLen);
        const rsd = asLen % csLen;
        const rules = this._autoFillService.getRules();

        if (!hasStyle && applyType === APPLY_TYPE.ONLY_FORMAT) {
            console.error('ERROR: only format can not be applied when hasStyle is false');
            return [];
        }

        const applyDataInTypes: { [key: string]: any[] } = {};

        rules.forEach((r) => {
            applyDataInTypes[r.type] = [];
        });

        // calc cell data to apply
        rules.forEach((r) => {
            const { type, applyFunctions: customApplyFunctions = {} } = r;
            const copyDataInType = copyDataPiece[type];
            if (!copyDataInType) {
                return;
            }
            // copyDataInType is an array of copy-squads in same types
            // a copy-squad is an array of continuous cells that has the same type, e.g. [1, 3, 5] is a copy squad, but [1, 3, ab, 5] will be divided into two copy-squads
            copyDataInType.forEach((copySquad) => {
                const s = getLenS(copySquad.index, rsd);
                const len = copySquad.index.length * num + s;

                // We do not process cell.custom by default. If the user needs to process it, they can do so in the hook extension.
                const arrData = this._applyFunctions(
                    copySquad,
                    len,
                    direction,
                    applyType,
                    customApplyFunctions,
                    copyDataPiece,
                    location
                );

                const arrIndex = getDataIndex(csLen, asLen, copySquad.index);
                applyDataInTypes[type].push({ data: arrData, index: arrIndex });
            });
        });

        // calc index
        for (let x = 0; x < asLen; x++) {
            rules.forEach((r) => {
                const { type } = r;
                const applyDataInType = applyDataInTypes[type];
                for (let y = 0; y < applyDataInType.length; y++) {
                    if (x in applyDataInType[y].index) {
                        applyData.push(applyDataInType[y].data[applyDataInType[y].index[x]]);
                    }
                }
            });
        }

        return applyData;
    }

    private _applyFunctions(
        copySquad: ICopyDataInType,
        len: number,
        direction: Direction,
        applyType: APPLY_TYPE,
        customApplyFunctions: APPLY_FUNCTIONS,
        copyDataPiece: ICopyDataPiece,
        location: IAutoFillLocation
    ) {
        const { data } = copySquad;
        const isReverse = direction === Direction.UP || direction === Direction.LEFT;

        // according to applyType, apply functions. if customApplyFunctions is provided, use it instead of default apply functions
        if (applyType === APPLY_TYPE.COPY) {
            const custom = customApplyFunctions?.[APPLY_TYPE.COPY];
            if (custom) {
                return custom(copySquad, len, direction, copyDataPiece, location);
            }
            isReverse && data.reverse();
            return fillCopy(data, len);
        }
        if (applyType === APPLY_TYPE.SERIES) {
            const custom = customApplyFunctions?.[APPLY_TYPE.SERIES];
            if (custom) {
                return custom(copySquad, len, direction, copyDataPiece);
            }
            isReverse && data.reverse();
            // special rules, if not provide custom SERIES apply functions, will be applied as copy
            if (customApplyFunctions?.[APPLY_TYPE.COPY]) {
                return customApplyFunctions[APPLY_TYPE.COPY](copySquad, len, direction, copyDataPiece, location);
            }
            return fillCopy(data, len);
        }
        if (applyType === APPLY_TYPE.ONLY_FORMAT) {
            const custom = customApplyFunctions?.[APPLY_TYPE.ONLY_FORMAT];
            if (custom) {
                return custom(copySquad, len, direction, copyDataPiece);
            }
            return fillCopyStyles(data, len);
        }
    }

    private _getCopyData(source: IDiscreteRange, direction: Direction) {
        const worksheet = this._univerInstanceService
            .getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!
            .getActiveSheet();

        if (!worksheet) {
            throw new Error('No active sheet found');
        }

        const currentCellDatas = worksheet.getCellMatrix();
        const rules = this._autoFillService.getRules();
        const copyData: ICopyDataPiece[] = [];
        const isVertical = direction === Direction.DOWN || direction === Direction.UP;
        let aArray: number[];
        let bArray: number[];
        if (isVertical) {
            aArray = source.cols;
            bArray = source.rows;
        } else {
            aArray = source.rows;
            bArray = source.cols;
        }

        aArray.forEach((a) => {
            // a copyDataPiece is an array of original cells in same column or row, depending on direction (horizontal or vertical)
            const copyDataPiece = this._getEmptyCopyDataPiece();
            const prevData: IRuleConfirmedData = {
                type: undefined,
                cellData: undefined,
            };
            bArray.forEach((b) => {
                let data: Nullable<ICellData>;
                if (isVertical) {
                    data = currentCellDatas.getValue(b, a);
                } else {
                    data = currentCellDatas.getValue(a, b);
                }
                const { type, isContinue } = rules.find((r) => r.match(data, this._injector)) || otherRule;
                if (isContinue(prevData, data)) {
                    const typeInfo = copyDataPiece[type];

                    const last = typeInfo![typeInfo!.length - 1];
                    last.data.push(data);
                    last.index.push(b - bArray[0]);
                } else {
                    const typeInfo = copyDataPiece[type];
                    if (typeInfo) {
                        typeInfo.push({
                            data: [data],
                            index: [b - bArray[0]],
                        });
                    } else {
                        copyDataPiece[type] = [
                            {
                                data: [data],
                                index: [b - bArray[0]],
                            },
                        ];
                    }
                }
                prevData.type = type;
                prevData.cellData = data;
            });
            copyData.push(copyDataPiece);
        });
        return copyData;
    }

    private _getEmptyCopyDataPiece() {
        const copyDataPiece: ICopyDataPiece = {};
        this._autoFillService.getRules().forEach((r) => {
            copyDataPiece[r.type] = [];
        });

        return copyDataPiece;
    }

    private _getMergeApplyData(source: IRange, target: IRange, direction: Direction, csLen: number) {
        const worksheet = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();

        if (!worksheet) {
            throw new Error('No active sheet found');
        }

        const applyMergeRanges = [];
        for (let i = source.startRow; i <= source.endRow; i++) {
            for (let j = source.startColumn; j <= source.endColumn; j++) {
                const { isMergedMainCell, startRow, startColumn, endRow, endColumn } = worksheet.getCellInfoInMergeData(i, j);
                if (isMergedMainCell) {
                    if (direction === Direction.DOWN) {
                        let windowStartRow = startRow + csLen;
                        let windowEndRow = endRow + csLen;
                        while (windowEndRow <= target.endRow) {
                            applyMergeRanges.push({
                                startRow: windowStartRow,
                                startColumn,
                                endRow: windowEndRow,
                                endColumn,
                            });
                            windowStartRow += csLen;
                            windowEndRow += csLen;
                        }
                    } else if (direction === Direction.UP) {
                        let windowStartRow = startRow - csLen;
                        let windowEndRow = endRow - csLen;
                        while (windowStartRow >= target.startRow) {
                            applyMergeRanges.push({
                                startRow: windowStartRow,
                                startColumn,
                                endRow: windowEndRow,
                                endColumn,
                            });
                            windowStartRow -= csLen;
                            windowEndRow -= csLen;
                        }
                    } else if (direction === Direction.RIGHT) {
                        let windowStartColumn = startColumn + csLen;
                        let windowEndColumn = endColumn + csLen;
                        while (windowEndColumn <= target.endColumn) {
                            applyMergeRanges.push({
                                startRow,
                                startColumn: windowStartColumn,
                                endRow,
                                endColumn: windowEndColumn,
                            });
                            windowStartColumn += csLen;
                            windowEndColumn += csLen;
                        }
                    } else if (direction === Direction.LEFT) {
                        let windowStartColumn = startColumn - csLen;
                        let windowEndColumn = endColumn - csLen;
                        while (windowStartColumn >= target.startColumn) {
                            applyMergeRanges.push({
                                startRow,
                                startColumn: windowStartColumn,
                                endRow,
                                endColumn: windowEndColumn,
                            });
                            windowStartColumn -= csLen;
                            windowEndColumn -= csLen;
                        }
                    }
                }
            }
        }
        return applyMergeRanges;
    }

    private _presetAndCacheData(location: IAutoFillLocation, direction: Direction) {
        const { source, target } = location;
        // cache original data of apply range
        const worksheet = this._univerInstanceService
            .getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!
            .getActiveSheet();

        if (!worksheet) {
            throw new Error('No active sheet found');
        }

        const currentCellDatas = worksheet.getCellMatrix();
        // cache the original data in currentCellDatas in apply range for later use / refill
        const applyData: Nullable<ICellData>[][] = [];
        target.rows.forEach((i) => {
            const row: Nullable<ICellData>[] = [];
            target.cols.forEach((j) => {
                row.push(Tools.deepClone(currentCellDatas.getValue(i, j)));
            });
            applyData.push(row);
        });
        this._beforeApplyData = applyData;
        this._copyData = this._getCopyData(source, direction);
        this._currentLocation = location;
        if (this._shouldDisableSeries(this._copyData)) {
            this._autoFillService.setDisableApplyType(APPLY_TYPE.SERIES, true);
            return APPLY_TYPE.COPY;
        } else {
            this._autoFillService.setDisableApplyType(APPLY_TYPE.SERIES, false);
        }
        return this._getPreferredApplyType(this._copyData);
    }

    // auto fill entry
    // eslint-disable-next-line max-lines-per-function
    private _fillData(location: IAutoFillLocation, direction: Direction, applyType: APPLY_TYPE) {
        const undos: IMutationInfo[] = [];
        const redos: IMutationInfo[] = [];

        let hasStyle = true;
        if (applyType === APPLY_TYPE.NO_FORMAT) {
            hasStyle = false;
            applyType = APPLY_TYPE.SERIES;
        }

        const { source, target, unitId, subUnitId } = location;

        if (!source || !target || direction == null) {
            return {
                undos,
                redos,
            };
        }

        const sourceRange = discreteRangeToRange(source);
        const targetRange = discreteRangeToRange(target);

        const { cols: targetCols, rows: targetRows } = target;
        const { cols: sourceCols, rows: sourceRows } = source;

        const copyData = this._copyData;

        let csLen;
        if (direction === Direction.DOWN || direction === Direction.UP) {
            csLen = sourceRows.length;
        } else {
            csLen = sourceCols.length;
        }

        const applyDatas: Array<Array<Nullable<ICellData>>> = [];

        if (direction === Direction.DOWN || direction === Direction.UP) {
            const asLen = targetRows.length;
            const untransformedApplyDatas: Nullable<ICellData>[][] = [];
            targetCols.forEach((_, i) => {
                const copyD = copyData[i];

                const applyData = this._getApplyData(copyD, csLen, asLen, direction, applyType, hasStyle, location);
                untransformedApplyDatas.push(applyData);
            });
            for (let i = 0; i < untransformedApplyDatas[0].length; i++) {
                const row: Array<Nullable<ICellData>> = [];
                for (let j = 0; j < untransformedApplyDatas.length; j++) {
                    row.push({
                        s: null,
                        ...untransformedApplyDatas[j][i],
                    });
                }
                applyDatas.push(row);
            }
        } else {
            const asLen = targetCols.length;
            targetRows.forEach((_, i) => {
                const copyD = copyData[i];
                const applyData = this._getApplyData(copyD, csLen, asLen, direction, applyType, hasStyle, location);
                const row: Array<Nullable<ICellData>> = [];
                for (let j = 0; j < applyData.length; j++) {
                    row.push({
                        s: null,
                        ...applyData[j],
                    });
                }
                applyDatas.push(row);
            });
        }

        // deal with styles
        let applyMergeRanges: IRange[] = [];
        const style = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getStyles();
        if (hasStyle) {
            applyMergeRanges = this._getMergeApplyData(sourceRange, targetRange, direction, csLen);
            applyDatas.forEach((row) => {
                row.forEach((cellData) => {
                    if (cellData && style) {
                        if (style) {
                            cellData.s = style.getStyleByCell(cellData);
                        }
                    }
                });
            });
        } else {
            applyDatas.forEach((row, rowIndex) => {
                row.forEach((cellData, colIndex) => {
                    if (cellData && style) {
                        cellData.s = style.getStyleByCell(this._beforeApplyData[rowIndex][colIndex]) || null;
                    }
                });
            });
        }

        if (applyType === APPLY_TYPE.ONLY_FORMAT) {
            applyDatas.forEach((row, rowIndex) => {
                row.forEach((cellData, colIndex) => {
                    if (cellData) {
                        const old = this._beforeApplyData[rowIndex][colIndex] || {};
                        cellData.f = old.f;
                        cellData.si = old.si;
                        cellData.t = old.t;
                        cellData.v = old.v;
                    }
                });
            });
        }

        // delete cross merge
        if (hasStyle) {
            const deleteMergeRanges: IRange[] = [];
            const mergeData = this._univerInstanceService
                .getUniverSheetInstance(unitId)
                ?.getSheetBySheetId(subUnitId)
                ?.getMergeData();
            if (mergeData) {
                mergeData.forEach((merge) => {
                    if (Rectangle.intersects(merge, targetRange)) {
                        deleteMergeRanges.push(merge);
                    }
                });
            }
            const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
                unitId,
                subUnitId,
                ranges: deleteMergeRanges,
            };

            const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = this._injector.invoke(
                RemoveMergeUndoMutationFactory,
                removeMergeMutationParams
            );

            if (deleteMergeRanges.length) {
                redos.push({ id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams });
                undos.unshift({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });
            }
        }

        // clear range value
        const clearMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: generateNullCellValueRowCol([target]),
        };

        const undoClearMutationParams: ISetRangeValuesMutationParams = this._injector.invoke(
            SetRangeValuesUndoMutationFactory,
            clearMutationParams
        );

        // const intercepted = this._sheetInterceptorService.onCommandExecute({ id: ClearSelectionContentCommand.id });
        redos.push({ id: SetRangeValuesMutation.id, params: clearMutationParams });
        undos.unshift({ id: SetRangeValuesMutation.id, params: undoClearMutationParams });
        // set range value
        const cellValue = new ObjectMatrix<ICellData>();
        targetRows.forEach((row, rowIndex) => {
            targetCols.forEach((col, colIndex) => {
                if (applyDatas[rowIndex][colIndex]) {
                    cellValue.setValue(row, col, applyDatas[rowIndex][colIndex]!);
                }
            });
        });

        const cellValueMatrix = cellValue.getMatrix();
        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: cellValueMatrix,
        };

        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = this._injector.invoke(
            SetRangeValuesUndoMutationFactory,
            setRangeValuesMutationParams
        );

        this._autoFillService.getActiveHooks().forEach((hook) => {
            hook.onBeforeSubmit?.(location, direction, applyType, cellValueMatrix);
        });

        undos.unshift({ id: SetRangeValuesMutation.id, params: undoSetRangeValuesMutationParams });
        redos.push({ id: SetRangeValuesMutation.id, params: setRangeValuesMutationParams });

        // add worksheet merge
        if (applyMergeRanges?.length) {
            const ranges = getAddMergeMutationRangeByType(applyMergeRanges);

            const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
                unitId,
                subUnitId,
                ranges,
            };

            const undoAddMergeMutationParams: IRemoveWorksheetMergeMutationParams = this._injector.invoke(
                AddMergeUndoMutationFactory,
                addMergeMutationParams
            );

            undos.unshift({ id: RemoveWorksheetMergeMutation.id, params: undoAddMergeMutationParams });
            redos.push({ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams });
        }

        return {
            undos,
            redos,
        };
    }

    private _shouldDisableSeries(copyData: ICopyDataPiece[]) {
        // only formula or other type data, disable series
        return copyData.every((copyDataPiece) =>
            Object.keys(copyDataPiece).every((type) => (
                copyDataPiece[type as DATA_TYPE]?.length === 0
                || [DATA_TYPE.OTHER, DATA_TYPE.FORMULA].includes(type as DATA_TYPE)
            )
            )
        );
    }

    private _getPreferredApplyType(copyData: ICopyDataPiece[]) {
        // if all data is number and only one cell in piece, prefer copy
        const preferCopy = copyData.every((copyDataPiece) =>
            Object.keys(copyDataPiece).every((type) => (
                copyDataPiece[type as DATA_TYPE]?.length === 0
                || (copyDataPiece[type as DATA_TYPE]?.length === 1
                    && copyDataPiece[type as DATA_TYPE][0].data.length === 1
                    && DATA_TYPE.NUMBER === type as DATA_TYPE)
            )
            )
        );
        return preferCopy ? APPLY_TYPE.COPY : APPLY_TYPE.SERIES;
    }
}
