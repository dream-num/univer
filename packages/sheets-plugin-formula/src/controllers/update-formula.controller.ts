import { FormulaEngineService } from '@univerjs/base-formula-engine';
import {
    DeleteRangeMutation,
    IDeleteRangeMutationParams,
    IInsertRangeMutationParams,
    IMoveColumnsMutationParams,
    IMoveRowsMutationParams,
    InsertColMutation,
    InsertRangeMutation,
    InsertRowMutation,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRangeMutationParams,
    MoveRowsMutation,
    RemoveColMutation,
    RemoveRowMutation,
} from '@univerjs/base-sheets';
import {
    Dimension,
    Disposable,
    ICellData,
    ICommandInfo,
    ICommandService,
    IRange,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { FormulaDataModel } from '../models/formula-data.model';

export enum FormulaReferenceMoveType {
    Move, // range
    Insert, // row column
    Remove, // row column
    DeleteMoveLeft, // range
    DeleteMoveUp, // range
    InsertMoveDown, // range
    InsertMoveRight, // range
}

export interface IFormulaReferenceMoveParam {
    type: FormulaReferenceMoveType;
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

                // TODO@Dushusir: update formula
            })
        );
    }

    private _handleMoveRange(command: ICommandInfo<MoveRangeMutationParams>) {
        const { params } = command;
        if (!params) return null;

        const { from, to } = params;
        if (!from || !to) return null;

        return {
            type: FormulaReferenceMoveType.Move,
            from: getRangeFromMatrixObject(from),
            to: getRangeFromMatrixObject(to),
        };
    }

    private _handleMoveRows(command: ICommandInfo<IMoveRowsMutationParams>) {
        const { params } = command;
        if (!params) return null;

        const { sourceRange, targetRange } = params;
        return {
            type: FormulaReferenceMoveType.Move,
            from: sourceRange,
            to: targetRange,
        };
    }

    private _handleMoveCols(command: ICommandInfo<IMoveColumnsMutationParams>) {
        const { params } = command;
        if (!params) return null;

        const { sourceRange, targetRange } = params;
        return {
            type: FormulaReferenceMoveType.Move,
            from: sourceRange,
            to: targetRange,
        };
    }

    private _handleInsertRange(command: ICommandInfo<IInsertRangeMutationParams>) {
        const { params } = command;
        if (!params) return null;

        const { ranges, shiftDimension } = params;

        if (shiftDimension === Dimension.ROWS) {
            return {
                type: FormulaReferenceMoveType.InsertMoveDown,
                ranges,
            };
        }
        if (shiftDimension === Dimension.COLUMNS) {
            return {
                type: FormulaReferenceMoveType.InsertMoveRight,
                ranges,
            };
        }
    }

    private _handleDeleteRange(command: ICommandInfo<IDeleteRangeMutationParams>) {
        const { params } = command;
        if (!params) return null;

        const { ranges, shiftDimension } = params;

        if (shiftDimension === Dimension.ROWS) {
            return {
                type: FormulaReferenceMoveType.DeleteMoveUp,
                ranges,
            };
        }
        if (shiftDimension === Dimension.COLUMNS) {
            return {
                type: FormulaReferenceMoveType.DeleteMoveLeft,
                ranges,
            };
        }
    }
}

function getRangeFromMatrixObject(matrixObject: ObjectMatrixPrimitiveType<ICellData | null>) {
    const matrix = new ObjectMatrix(matrixObject);
    return matrix.getDataRange();
}
