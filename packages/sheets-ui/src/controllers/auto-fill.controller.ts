import type { ICellData, IMutationInfo, IRange, Nullable } from '@univerjs/core';
import {
    Direction,
    Disposable,
    DisposableCollection,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
    Tools,
} from '@univerjs/core';
import { getCellInfoInMergeData } from '@univerjs/engine-render';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import { AutoClearContentCommand, AutoFillCommand } from '../commands/commands/auto-fill.command';
import { IAutoFillService } from '../services/auto-fill/auto-fill.service';
import { otherRule } from '../services/auto-fill/rules';
import { fillCopy, fillCopyStyles, getDataIndex, getLenS } from '../services/auto-fill/tools';
import type { APPLY_FUNCTIONS, ICopyDataInType, ICopyDataPiece, IRuleConfirmedData } from '../services/auto-fill/type';
import { APPLY_TYPE, DATA_TYPE } from '../services/auto-fill/type';
import { ISelectionRenderService } from '../services/selection/selection-render.service';

@OnLifecycle(LifecycleStages.Steady, AutoFillController)
export class AutoFillController extends Disposable {
    private _direction: Direction | null = null;
    private _beforeApplyData: Array<Array<Nullable<ICellData>>> = [];
    private _applyType: APPLY_TYPE = APPLY_TYPE.SERIES;

    private _hasFillingStyle: boolean = true;
    private _copyData: ICopyDataPiece[] = [];
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @ICommandService private readonly _commandService: ICommandService,
        @IAutoFillService private readonly _autoFillService: IAutoFillService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {
        super();
        this._init();
    }

    private _init() {
        this._onSelectionControlFillChanged();
        this._onApplyTypeChanged();
        [AutoFillCommand, AutoClearContentCommand].forEach((command) => {
            this.disposeWithMe(this._commandService.registerCommand(command));
        });
    }

    private _handleDbClickFill(sourceRange: IRange) {
        const destRange = this._detectFillRange(sourceRange);
        // double click only works when dest range is longer than source range
        if (destRange.endRow <= sourceRange.endRow) {
            return;
        }
        // double click effect is the same as drag effect, but the apply area is automatically calculated (by method '_detectFillRange')
        this._handleFill(sourceRange, destRange);
    }

