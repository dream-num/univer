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

import type { ICellData, ICommandInfo, IMutationInfo, IRange, Nullable } from '@univerjs/core';
import {
    Direction,
    Disposable,
    DisposableCollection,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    RANGE_TYPE,
    Rectangle,
    toDisposable,
    Tools,
} from '@univerjs/core';
import { DeviceInputEventType, getCellInfoInMergeData } from '@univerjs/engine-render';
import type {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
    ISetRangeValuesMutationParams,
} from '@univerjs/sheets';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
    ClearSelectionContentCommand,
    getAddMergeMutationRangeByType,
    NORMAL_SELECTION_PLUGIN_NAME,
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
    SelectionManagerService,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SetSelectionsOperation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';

import { AutoClearContentCommand, AutoFillCommand } from '../commands/commands/auto-fill.command';
import { IAutoFillService } from '../services/auto-fill/auto-fill.service';
import { otherRule } from '../services/auto-fill/rules';
import { fillCopy, fillCopyStyles, generateNullCellValue, getDataIndex, getLenS } from '../services/auto-fill/tools';
import type {
    APPLY_FUNCTIONS,
    IAutoFillLocation,
    ICopyDataInType,
    ICopyDataPiece,
    IRuleConfirmedData,
    ISheetAutoFillHook,
} from '../services/auto-fill/type';
import { APPLY_TYPE, AutoFillHookType, DATA_TYPE } from '../services/auto-fill/type';
import { IEditorBridgeService } from '../services/editor-bridge.service';
import { ISelectionRenderService } from '../services/selection/selection-render.service';

@OnLifecycle(LifecycleStages.Steady, AutoFillController)
export class AutoFillController extends Disposable {
    private _beforeApplyData: Array<Array<Nullable<ICellData>>> = [];

