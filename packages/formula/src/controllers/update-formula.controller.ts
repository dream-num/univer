import {
    FormulaEngineService,
    generateStringWithSequence,
    IFormulaData,
    IFormulaDataItem,
    ISequenceNode,
    ISheetData,
    IUnitData,
    IUnitSheetNameMap,
    sequenceNodeType,
} from '@univerjs/engine-formula';
import {
    DeleteRangeMutation,
    EffectRefRangId,
    handleDeleteRangeMoveLeft,
    handleDeleteRangeMoveUp,
    handleInsertCol,
    handleInsertRangeMoveDown,
    handleInsertRangeMoveRight,
    handleInsertRow,
    handleIRemoveCol,
    handleIRemoveRow,
    handleMoveRange,
    IDeleteRangeMutationParams,
    IInsertRangeMutationParams,
    IMoveColumnsMutationParams,
    IMoveRowsMutationParams,
    InsertColMutation,
    InsertRangeMutation,
    InsertRowMutation,
    ISetRangeValuesMutationParams,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRangeMutationParams,
    MoveRowsMutation,
    RemoveColMutation,
    RemoveRowMutation,
    runRefRangeMutations,
    SetRangeValuesMutation,
} from '@univerjs/sheets';
import {
    deserializeRangeWithSheet,
    Dimension,
    Direction,
    Disposable,
    ICellData,
    ICommandInfo,
    ICommandService,
    IRange,
    IUnitRange,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    OnLifecycle,
    Rectangle,
    serializeRangeToRefString,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { FormulaDataModel } from '../models/formula-data.model';

interface IUnitRangeWithOffset extends IUnitRange {
    refOffsetX: number;
    refOffsetY: number;
    sheetName: string;
}

enum FormulaReferenceMoveType {
    Move, // range
    InsertRow, // row
    InsertColumn, // column
    RemoveRow, // row
    RemoveColumn, // column
    DeleteMoveLeft, // range
    DeleteMoveUp, // range
    InsertMoveDown, // range
    InsertMoveRight, // range
}

interface IFormulaReferenceMoveParam {
    type: FormulaReferenceMoveType;
    unitId: string;
    sheetId: string;
    ranges?: IRange[];
    from?: IRange;
    to?: IRange;
}

enum OriginRangeEdgeType {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    ALL,
}

function getRangeFromMatrixObject(matrixObject: ObjectMatrixPrimitiveType<ICellData | null>) {
    const matrix = new ObjectMatrix(matrixObject);
    return matrix.getDataRange();
}

@OnLifecycle(LifecycleStages.Starting, UpdateFormulaController)
export class UpdateFormulaController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
    }

    /**
     * TODO: @DR-Univer Temporary method, will be deleted later.
     * @returns
     */
    private _getCalculateData() {
        const unitAllSheet = this._currentUniverService.getAllUniverSheetsInstance();

        const formulaData: IFormulaData = {};

        const allUnitData: IUnitData = {};

        const unitSheetNameMap: IUnitSheetNameMap = {};

        for (const workbook of unitAllSheet) {
            const unitId = workbook.getUnitId();
            if (formulaData[unitId] == null) {
                formulaData[unitId] = {};
            }
            const sheets = workbook.getSheets();

            const workbookFormulaData = formulaData[unitId];

            const sheetData: ISheetData = {};

            const sheetNameMap: { [sheetName: string]: string } = {};

            for (const sheet of sheets) {
                const sheetId = sheet.getSheetId();
                if (workbookFormulaData[sheetId] == null) {
                    workbookFormulaData[sheetId] = {};
                }

                const sheetFormulaData = workbookFormulaData[sheetId];

                const cellDatas = sheet.getCellMatrix();

                cellDatas.forValue((row, column, cellData) => {
                    if (cellData?.f != null) {
                        if (sheetFormulaData[row] == null) {
                            sheetFormulaData[row] = {};
                        }
                        sheetFormulaData[row][column] = {
                            f: cellData.f,
                            x: 0,
                            y: 0,
                        };
                    }
                });

                const sheetConfig = sheet.getConfig();
                sheetData[sheetId] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                };
                sheetNameMap[sheet.getName()] = sheet.getSheetId();
            }

            allUnitData[unitId] = sheetData;

            unitSheetNameMap[unitId] = sheetNameMap;
        }

        return {
            formulaData,
            allUnitData,
            unitSheetNameMap,
        };
    }

    private _commandExecutedListener() {
        const updateCommandList = [
            MoveRangeMutation.id,
            MoveRowsMutation.id,
            MoveColsMutation.id,
            InsertRangeMutation.id,
            InsertRowMutation.id,
            InsertColMutation.id,
            DeleteRangeMutation.id,
            RemoveRowMutation.id,
            RemoveColMutation.id,
        ];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                const { id } = command;
                let result: Nullable<IFormulaReferenceMoveParam> = null;

                // TODO@Dushusir: handle cut operation, same as move operation
                switch (id) {
                    case MoveRangeMutation.id:
                        result = this._handleMoveRange(command as ICommandInfo<MoveRangeMutationParams>);
                        break;
                    case MoveRowsMutation.id:
                        result = this._handleMoveRows(command as ICommandInfo<IMoveRowsMutationParams>);
                        break;
                    case MoveColsMutation.id:
                        result = this._handleMoveCols(command as ICommandInfo<IMoveColumnsMutationParams>);
                        break;
                    case InsertRangeMutation.id:
                        result = this._handleInsertRange(command as ICommandInfo<IInsertRangeMutationParams>);
                        break;
                    case DeleteRangeMutation.id:
                        result = this._handleDeleteRange(command as ICommandInfo<IDeleteRangeMutationParams>);
                        break;
                }

                // TODO@Dushusir: update formula and get update cell data matrix
                if (result) {
                    const state = this._getCalculateData();
                    this.getFormulaReferenceMoveInfo(state.formulaData, state.unitSheetNameMap, result).then(
                        (cellValue) => {
                            this._updateFormula(cellValue);
                        }
                    );
                }
            })
        );
    }

    private _handleMoveRange(command: ICommandInfo<MoveRangeMutationParams>) {
        const { params } = command;
        if (!params) return null;

        const { from, to, workbookId, worksheetId } = params;
        if (!from || !to) return null;

        return {
            type: FormulaReferenceMoveType.Move,
            from: getRangeFromMatrixObject(from),
            to: getRangeFromMatrixObject(to),
            unitId: workbookId,
            sheetId: worksheetId,
        };
    }

    private _handleMoveRows(command: ICommandInfo<IMoveRowsMutationParams>) {
        const { params } = command;
        if (!params) return null;

        const { sourceRange, targetRange, workbookId, worksheetId } = params;
        return {
            type: FormulaReferenceMoveType.Move,
            from: sourceRange,
            to: targetRange,
            unitId: workbookId,
            sheetId: worksheetId,
        };
    }

    private _handleMoveCols(command: ICommandInfo<IMoveColumnsMutationParams>) {
        const { params } = command;
        if (!params) return null;

        const { sourceRange, targetRange, workbookId, worksheetId } = params;
        return {
            type: FormulaReferenceMoveType.Move,
            from: sourceRange,
            to: targetRange,
            unitId: workbookId,
            sheetId: worksheetId,
        };
    }

    private _handleInsertRange(command: ICommandInfo<IInsertRangeMutationParams>) {
        const { params } = command;
        if (!params) return null;

        const { ranges, shiftDimension, workbookId, worksheetId } = params;

        if (shiftDimension === Dimension.ROWS) {
            return {
                type: FormulaReferenceMoveType.InsertMoveDown,
                ranges,
                unitId: workbookId,
                sheetId: worksheetId,
            };
        }
        if (shiftDimension === Dimension.COLUMNS) {
            return {
                type: FormulaReferenceMoveType.InsertMoveRight,
                ranges,
                unitId: workbookId,
                sheetId: worksheetId,
            };
        }
    }

    private _handleDeleteRange(command: ICommandInfo<IDeleteRangeMutationParams>) {
        const { params } = command;
        if (!params) return null;

        const { ranges, shiftDimension, workbookId, worksheetId } = params;

        if (shiftDimension === Dimension.ROWS) {
            return {
                type: FormulaReferenceMoveType.DeleteMoveUp,
                ranges,
                unitId: workbookId,
                sheetId: worksheetId,
            };
        }
        if (shiftDimension === Dimension.COLUMNS) {
            return {
                type: FormulaReferenceMoveType.DeleteMoveLeft,
                ranges,
                unitId: workbookId,
                sheetId: worksheetId,
            };
        }
    }

    private _updateFormula(formulaData: ObjectMatrixPrimitiveType<ICellData>) {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const workbookId = workbook.getUnitId();
        const worksheetId = workbook.getActiveSheet().getSheetId();

        const cellValue = formulaData['workbook-01' as any]['sheet-0011' as any] as any;

        if (cellValue == null) {
            return;
        }

        const setRangeValuesMutation: ISetRangeValuesMutationParams = {
            worksheetId: 'sheet-0011',
            workbookId: 'workbook-01',
            cellValue,
        };

        this._commandService.executeCommand(SetRangeValuesMutation.id, setRangeValuesMutation);
    }

    async getFormulaReferenceMoveInfo(
        formulaData: IFormulaData,
        unitSheetNameMap: IUnitSheetNameMap,
        formulaReferenceMoveParam: IFormulaReferenceMoveParam
    ) {
        const formulaDataKeys = Object.keys(formulaData);

        const newFormulaData: IFormulaData = {};

        for (const unitId of formulaDataKeys) {
            const sheetData = formulaData[unitId];

            const sheetDataKeys = Object.keys(sheetData);

            if (newFormulaData[unitId] == null) {
                newFormulaData[unitId] = {};
            }

            for (const sheetId of sheetDataKeys) {
                const matrixData = new ObjectMatrix(sheetData[sheetId]);

                const newFormulaDataItem = new ObjectMatrix<IFormulaDataItem>();

                matrixData.forValue((row, column, formulaDataItem) => {
                    const { f: formulaString, x, y, si } = formulaDataItem;

                    const sequenceNodes = this._formulaEngineService.buildSequenceNodes(formulaString);

                    if (sequenceNodes == null) {
                        return true;
                    }

                    let shouldModify = false;
                    const refChangeIds: number[] = [];
                    for (let i = 0, len = sequenceNodes.length; i < len; i++) {
                        const node = sequenceNodes[i];
                        if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
                            continue;
                        }
                        const { token } = node;

                        const sequenceGrid = deserializeRangeWithSheet(token);

                        const { range, sheetName, unitId: sequenceUnitId } = sequenceGrid;

                        const sequenceSheetId = unitSheetNameMap?.[sequenceUnitId]?.[sheetName];

                        const sequenceUnitRangeWidthOffset = {
                            range,
                            sheetId: sequenceSheetId,
                            unitId: sequenceUnitId,
                            sheetName,
                            refOffsetX: x || 0,
                            refOffsetY: y || 0,
                        };

                        const newRefString = this._getNewRangeByMoveParam(
                            sequenceUnitRangeWidthOffset,
                            formulaReferenceMoveParam,
                            unitId,
                            sheetId
                        );

                        if (newRefString != null) {
                            sequenceNodes[i] = {
                                ...node,
                                token: newRefString,
                            };
                            shouldModify = true;
                            refChangeIds.push(i);
                        }
                    }

                    if (!shouldModify) {
                        return true;
                    }

                    const newSequenceNodes = this._updateRefOffset(sequenceNodes, refChangeIds, x, y);

                    newFormulaDataItem.setValue(row, column, {
                        f: `=${generateStringWithSequence(newSequenceNodes)}`,
                        x,
                        y,
                        si,
                    });
                });

                newFormulaData[unitId][sheetId] = newFormulaDataItem.getData();
            }
        }

        return newFormulaData;
    }

    private _getNewRangeByMoveParam(
        unitRangeWidthOffset: IUnitRangeWithOffset,
        formulaReferenceMoveParam: IFormulaReferenceMoveParam,
        currentFormulaUnitId: string,
        currentFormulaSheetId: string
    ) {
        const { type, unitId: userUnitId, sheetId: userSheetId, ranges, from, to } = formulaReferenceMoveParam;

        const {
            range,
            sheetId: sequenceRangeSheetId,
            unitId: sequenceRangeUnitId,
            sheetName: sequenceRangeSheetName,
            refOffsetX,
            refOffsetY,
        } = unitRangeWidthOffset;

        if (
            !this._checkIsSameUnitAndSheet(
                userUnitId,
                userSheetId,
                currentFormulaUnitId,
                currentFormulaSheetId,
                sequenceRangeUnitId,
                sequenceRangeSheetId
            )
        ) {
            return;
        }

        const sequenceRange = Rectangle.moveOffset(range, refOffsetX, refOffsetY);
        let newRange: Nullable<IRange> = null;

        if (type === FormulaReferenceMoveType.Move) {
            if (from == null || to == null) {
                return;
            }

            const moveEdge = this._checkMoveEdge(sequenceRange, from);

            // const fromAndToDirection = this._checkMoveFromAndToDirection(from, to);

            // if (moveEdge == null) {
            //     return;
            // }

            const remainRange = Rectangle.getIntersects(sequenceRange, from);

            if (remainRange == null) {
                return;
            }

            const operators = handleMoveRange(
                { id: EffectRefRangId.MoveRangeCommandId, params: { toRange: to, fromRange: from } },
                remainRange
            );

            const result = runRefRangeMutations(operators, remainRange);

            if (result == null) {
                return;
            }

            newRange = this._getMoveNewRange(moveEdge, result, from, to, sequenceRange, remainRange);
        }

        if (ranges != null) {
            if (type === FormulaReferenceMoveType.InsertRow) {
                const operators = handleInsertRow(
                    {
                        id: EffectRefRangId.InsertRowCommandId,
                        params: { range: ranges[0], workbookId: '', worksheetId: '', direction: Direction.DOWN },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.InsertColumn) {
                const operators = handleInsertCol(
                    {
                        id: EffectRefRangId.InsertColCommandId,
                        params: { range: ranges[0], workbookId: '', worksheetId: '', direction: Direction.RIGHT },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.RemoveRow) {
                const operators = handleIRemoveRow(
                    {
                        id: EffectRefRangId.RemoveRowCommandId,
                        params: { ranges },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.RemoveColumn) {
                const operators = handleIRemoveCol(
                    {
                        id: EffectRefRangId.RemoveColCommandId,
                        params: { ranges },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.DeleteMoveLeft) {
                const operators = handleDeleteRangeMoveLeft(
                    {
                        id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                        params: { ranges },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.DeleteMoveUp) {
                const operators = handleDeleteRangeMoveUp(
                    {
                        id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                        params: { ranges },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.InsertMoveDown) {
                const operators = handleInsertRangeMoveDown(
                    {
                        id: EffectRefRangId.InsertRangeMoveDownCommandId,
                        params: { ranges },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            } else if (type === FormulaReferenceMoveType.InsertMoveRight) {
                const operators = handleInsertRangeMoveRight(
                    {
                        id: EffectRefRangId.InsertRangeMoveRightCommandId,
                        params: { ranges },
                    },
                    sequenceRange
                );

                const result = runRefRangeMutations(operators, sequenceRange);

                if (result == null) {
                    return;
                }

                newRange = {
                    ...sequenceRange,
                    ...result,
                };
            }
        }

        if (newRange == null) {
            return;
        }

        return serializeRangeToRefString({
            range: newRange,
            sheetName: sequenceRangeSheetName,
            unitId: sequenceRangeUnitId,
        });
    }

    private _checkIsSameUnitAndSheet(
        userUnitId: string,
        userSheetId: string,
        currentFormulaUnitId: string,
        currentFormulaSheetId: string,
        sequenceRangeUnitId: string,
        sequenceRangeSheetId: string
    ) {
        if (
            (sequenceRangeUnitId == null || sequenceRangeUnitId.length === 0) &&
            (sequenceRangeSheetId == null || sequenceRangeSheetId.length === 0)
        ) {
            if (userUnitId === currentFormulaUnitId && userSheetId === currentFormulaSheetId) {
                return true;
            }
        } else if (userUnitId === sequenceRangeUnitId && userSheetId === sequenceRangeSheetId) {
            return true;
        }

        return false;
    }

    /**
     * Update all ref nodes to the latest offset state.
     */
    private _updateRefOffset(
        sequenceNodes: Array<string | ISequenceNode>,
        refChangeIds: number[],
        refOffsetX: number = 0,
        refOffsetY: number = 0
    ) {
        const newSequenceNodes: Array<string | ISequenceNode> = [];
        for (let i = 0, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE || refChangeIds.includes(i)) {
                newSequenceNodes.push(node);
                continue;
            }

            const { token } = node;

            const sequenceGrid = deserializeRangeWithSheet(token);

            const { range, sheetName, unitId: sequenceUnitId } = sequenceGrid;

            const newRange = Rectangle.moveOffset(range, refOffsetX, refOffsetY);

            newSequenceNodes.push({
                ...node,
                token: serializeRangeToRefString({
                    range: newRange,
                    unitId: sequenceUnitId,
                    sheetName,
                }),
            });
        }

        return newSequenceNodes;
    }

    /**
     * Determine the range of the moving selection,
     * and check if it is at the edge of the reference range of the formula.
     * @param originRange
     * @param fromRange
     */
    private _checkMoveEdge(originRange: IRange, fromRange: IRange): Nullable<OriginRangeEdgeType> {
        const { startRow, startColumn, endRow, endColumn } = originRange;

        const {
            startRow: fromStartRow,
            startColumn: fromStartColumn,
            endRow: fromEndRow,
            endColumn: fromEndColumn,
        } = fromRange;

        if (
            startRow >= fromStartRow &&
            endRow <= fromEndRow &&
            startColumn >= fromStartColumn &&
            endColumn <= fromEndColumn
        ) {
            return OriginRangeEdgeType.ALL;
        }

        if (
            startColumn >= fromStartColumn &&
            endColumn <= fromEndColumn &&
            startRow >= fromStartRow &&
            startRow <= fromEndRow &&
            endRow > fromEndRow
        ) {
            return OriginRangeEdgeType.UP;
        }

        if (
            startColumn >= fromStartColumn &&
            endColumn <= fromEndColumn &&
            endRow >= fromStartRow &&
            endRow <= fromEndRow &&
            startRow < fromStartRow
        ) {
            return OriginRangeEdgeType.DOWN;
        }

        if (
            startRow >= fromStartRow &&
            endRow <= fromEndRow &&
            startColumn >= fromStartColumn &&
            startColumn <= fromEndColumn &&
            endColumn > fromEndColumn
        ) {
            return OriginRangeEdgeType.LEFT;
        }

        if (
            startRow >= fromStartRow &&
            endRow <= fromEndRow &&
            endColumn >= fromStartColumn &&
            endColumn <= fromEndColumn &&
            startColumn < fromStartColumn
        ) {
            return OriginRangeEdgeType.RIGHT;
        }
    }

    /**
     *  Calculate the new ref information for the moving selection.
     * @param moveEdge  the 'from' range lie on the edge of the original range, or does it completely cover the original range
     * @param result The original range is divided by 'from' and moved to a new position range.
     * @param from The initial range of the moving selection.
     * @param to The result range after moving the initial range.
     * @param origin The original target range.
     * @param remain "The range subtracted from the initial range by 'from'.
     * @returns
     */
    private _getMoveNewRange(
        moveEdge: Nullable<OriginRangeEdgeType>,
        result: IRange,
        from: IRange,
        to: IRange,
        origin: IRange,
        remain: IRange
    ) {
        const { startRow, endRow, startColumn, endColumn } = result;

        const {
            startRow: fromStartRow,
            startColumn: fromStartColumn,
            endRow: fromEndRow,
            endColumn: fromEndColumn,
        } = from;

        const { startRow: toStartRow, startColumn: toStartColumn, endRow: toEndRow, endColumn: toEndColumn } = to;

        const {
            startRow: remainStartRow,
            endRow: remainEndRow,
            startColumn: remainStartColumn,
            endColumn: remainEndColumn,
        } = remain;

        const {
            startRow: originStartRow,
            endRow: originEndRow,
            startColumn: originStartColumn,
            endColumn: originEndColumn,
        } = origin;

        const newRange = { ...origin };

        if (moveEdge === OriginRangeEdgeType.UP) {
            if (startColumn === originStartColumn && endColumn === originEndColumn) {
                if (startRow < originStartRow) {
                    newRange.startRow = startRow;
                } else if (endRow < originEndRow) {
                    newRange.startRow = startRow;
                } else if (endRow >= originEndRow && toStartRow <= originEndRow) {
                    newRange.startRow = fromEndRow + 1;
                    newRange.endRow = endRow;
                } else {
                    return;
                }
            } else {
                return;
            }
        } else if (moveEdge === OriginRangeEdgeType.DOWN) {
            if (startColumn === originStartColumn && endColumn === originEndColumn) {
                if (endRow > originEndRow) {
                    newRange.endRow = endRow;
                } else if (startRow > originStartRow) {
                    newRange.endRow = endRow;
                } else if (startRow <= originStartRow && toEndRow >= originStartRow) {
                    newRange.endRow = fromStartRow + 1;
                    newRange.startRow = startRow;
                } else {
                    return;
                }
            } else {
                return;
            }
        } else if (moveEdge === OriginRangeEdgeType.LEFT) {
            if (startRow === originStartRow && endRow === originEndRow) {
                if (startColumn < originStartColumn) {
                    newRange.startColumn = startColumn;
                } else if (endColumn < originEndColumn) {
                    newRange.startColumn = startColumn;
                } else if (endColumn >= originEndColumn && toStartColumn <= originEndColumn) {
                    newRange.startColumn = fromEndColumn + 1;
                    newRange.endColumn = endColumn;
                } else {
                    return;
                }
            } else {
                return;
            }
        } else if (moveEdge === OriginRangeEdgeType.RIGHT) {
            if (startRow === originStartRow && endRow === originEndRow) {
                if (endColumn > originEndColumn) {
                    newRange.endColumn = endColumn;
                } else if (startColumn > originStartColumn) {
                    newRange.endColumn = endColumn;
                } else if (startColumn <= originStartColumn && toEndColumn >= originStartColumn) {
                    newRange.endColumn = fromStartColumn + 1;
                    newRange.startColumn = startColumn;
                } else {
                    return;
                }
            } else {
                return;
            }
        } else if (moveEdge === OriginRangeEdgeType.ALL) {
            newRange.startRow = startRow;
            newRange.startColumn = startColumn;
            newRange.endRow = endRow;
            newRange.endColumn = endColumn;
        } else if (
            ((toStartColumn <= remainEndColumn + 1 && toEndColumn >= originEndColumn) ||
                (toStartColumn <= originStartColumn && toEndColumn >= remainStartColumn - 1)) &&
            toStartRow <= originStartRow &&
            toEndRow >= originEndRow
        ) {
            newRange.startRow = startRow;
            newRange.startColumn = startColumn;
            newRange.endRow = endRow;
            newRange.endColumn = endColumn;
        } else if (
            ((toStartRow <= remainEndRow + 1 && toEndRow >= originEndRow) ||
                (toStartRow <= originStartRow && toEndRow >= remainStartRow - 1)) &&
            toStartColumn <= originStartColumn &&
            toEndColumn >= originEndColumn
        ) {
            newRange.startRow = startRow;
            newRange.startColumn = startColumn;
            newRange.endRow = endRow;
            newRange.endColumn = endColumn;
        }

        return newRange;
    }

    private _getInsertNewRange() {}
}
