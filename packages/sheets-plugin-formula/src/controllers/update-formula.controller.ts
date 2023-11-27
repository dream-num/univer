import {
    FormulaEngineService,
    generateStringWithSequence,
    IFormulaData,
    IFormulaDataItem,
    ISequenceNode,
    IUnitSheetNameMap,
    sequenceNodeType,
} from '@univerjs/base-formula-engine';
import {
    DeleteRangeMutation,
    EffectRefRangId,
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
} from '@univerjs/base-sheets';
import {
    deserializeRangeWithSheet,
    Dimension,
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
    Insert, // row column
    Remove, // row column
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
                // if (result) {
                //     this._updateFormula(cellValue);
                // }
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

    private _updateFormula(cellValue: ObjectMatrixPrimitiveType<ICellData>) {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const workbookId = workbook.getUnitId();
        const worksheetId = workbook.getActiveSheet().getSheetId();

        const setRangeValuesMutation: ISetRangeValuesMutationParams = {
            worksheetId,
            workbookId,
            cellValue,
        };

        this._commandService.executeCommand(SetRangeValuesMutation.id, setRangeValuesMutation);
    }

    async getFormulaReferenceMoveInfo(
        formulaData: IFormulaData,
        sheetNameMap: IUnitSheetNameMap,
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

                        const sequenceSheetId = sheetNameMap[sequenceUnitId][sheetName];

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
                        f: generateStringWithSequence(newSequenceNodes),
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

        const sequenceRange = this._refOffset(range, refOffsetX, refOffsetY);
        let newRange: Nullable<IRange> = null;
        if (type === FormulaReferenceMoveType.Move) {
            if (from == null || to == null) {
                return;
            }

            const moveEdge = this._checkMoveEdge(sequenceRange, from);

            // const fromAndToDirection = this._checkMoveFromAndToDirection(from, to);

            if (moveEdge == null) {
                return;
            }

            const operators = handleMoveRange(
                { id: EffectRefRangId.MoveRangeCommandId, params: { toRange: to, fromRange: from } },
                sequenceRange
            );

            const result = runRefRangeMutations(operators, sequenceRange);

            if (result == null) {
                return;
            }

            newRange = this._getMoveNewRange(moveEdge, result, from, to, sequenceRange);
        }

        if (ranges == null) {
            return;
        }

        if (type === FormulaReferenceMoveType.Insert) {
            console.log();
        } else if (type === FormulaReferenceMoveType.Remove) {
            console.log();
        } else if (type === FormulaReferenceMoveType.DeleteMoveLeft) {
            console.log();
        } else if (type === FormulaReferenceMoveType.DeleteMoveUp) {
            console.log();
        } else if (type === FormulaReferenceMoveType.InsertMoveDown) {
            console.log();
        } else if (type === FormulaReferenceMoveType.InsertMoveRight) {
            console.log();
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

    private _refOffset(range: IRange, refOffsetX: number, refOffsetY: number) {
        const { startRow, endRow, startColumn, endColumn, startAbsoluteRefType, endAbsoluteRefType } = range;

        return {
            startRow: startRow + refOffsetY,
            endRow: endRow + refOffsetY,
            startColumn: startColumn + refOffsetX,
            endColumn: endColumn + refOffsetX,
            startAbsoluteRefType,
            endAbsoluteRefType,
        };
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

            const newRange = this._refOffset(range, refOffsetX, refOffsetY);

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
     * Determine whether the direction from 'from' to 'to' in the moving selection is vertical or horizontal.
     * If there is an offset, the range is null.
     * @param selfRange
     * @param fromRange
     */
    private _checkMoveFromAndToDirection(
        originRange: IRange,
        from: IRange,
        to: IRange
    ): Nullable<{ direction: OriginRangeEdgeType; step: number }> {
        const {
            startRow: fromStartRow,
            startColumn: fromStartColumn,
            endRow: fromEndRow,
            endColumn: fromEndColumn,
        } = from;

        const { startRow, startColumn, endRow, endColumn } = to;

        if (
            startRow === fromStartRow &&
            startColumn === fromStartColumn &&
            endRow === fromEndRow &&
            endColumn === fromEndColumn
        ) {
            return;
        }

        if (startColumn === fromStartColumn && endColumn === fromEndColumn) {
            let step = startRow - fromStartRow;
            let direction = OriginRangeEdgeType.DOWN;
            if (step < 0) {
                step = Math.abs(step);
                direction = OriginRangeEdgeType.UP;
            }
            return {
                direction,
                step,
            };
        }

        if (startRow === fromStartRow && endRow === fromEndRow) {
            let step = startColumn - fromStartColumn;
            let direction = OriginRangeEdgeType.RIGHT;
            if (step < 0) {
                step = Math.abs(step);
                direction = OriginRangeEdgeType.LEFT;
            }
            return {
                direction,
                step,
            };
        }
    }

    /**
     * Calculate the new ref information for the moving selection.
     */
    private _getMoveNewRange(moveEdge: OriginRangeEdgeType, result: IRange, from: IRange, to: IRange, target: IRange) {
        const { startRow, endRow, startColumn, endColumn } = result;

        const {
            startRow: fromStartRow,
            startColumn: fromStartColumn,
            endRow: fromEndRow,
            endColumn: fromEndColumn,
        } = from;

        const { startRow: toStartRow, startColumn: toStartColumn, endRow: toEndRow, endColumn: toEndColumn } = to;

        const {
            startRow: targetStartRow,
            endRow: targetEndRow,
            startColumn: targetStartColumn,
            endColumn: targetEndColumn,
        } = target;

        const newRange = { ...target };

        if (moveEdge === OriginRangeEdgeType.UP) {
            console.log();
        } else if (moveEdge === OriginRangeEdgeType.DOWN) {
            console.log();
        } else if (moveEdge === OriginRangeEdgeType.LEFT) {
            if (startRow === targetStartRow && endRow === targetEndRow) {
                if (startColumn < targetStartColumn) {
                    newRange.startColumn = startColumn;
                } else if (endColumn < targetEndColumn) {
                    newRange.startColumn = startColumn;
                } else if (endColumn >= targetEndColumn && toStartColumn < targetEndColumn) {
                    newRange.startColumn = fromEndColumn;
                    newRange.endColumn = endColumn;
                } else {
                    return;
                }
            } else if (
                toStartColumn <= targetEndColumn &&
                toEndColumn >= targetEndColumn &&
                toStartRow <= targetStartRow &&
                toEndRow >= targetEndRow
            ) {
                newRange.startRow = startRow;
                newRange.startColumn = startColumn;
                newRange.endRow = endRow;
                newRange.endColumn = endColumn;
            }
        } else if (moveEdge === OriginRangeEdgeType.RIGHT) {
            console.log();
        } else if (moveEdge === OriginRangeEdgeType.ALL) {
            newRange.startRow = startRow;
            newRange.startColumn = startColumn;
            newRange.endRow = endRow;
            newRange.endColumn = endColumn;
        }

        return newRange;
    }
}

function getRangeFromMatrixObject(matrixObject: ObjectMatrixPrimitiveType<ICellData | null>) {
    const matrix = new ObjectMatrix(matrixObject);
    return matrix.getDataRange();
}