    private _copyData: ICopyDataPiece[] = [];
    private _defaultHook: ISheetAutoFillHook;
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @IAutoFillService private readonly _autoFillService: IAutoFillService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
        this._defaultHook = {
            id: 'default',
            type: AutoFillHookType.Default,
            priority: 0,
            onBeforeFillData: (location: IAutoFillLocation, direction: Direction) => {
                this._presetAndCacheData(location, direction);
            },
            onFillData: (location: IAutoFillLocation, direction: Direction, applyType: APPLY_TYPE) => {
                return this._fillData(location, direction, applyType);
            },
        };
        this._init();
    }

    private _init() {
        this._initDefaultHook();
        this._onSelectionControlFillChanged();
        this._onApplyTypeChanged();
        [AutoFillCommand, AutoClearContentCommand].forEach((command) => {
            this.disposeWithMe(this._commandService.registerCommand(command));
        });
    }

    private _initDefaultHook() {
        this._autoFillService.addHook(this._defaultHook);
    }

    private _onSelectionControlFillChanged() {
        const disposableCollection = new DisposableCollection();
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetSelectionsOperation.id) {
                    return;
                }

                /**
                 * Auto fill only responds to regular selections;
                 * it does not apply to selections for features like formulas or charts.
                 */
                const current = this._selectionManagerService.getCurrent();
                if (current?.pluginName !== NORMAL_SELECTION_PLUGIN_NAME) {
                    return;
                }

                // Each range change requires re-listening
                disposableCollection.dispose();

                const selectionControls = this._selectionRenderService.getCurrentControls();
                selectionControls.forEach((controlSelection) => {
                    disposableCollection.add(
                        toDisposable(
                            controlSelection.selectionFilled$.subscribe((filled) => {
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

                                this._triggerAutoFill(source, selection);
                            })
                        )
                    );

                    // double click to fill range, range length will align to left or right column.
                    // fill results will be as same as drag operation
                    disposableCollection.add(
                        toDisposable(
                            controlSelection.fillControl.onDblclickObserver.add(() => {
                                const source = {
                                    startColumn: controlSelection.model.startColumn,
                                    endColumn: controlSelection.model.endColumn,
                                    startRow: controlSelection.model.startRow,
                                    endRow: controlSelection.model.endRow,
                                };
                                this._handleDbClickFill(source);
                            })
                        )
                    );

                    disposableCollection.add(
                        toDisposable(
                            controlSelection.fillControl.onPointerDownObserver.add(() => {
                                const visibleState = this._editorBridgeService.isVisible();
                                if (visibleState.visible) {
                                    this._editorBridgeService.changeVisible({
                                        visible: false,
                                        eventType: DeviceInputEventType.PointerDown,
                                    });
                                }
                            })
                        )
                    );
                });
            })
        );
    }

    // refill when apply type changed
    private _onApplyTypeChanged() {
        this.disposeWithMe(
            toDisposable(
                this._autoFillService.applyType$.subscribe(() => {
                    this._handleFillData();
                })
            )
        );
    }

    private _triggerAutoFill(source: IRange, selection: IRange) {
        // if source range === dest range, do nothing;
        if (
            source.startColumn === selection.startColumn &&
            source.startRow === selection.startRow &&
            source.endColumn === selection.endColumn &&
            source.endRow === selection.endRow
        ) {
            return;
        }
        // situation 1: drag to smaller range, horizontally.
        if (selection.endColumn < source.endColumn && selection.endColumn > source.startColumn) {
            this._commandService.executeCommand(AutoClearContentCommand.id, {
                clearRange: {
                    startRow: selection.startRow,
                    endRow: selection.endRow,
                    startColumn: selection.endColumn + 1,
                    endColumn: source.endColumn,
                },
                selectionRange: selection,
            });
            return;
        }
        // situation 2: drag to smaller range, vertically.
        if (selection.endRow < source.endRow && selection.endRow > source.startRow) {
            this._commandService.executeCommand(AutoClearContentCommand.id, {
                clearRange: {
                    startRow: selection.endRow + 1,
                    endRow: source.endRow,
                    startColumn: selection.startColumn,
                    endColumn: selection.endColumn,
                },
                selectionRange: selection,
            });
            return;
        }
        // situation 3: drag to larger range, expand to fill

        // save ranges
        const target = {
            startRow: selection.startRow,
            endRow: selection.endRow,
            startColumn: selection.startColumn,
            endColumn: selection.endColumn,
        };
        let direction: Nullable<Direction> = null;
        if (selection.startRow < source.startRow) {
            direction = Direction.UP;
            target.endRow = source.startRow - 1;
        } else if (selection.endRow > source.endRow) {
            direction = Direction.DOWN;
            target.startRow = source.endRow + 1;
        } else if (selection.startColumn < source.startColumn) {
            direction = Direction.LEFT;
            target.endColumn = source.startColumn - 1;
        } else if (selection.endColumn > source.endColumn) {
            direction = Direction.RIGHT;
            target.startColumn = source.endColumn + 1;
        } else {
            return;
        }
        const unitId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const subUnitId = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        this._autoFillService.direction = direction;
        this._autoFillService.autoFillLocation = {
            source,
            target,
            unitId,
            subUnitId,
        };

        const activeHooks = this._autoFillService.getActiveHooks();
        activeHooks.forEach((hook) => {
            hook?.onBeforeFillData?.({ source, target, unitId, subUnitId }, direction!);
        });

        // set apply type will trigger fillData
        if (!this._autoFillService.menu.find((m) => m.value === APPLY_TYPE.SERIES)?.disable) {
            this._autoFillService.applyType = APPLY_TYPE.SERIES;
        } else {
            this._autoFillService.applyType = APPLY_TYPE.COPY;
        }
    }

    private _handleDbClickFill(source: IRange) {
        const selection = this._detectFillRange(source);
        // double click only works when dest range is longer than source range
        if (selection.endRow <= source.endRow) {
            return;
        }
        // double click effect is the same as drag effect, but the apply area is automatically calculated (by method '_detectFillRange')
        this._triggerAutoFill(source, selection);
    }

    private _detectFillRange(source: IRange) {
        const { startRow, endRow, startColumn, endColumn } = source;
        const worksheet = this._univerInstanceService.getCurrentUniverSheetInstance()?.getActiveSheet();
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

    private _handleFillData() {
        const {
            source,
            target,
            unitId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId(),
            subUnitId = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId(),
        } = this._autoFillService.autoFillLocation || {};
        const direction = this._autoFillService.direction;
        if (!source || !target) {
            return;
        }

        const selection = Rectangle.union(source, target);
        const applyType = this._autoFillService.applyType;
        const activeHooks = this._autoFillService.getActiveHooks();

        this._commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            selections: [
                {
                    primary: {
                        ...selection,
                        actualRow: selection.startRow,
                        actualColumn: selection.startColumn,
                        endColumn: selection.startColumn,
                        endRow: selection.startRow,
                    },
                    range: {
                        ...selection,
                        rangeType: RANGE_TYPE.NORMAL,
                    },
                },
            ],
            unitId,
            subUnitId,
        });

        const undos: IMutationInfo[] = [];
        const redos: IMutationInfo[] = [];
        activeHooks.forEach((hook) => {
            const { undos: hookUndos, redos: hookRedos } =
                hook.onFillData?.({ source, target, unitId, subUnitId }, direction, applyType) || {};
            if (hookUndos) {
                undos.push(...hookUndos);
            }
            if (hookRedos) {
                redos.push(...hookRedos);
            }
        });

        const result = redos.every((m) => this._commandService.syncExecuteCommand(m.id, m.params));
        if (result) {
            // add to undo redo services
            this._undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }
        // this._commandService.executeCommand(AutoFillCommand.id);
        activeHooks.forEach((hook) => {
            hook.onAfterFillData?.({ source, target, unitId, subUnitId }, direction, applyType);
        });
        this._autoFillService.setShowMenu(true);
    }

    // calc apply data according to copy data and direction
    private _getApplyData(
        copyDataPiece: ICopyDataPiece,
        csLen: number,
        asLen: number,
        direction: Direction,
        applyType: APPLY_TYPE,
        hasStyle: boolean = true
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
                const arrData = this._applyFunctions(
                    copySquad,
                    len,
                    direction,
                    applyType,
                    customApplyFunctions,
                    copyDataPiece
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
        copyDataPiece: ICopyDataPiece
    ) {
        const { data } = copySquad;
        const isReverse = direction === Direction.UP || direction === Direction.LEFT;

        // according to applyType, apply functions. if customApplyFunctions is provided, use it instead of default apply functions
        if (applyType === APPLY_TYPE.COPY) {
            const custom = customApplyFunctions?.[APPLY_TYPE.COPY];
            if (custom) {
                return custom(copySquad, len, direction, copyDataPiece);
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
                return customApplyFunctions[APPLY_TYPE.COPY](copySquad, len, direction, copyDataPiece);
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

    private _getCopyData(source: IRange, direction: Direction) {
        const {
            startRow: copyStartRow,
            startColumn: copyStartColumn,
            endRow: copyEndRow,
            endColumn: copyEndColumn,
        } = source;
        const currentCellDatas = this._univerInstanceService
            .getCurrentUniverSheetInstance()
            .getActiveSheet()
            .getCellMatrix();
        const rules = this._autoFillService.getRules();
        const copyData = [];
        const isVertical = direction === Direction.DOWN || direction === Direction.UP;
        let a1: number;
        let a2: number;
        let b1: number;
        let b2: number;
        if (isVertical) {
            a1 = copyStartColumn;
            a2 = copyEndColumn;
            b1 = copyStartRow;
            b2 = copyEndRow;
        } else {
            a1 = copyStartRow;
            a2 = copyEndRow;
            b1 = copyStartColumn;
            b2 = copyEndColumn;
        }
        for (let a = a1; a <= a2; a++) {
            // a copyDataPiece is an array of original cells in same column or row, depending on direction (horizontal or vertical)
            const copyDataPiece = this._getEmptyCopyDataPiece();
            const prevData: IRuleConfirmedData = {
                type: undefined,
                cellData: undefined,
            };
            for (let b = b1; b <= b2; b++) {
                let data: Nullable<ICellData>;
                if (isVertical) {
                    data = currentCellDatas.getValue(b, a);
                } else {
                    data = currentCellDatas.getValue(a, b);
                }
                const { type, isContinue } = rules.find((r) => r.match(data)) || otherRule;
                if (isContinue(prevData, data)) {
                    const typeInfo = copyDataPiece[type];

                    const last = typeInfo![typeInfo!.length - 1];
                    last.data.push(data);
                    last.index.push(b - b1);
                } else {
                    const typeInfo = copyDataPiece[type];
                    if (typeInfo) {
                        typeInfo.push({
                            data: [data],
                            index: [b - b1],
                        });
                    } else {
                        copyDataPiece[type] = [
                            {
                                data: [data],
                                index: [b - b1],
                            },
                        ];
                    }
                }
                prevData.type = type;
                prevData.cellData = data;
            }
            copyData.push(copyDataPiece);
        }
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
        const mergeData = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getMergeData();
        const applyMergeRanges = [];
        for (let i = source.startRow; i <= source.endRow; i++) {
            for (let j = source.startColumn; j <= source.endColumn; j++) {
                const { isMergedMainCell, startRow, startColumn, endRow, endColumn } = getCellInfoInMergeData(
                    i,
                    j,
                    mergeData
                );
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
        const currentCellDatas = this._univerInstanceService
            .getCurrentUniverSheetInstance()
            .getActiveSheet()
            .getCellMatrix();
        // cache the original data in currentCellDatas in apply range for later use / refill
        const applyData = [];
        for (let i = target.startRow; i <= target.endRow; i++) {
            const row = [];
            for (let j = target.startColumn; j <= target.endColumn; j++) {
                row.push(Tools.deepClone(currentCellDatas.getValue(i, j)));
            }
            applyData.push(row);
        }
        this._beforeApplyData = applyData;
        this._copyData = this._getCopyData(source, direction);
        if (this._hasSeries(this._copyData)) {
            this._autoFillService.setDisableApplyType(APPLY_TYPE.SERIES, false);
        } else {
            this._autoFillService.setDisableApplyType(APPLY_TYPE.SERIES, true);
        }
    }

    // auto fill entry
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

        const {
            startRow: copyStartRow,
            startColumn: copyStartColumn,
            endRow: copyEndRow,
            endColumn: copyEndColumn,
        } = source;

        const {
            startRow: applyStartRow,
            startColumn: applyStartColumn,
            endRow: applyEndRow,
            endColumn: applyEndColumn,
        } = target;

        const copyData = this._copyData;

        let csLen;
        if (direction === Direction.DOWN || direction === Direction.UP) {
            csLen = copyEndRow - copyStartRow + 1;
        } else {
            csLen = copyEndColumn - copyStartColumn + 1;
        }

        const applyDatas: Array<Array<Nullable<ICellData>>> = [];

        if (direction === Direction.DOWN || direction === Direction.UP) {
            const asLen = applyEndRow - applyStartRow + 1;
            const untransformedApplyDatas = [];
            for (let i = applyStartColumn; i <= applyEndColumn; i++) {
                const copyD = copyData[i - applyStartColumn];

                const applyData = this._getApplyData(copyD, csLen, asLen, direction, applyType, hasStyle);
                untransformedApplyDatas.push(applyData);
            }
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
            const asLen = applyEndColumn - applyStartColumn + 1;
            for (let i = applyStartRow; i <= applyEndRow; i++) {
                const copyD = copyData[i - applyStartRow];
                const applyData = this._getApplyData(copyD, csLen, asLen, direction, applyType, hasStyle);
                const row: Array<Nullable<ICellData>> = [];
                for (let j = 0; j < applyData.length; j++) {
                    row.push({
                        s: null,
                        ...applyData[j],
                    });
                }
                applyDatas.push(row);
            }
        }

        // deal with styles
        let applyMergeRanges: IRange[] = [];
        const style = this._univerInstanceService.getCurrentUniverSheetInstance().getStyles();
        if (hasStyle) {
            applyMergeRanges = this._getMergeApplyData(source, target, direction, csLen);
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

        const accessor = {
            get: this._injector.get.bind(this._injector),
        };
        // delete cross merge
        const deleteMergeRanges: IRange[] = [];
        const mergeData = this._univerInstanceService
            .getUniverSheetInstance(unitId)
            ?.getSheetBySheetId(subUnitId)
            ?.getMergeData();
        if (mergeData) {
            mergeData.forEach((merge) => {
                if (Rectangle.intersects(merge, target)) {
                    deleteMergeRanges.push(merge);
                }
            });
        }
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: deleteMergeRanges,
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            accessor,
            removeMergeMutationParams
        );

        redos.push({ id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams });
        undos.push({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });

        // clear range value
        const clearMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: generateNullCellValue([target]),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            clearMutationParams
        );

        const intercepted = this._sheetInterceptorService.onCommandExecute({ id: ClearSelectionContentCommand.id });
        redos.push({ id: SetRangeValuesMutation.id, params: clearMutationParams }, ...intercepted.redos);
        undos.push(...intercepted.undos, { id: SetRangeValuesMutation.id, params: undoClearMutationParams });

        // set range value
        const cellValue = new ObjectMatrix<ICellData>();
        const { startRow, startColumn, endRow, endColumn } = target;

        for (let r = 0; r <= endRow - startRow; r++) {
            for (let c = 0; c <= endColumn - startColumn; c++) {
                if (applyDatas[r][c]) {
                    cellValue.setValue(r + startRow, c + startColumn, applyDatas[r][c]!);
                }
            }
        }

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: cellValue.getMatrix(),
        };

        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationParams
        );

        undos.push({ id: SetRangeValuesMutation.id, params: undoSetRangeValuesMutationParams });
        redos.push({ id: SetRangeValuesMutation.id, params: setRangeValuesMutationParams });

        // add worksheet merge
        if (applyMergeRanges?.length) {
            const ranges = getAddMergeMutationRangeByType(applyMergeRanges);

            const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
                unitId,
                subUnitId,
                ranges,
            };
            const undoRemoveMutationParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
                accessor,
                addMergeMutationParams
            );

            undos.push({ id: RemoveWorksheetMergeMutation.id, params: undoRemoveMutationParams });
            redos.push({ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams });
        }

        return {
            undos,
            redos,
        };
    }

    private _hasSeries(copyData: ICopyDataPiece[]) {
        return copyData.some((copyDataPiece) => {
            const res = Object.keys(copyDataPiece).some((type) => {
                if (
                    copyDataPiece[type as DATA_TYPE]?.length &&
                    ![DATA_TYPE.OTHER, DATA_TYPE.FORMULA].includes(type as DATA_TYPE)
                ) {
                    return true;
                }
                return false;
            });
            return res;
        });
    }
}
