import { getCellInfoInMergeData } from '@univerjs/base-render';
import { AutoFillCommand } from '@univerjs/base-sheets';
import { APPLY_TYPE } from '@univerjs/base-sheets/services/auto-fill/type.js';
import {
    Direction,
    Disposable,
    ICellData,
    ICommandService,
    IRange,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';

import { AutoFillCommand } from '../commands/commands/auto-fill.command';
import { IAutoFillService } from '../services/auto-fill/auto-fill.service';
import { otherRule } from '../services/auto-fill/rules';
import { fillCopy, fillCopyStyles, getDataIndex, getLenS } from '../services/auto-fill/tools';
import { APPLY_FUNCTIONS, APPLY_TYPE, ICopyDataPiece, IRuleConfirmedData } from '../services/auto-fill/type';
import { IControlFillConfig, ISelectionRenderService } from '../services/selection/selection-render.service';

@OnLifecycle(LifecycleStages.Ready, AutoFillController)
export class AutoFillController extends Disposable {
    private _direction: Direction;
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @ICommandService private readonly _commandService: ICommandService,
        @IAutoFillService private readonly _autoFillService: IAutoFillService
    ) {
        super();
        this._onSelectionControlFillChanged();
    }

    private _onSelectionControlFillChanged() {
        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.controlFillConfig$.subscribe((config: IControlFillConfig | null) => {
                    if (!config) {
                        return;
                    }
                    this._fillData(config);
                })
            )
        );
    }

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

        rules.forEach((r) => {
            const { type, applyFunctions: customApplyFunctions } = r;
            const copyDataInType = copyDataPiece[type];
            if (!copyDataInType) {
                return;
            }
            copyDataInType.forEach((copySquad) => {
                const s = getLenS(copySquad.index, rsd);
                const len = copySquad.index.length * num + s;
                const arrData = this._applyFunctions(copySquad.data, len, direction, applyType, customApplyFunctions);
                const arrIndex = getDataIndex(csLen, asLen, copySquad.index);
                applyDataInTypes[type].push({ data: arrData, index: arrIndex });
            });
        });

        for (let x = 1; x <= asLen; x++) {
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
        data: Array<Nullable<ICellData>>,
        len: number,
        direction: Direction,
        applyType: APPLY_TYPE,
        customApplyFunctions?: APPLY_FUNCTIONS
    ) {
        const isReverse = direction === Direction.UP || direction === Direction.LEFT;
        if (applyType === APPLY_TYPE.COPY) {
            const custom = customApplyFunctions?.[APPLY_TYPE.COPY];
            if (custom) {
                return custom(data, len, direction);
            }
            isReverse && data.reverse();
            return fillCopy(data, len);
        }
        if (applyType === APPLY_TYPE.SERIES) {
            const custom = customApplyFunctions?.[APPLY_TYPE.SERIES];
            if (custom) {
                return custom(data, len, direction);
            }
            isReverse && data.reverse();
            return fillCopy(data, len);
        }
        if (applyType === APPLY_TYPE.ONLY_FORMAT) {
            const custom = customApplyFunctions?.[APPLY_TYPE.ONLY_FORMAT];
            if (custom) {
                return custom(data, len, direction);
            }
            return fillCopyStyles(data, len);
        }
    }

    private _getCopyData(copyRange: IRange, direction: Direction) {
        const {
            startRow: copyStartRow,
            startColumn: copyStartColumn,
            endRow: copyEndRow,
            endColumn: copyEndColumn,
        } = copyRange;
        const currentCellDatas = this._univerInstanceService
            .getCurrentUniverSheetInstance()
            .getActiveSheet()
            .getCellMatrix();
        const rules = this._autoFillService.getRules();
        const copyData = [];
        const isVertical = direction === Direction.DOWN || direction === Direction.UP;
        let a1;
        let a2;
        let b1;
        let b2;
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
                    last.index.push(b - b1 + 1);
                } else {
                    const typeInfo = copyDataPiece[type];
                    if (typeInfo) {
                        typeInfo.push({
                            data: [data],
                            index: [b - b1 + 1],
                        });
                    } else {
                        copyDataPiece[type] = [
                            {
                                data: [data],
                                index: [b - b1 + 1],
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

    private _getMergeApplyData(copyRange: IRange, newRange: IRange, direction: Direction, csLen: number) {
        const mergeData = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getMergeData();
        const applyMergeRanges = [];
        for (let i = copyRange.startRow; i <= copyRange.endRow; i++) {
            for (let j = copyRange.startColumn; j <= copyRange.endColumn; j++) {
                const { isMergedMainCell, startRow, startColumn, endRow, endColumn } = getCellInfoInMergeData(
                    i,
                    j,
                    mergeData
                );
                if (isMergedMainCell) {
                    if (direction === Direction.DOWN) {
                        let windowStartRow = startRow + csLen;
                        let windowEndRow = endRow + csLen;
                        while (windowEndRow <= newRange.endRow) {
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
                        while (windowStartRow >= newRange.startRow) {
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
                        while (windowEndColumn <= newRange.endColumn) {
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
                        while (windowStartColumn >= newRange.startColumn) {
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

    private _fillData(config: IControlFillConfig) {
        const { newRange, oldRange: copyRange } = config;
        const hasStyle = this._autoFillService.isFillingStyle();
        const applyRange = {
            startRow: newRange.startRow,
            endRow: newRange.endRow,
            startColumn: newRange.startColumn,
            endColumn: newRange.endColumn,
        };
        // calc direction & apply range according to new ranges's start & end and current selection's start & end in config
        let direction: Direction;
        if (newRange.startRow < copyRange.startRow) {
            direction = Direction.UP;
            applyRange.endRow = copyRange.startRow - 1;
        } else if (newRange.endRow > copyRange.endRow) {
            direction = Direction.DOWN;
            applyRange.startRow = copyRange.endRow + 1;
        } else if (newRange.startColumn < copyRange.startColumn) {
            direction = Direction.LEFT;
            applyRange.endColumn = copyRange.startColumn - 1;
        } else if (newRange.endColumn > copyRange.endColumn) {
            direction = Direction.RIGHT;
            applyRange.startColumn = copyRange.endColumn + 1;
        } else {
            return;
        }
        this._direction = direction;

        const {
            startRow: copyStartRow,
            startColumn: copyStartColumn,
            endRow: copyEndRow,
            endColumn: copyEndColumn,
        } = copyRange;

        const {
            startRow: applyStartRow,
            startColumn: applyStartColumn,
            endRow: applyEndRow,
            endColumn: applyEndColumn,
        } = applyRange;

        const copyData = this._getCopyData(copyRange, direction);

        let csLen;
        if (direction === Direction.DOWN || direction === Direction.UP) {
            csLen = copyEndRow - copyStartRow + 1;
        } else {
            csLen = copyEndColumn - copyStartColumn + 1;
        }

        const applyType = this._autoFillService.getApplyType();
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
                    row.push(untransformedApplyDatas[j][i]);
                }
                applyDatas.push(row);
            }
        } else {
            const asLen = applyEndColumn - applyStartColumn + 1;
            for (let i = applyStartRow; i <= applyEndRow; i++) {
                const copyD = copyData[i - applyStartRow];
                const applyData = this._getApplyData(copyD, csLen, asLen, direction, applyType, hasStyle);
                applyDatas.push(applyData);
            }
        }

        let applyMergeRanges;
        if (hasStyle) {
            applyMergeRanges = this._getMergeApplyData(copyRange, newRange, direction, csLen);
        } else {
            applyDatas.forEach((row) => {
                row.forEach((cellData) => {
                    cellData && (cellData.s = undefined);
                });
            });
        }

        console.error('applyMergeRanges', applyMergeRanges);
        this._commandService.executeCommand(AutoFillCommand.id, {
            selectionRange: newRange,
            applyRange,
            applyDatas,
            workbookId: this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId(),
            worksheetId: this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId(),
            applyMergeRanges,
        });
    }
}