    private _detectFillRange(sourceRange: IRange) {
        const { startRow, endRow, startColumn, endColumn } = sourceRange;
        const worksheet = this._univerInstanceService.getCurrentUniverSheetInstance()?.getActiveSheet();
        if (!worksheet) {
            return sourceRange;
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
            detectEndRow = cur;
        } else if (endColumn < maxColumn && matrix.getValue(endRow, endColumn + 1)?.v != null) {
            let cur = startRow;
            while (matrix.getValue(cur, endColumn + 1)?.v != null && cur < maxRow) {
                cur++;
            }
            detectEndRow = cur;
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

    private _handleFill(sourceRange: IRange, destRange: IRange) {
        // if source range === dest range, do nothing;
        if (
            sourceRange.startColumn === destRange.startColumn &&
            sourceRange.startRow === destRange.startRow &&
            sourceRange.endColumn === destRange.endColumn &&
            sourceRange.endRow === destRange.endRow
        ) {
            return;
        }
        // situation 1: drag to smaller range, horizontally.
        if (destRange.endColumn < sourceRange.endColumn && destRange.endColumn > sourceRange.startColumn) {
            this._commandService.executeCommand(AutoClearContentCommand.id, {
                clearRange: {
                    startRow: destRange.startRow,
                    endRow: destRange.endRow,
                    startColumn: destRange.endColumn + 1,
                    endColumn: sourceRange.endColumn,
                },
                selectionRange: destRange,
            });
            return;
        }
        // situation 2: drag to smaller range, vertically.
        if (destRange.endRow < sourceRange.endRow && destRange.endRow > sourceRange.startRow) {
            this._commandService.executeCommand(AutoClearContentCommand.id, {
                clearRange: {
                    startRow: destRange.endRow + 1,
                    endRow: sourceRange.endRow,
                    startColumn: destRange.startColumn,
                    endColumn: destRange.endColumn,
                },
                selectionRange: destRange,
            });
            return;
        }
        // situation 3: drag to larger range, expand to fill
        this._presetAndCacheData(sourceRange, destRange);
    }

    private _onSelectionControlFillChanged() {
        const disposableCollection = new DisposableCollection();
        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionInfo$.subscribe(() => {
                    // Each range change requires re-listening
                    disposableCollection.dispose();

                    const current = this._selectionManagerService.getCurrent();

                    /**
                     * Auto fill only responds to regular selections;
                     * it does not apply to selections for features like formulas or charts.
                     */
                    if (current?.pluginName !== NORMAL_SELECTION_PLUGIN_NAME) {
                        return;
                    }

                    const selectionControls = this._selectionRenderService.getCurrentControls();
                    selectionControls.forEach((controlSelection) => {
                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionFilled$.subscribe((filled) => {
                                    if (filled == null) {
                                        return;
                                    }
                                    const sourceRange: IRange = {
                                        startColumn: controlSelection.model.startColumn,
                                        endColumn: controlSelection.model.endColumn,
                                        startRow: controlSelection.model.startRow,
                                        endRow: controlSelection.model.endRow,
                                    };
                                    const destRange: IRange = {
                                        startColumn: filled.startColumn,
                                        endColumn: filled.endColumn,
                                        startRow: filled.startRow,
                                        endRow: filled.endRow,
                                    };

                                    this._handleFill(sourceRange, destRange);
                                })
                            )
                        );

                        // double click to fill range, range length will align to left or right column.
                        // fill results will be as same as drag operation
                        disposableCollection.add(
                            toDisposable(
                                controlSelection.fillControl.onDblclickObserver.add(() => {
                                    const sourceRange = {
                                        startColumn: controlSelection.model.startColumn,
                                        endColumn: controlSelection.model.endColumn,
                                        startRow: controlSelection.model.startRow,
                                        endRow: controlSelection.model.endRow,
                                    };
                                    this._handleDbClickFill(sourceRange);
                                })
                            )
                        );
                    });
                })
            )
        );
    }

    // refill when apply type changed
    private _onApplyTypeChanged() {
        this.disposeWithMe(
            toDisposable(
                this._autoFillService.applyType$.subscribe((applyType: APPLY_TYPE | null) => {
                    if (applyType === APPLY_TYPE.NO_FORMAT) {
                        this._applyType = APPLY_TYPE.SERIES;
                        this._hasFillingStyle = false;
                    } else {
                        this._applyType = applyType || APPLY_TYPE.SERIES;
                        this._hasFillingStyle = true;
                    }
                    this._fillData();
                })
            )
        );
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

    private _getCopyData(sourceRange: IRange, direction: Direction) {
        const {
            startRow: copyStartRow,
            startColumn: copyStartColumn,
            endRow: copyEndRow,
            endColumn: copyEndColumn,
        } = sourceRange;
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

    private _getMergeApplyData(sourceRange: IRange, destRange: IRange, direction: Direction, csLen: number) {
        const mergeData = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getMergeData();
        const applyMergeRanges = [];
        for (let i = sourceRange.startRow; i <= sourceRange.endRow; i++) {
            for (let j = sourceRange.startColumn; j <= sourceRange.endColumn; j++) {
                const { isMergedMainCell, startRow, startColumn, endRow, endColumn } = getCellInfoInMergeData(
                    i,
                    j,
                    mergeData
                );
                if (isMergedMainCell) {
                    if (direction === Direction.DOWN) {
                        let windowStartRow = startRow + csLen;
                        let windowEndRow = endRow + csLen;
                        while (windowEndRow <= destRange.endRow) {
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
                        while (windowStartRow >= destRange.startRow) {
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
                        while (windowEndColumn <= destRange.endColumn) {
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
                        const windowStartColumn = startColumn - csLen;
                        const windowEndColumn = endColumn - csLen;
                        while (windowStartColumn >= destRange.startColumn) {
                            applyMergeRanges.push({
                                startRow,
                                startColumn: windowStartColumn,
                                endRow,
                                endColumn: windowEndColumn,
                            });
                        }
                    }
                }
            }
        }
        return applyMergeRanges;
    }

    private _presetAndCacheData(sourceRange: IRange, destRange: IRange) {
        // save ranges
        const applyRange = {
            startRow: destRange.startRow,
            endRow: destRange.endRow,
            startColumn: destRange.startColumn,
            endColumn: destRange.endColumn,
        };
        let direction = null;
        if (destRange.startRow < sourceRange.startRow) {
            direction = Direction.UP;
            applyRange.endRow = sourceRange.startRow - 1;
        } else if (destRange.endRow > sourceRange.endRow) {
            direction = Direction.DOWN;
            applyRange.startRow = sourceRange.endRow + 1;
        } else if (destRange.startColumn < sourceRange.startColumn) {
            direction = Direction.LEFT;
            applyRange.endColumn = sourceRange.startColumn - 1;
        } else if (destRange.endColumn > sourceRange.endColumn) {
            direction = Direction.RIGHT;
            applyRange.startColumn = sourceRange.endColumn + 1;
        } else {
            return;
        }
        this._direction = direction;

        // cache original data of apply range
        const currentCellDatas = this._univerInstanceService
            .getCurrentUniverSheetInstance()
            .getActiveSheet()
            .getCellMatrix();
        // cache the original data in currentCellDatas in apply range for later use / refill
        const applyData = [];
        for (let i = applyRange.startRow; i <= applyRange.endRow; i++) {
            const row = [];
            for (let j = applyRange.startColumn; j <= applyRange.endColumn; j++) {
                row.push(Tools.deepClone(currentCellDatas.getValue(i, j)));
            }
            applyData.push(row);
        }
        this._beforeApplyData = applyData;
        this._autoFillService.setRanges(destRange, sourceRange, applyRange);
        this._copyData = this._getCopyData(sourceRange, direction);
        if (this._hasSeries(this._copyData)) {
            this._autoFillService.setDisableApplyType(APPLY_TYPE.SERIES, false);
            this._autoFillService.setApplyType(APPLY_TYPE.SERIES);
        } else {
            this._autoFillService.setDisableApplyType(APPLY_TYPE.SERIES, true);
            this._autoFillService.setApplyType(APPLY_TYPE.COPY);
        }
    }

    // auto fill entry
    private _fillData() {
        const { destRange, sourceRange, applyRange } = this._autoFillService.getRanges();
        const applyType = this._applyType;
        const hasStyle = this._hasFillingStyle;
        const direction = this._direction;

        if (!destRange || !sourceRange || !applyRange || direction == null) {
            return;
        }

        const {
            startRow: copyStartRow,
            startColumn: copyStartColumn,
            endRow: copyEndRow,
            endColumn: copyEndColumn,
        } = sourceRange;

        const {
            startRow: applyStartRow,
            startColumn: applyStartColumn,
            endRow: applyEndRow,
            endColumn: applyEndColumn,
        } = applyRange;

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
                        v: null,
                        s: null,
                        ...this._beforeApplyData[i][j],
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
                        v: null,
                        s: null,
                        ...this._beforeApplyData[i - applyStartRow][j],
                        ...applyData[j],
                    });
                }
                applyDatas.push(row);
            }
        }

        // deal with styles
        let applyMergeRanges;
        const style = this._univerInstanceService.getCurrentUniverSheetInstance().getStyles();
        if (hasStyle) {
            applyMergeRanges = this._getMergeApplyData(sourceRange, destRange, direction, csLen);
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

        // deal with hooks
        const hooks = this._autoFillService.getHooks();
        const extendRedos: IMutationInfo[] = [];
        const extendUndos: IMutationInfo[] = [];
        const hookApplyType: APPLY_TYPE = this._hasFillingStyle ? applyType : APPLY_TYPE.NO_FORMAT;
        hooks.forEach((h) => {
            const { hook } = h;
            const { redos, undos } = hook?.[hookApplyType](sourceRange, applyRange);
            extendRedos.push(...redos);
            extendUndos.push(...undos);
        });

        this._commandService.executeCommand(AutoFillCommand.id, {
            selectionRange: destRange,
            applyRange,
            applyDatas,
            workbookId: this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId(),
            worksheetId: this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId(),
            extendMutations: { undo: extendUndos, redo: extendRedos },
            applyMergeRanges,
        });
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
