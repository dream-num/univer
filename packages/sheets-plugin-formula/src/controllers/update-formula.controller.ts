import {
    FormulaEngineService,
    generateStringWithSequence,
    IFormulaData,
    IFormulaDataItem,
    IUnitSheetNameMap,
    sequenceNodeType,
} from '@univerjs/base-formula-engine';
import {
    DeleteRangeMutation,
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
    SetRangeValuesMutation,
} from '@univerjs/base-sheets';
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
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { FormulaDataModel } from '../models/formula-data.model';

interface IUnitRangeWithOffset extends IUnitRange {
    refOffsetX: number;
    refOffsetY: number;
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
                    for (const sequence of sequenceNodes) {
                        if (typeof sequence === 'string' || sequence.nodeType !== sequenceNodeType.REFERENCE) {
                            continue;
                        }
                        const { token } = sequence;

                        const sequenceGrid = deserializeRangeWithSheet(token);

                        const { range, sheetName, unitId: sequenceUnitId } = sequenceGrid;

                        const sequenceSheetId = sheetNameMap[sequenceUnitId][sheetName];

                        const sequenceUnitRangeWidthOffset = {
                            range,
                            sheetId: sequenceSheetId,
                            unitId: sequenceUnitId,
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
                            sequence.token = newRefString;
                            shouldModify = true;
                        }
                    }

                    if (!shouldModify) {
                        return true;
                    }

                    newFormulaDataItem.setValue(row, column, {
                        f: generateStringWithSequence(sequenceNodes),
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

        if (type === FormulaReferenceMoveType.Move) {
            if (from == null || to == null) {
                return;
            }

            const direction = this._checkMoveEdge(sequenceRange, from);

            if (direction == null) {
                return;
            }

            switch (direction) {
                case Direction.UP:
                    break;
                case Direction.DOWN:
                    break;
                case Direction.LEFT:
                    break;
                case Direction.RIGHT:
                    break;
            }
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
        const { startRow, endRow, startColumn, endColumn } = range;

        return {
            startRow: startRow + refOffsetY,
            endRow: endRow + refOffsetY,
            startColumn: startColumn + refOffsetX,
            endColumn: endColumn + refOffsetX,
        };
    }

    /**
     * Determine the range of the moving selection,
     * and check if it is at the edge of the reference range of the formula.
     * @param selfRange
     * @param fromRange
     */
    private _checkMoveEdge(selfRange: IRange, fromRange: IRange): Nullable<Direction> {}

    /**
     * Determine whether the direction from 'from' to 'to' in the moving selection is vertical or horizontal.
     * If there is an offset, the range is null.
     * @param selfRange
     * @param fromRange
     */
    private _checkMoveFromAndToDirection(from: IRange, to: IRange): Nullable<Direction> {}
}

function getRangeFromMatrixObject(matrixObject: ObjectMatrixPrimitiveType<ICellData | null>) {
    const matrix = new ObjectMatrix(matrixObject);
    return matrix.getDataRange();
}
