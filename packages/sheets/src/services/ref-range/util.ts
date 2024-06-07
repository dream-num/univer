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

import type { ICommandInfo, IMutationInfo, IRange, Nullable } from '@univerjs/core';
import { ObjectMatrix, queryObjectMatrix, Range, RANGE_TYPE, Rectangle } from '@univerjs/core';

import { type IMoveColumnsMutationParams, type IMoveRowsMutationParams, MoveColsMutation, MoveRowsMutation } from '../../commands/mutations/move-rows-cols.mutation';
import type { IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowsMutationParams, IRemoveSheetMutationParams } from '../../basics';
import { type IMoveRangeMutationParams, MoveRangeMutation } from '../../commands/mutations/move-range.mutation';
import { RemoveSheetMutation } from '../../commands/mutations/remove-sheet.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../commands/mutations/remove-row-col.mutation';
import { InsertColMutation, InsertRowMutation } from '../../commands/mutations/insert-row-col.mutation';
import type { ISheetCommandSharedParams } from '../../commands/utils/interface';
import type { SelectionManagerService } from '../selection-manager.service';
import type {
    EffectRefRangeParams,
    IDeleteRangeMoveLeftCommand,
    IDeleteRangeMoveUpCommand,
    IInsertColCommand,
    IInsertRangeMoveDownCommand,
    IInsertRangeMoveRightCommand,
    IInsertRowCommand,
    IMoveColsCommand,
    IMoveRangeCommand,
    IMoveRowsCommand,
    IOperator,
    IRemoveRowColCommand,
} from './type';
import { EffectRefRangId, OperatorType } from './type';

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
export const handleRangeTypeInput = (range: IRange) => {
    const _range = { ...range };
    const isColumn = Number.isNaN(_range.startRow) && Number.isNaN(_range.endRow) && !Number.isNaN(_range.startColumn) && !Number.isNaN(_range.endColumn);
    const isRow = Number.isNaN(_range.startColumn) && Number.isNaN(_range.endColumn) && !Number.isNaN(_range.startRow) && !Number.isNaN(_range.endRow);
    if (_range.rangeType === RANGE_TYPE.COLUMN || isColumn) {
        _range.startRow = 0;
        _range.endRow = MAX_SAFE_INTEGER;
    }
    if (_range.rangeType === RANGE_TYPE.ROW || isRow) {
        _range.startColumn = 0;
        _range.endColumn = MAX_SAFE_INTEGER;
    }
    if (_range.rangeType === RANGE_TYPE.ALL) {
        _range.startColumn = 0;
        _range.endColumn = MAX_SAFE_INTEGER;
        _range.startRow = 0;
        _range.endRow = MAX_SAFE_INTEGER;
    }
    return _range;
};
export const handleRangeTypeOutput = (range: IRange, maxRow: number, maxCol: number) => {
    const _range = { ...range };
    if (_range.rangeType === RANGE_TYPE.COLUMN) {
        _range.startRow = 0;
        _range.endRow = maxRow;
    } else if (_range.rangeType === RANGE_TYPE.ROW) {
        _range.startColumn = 0;
        _range.endColumn = maxCol;
    } else if (_range.rangeType === RANGE_TYPE.ALL) {
        _range.startColumn = 0;
        _range.startRow = 0;
        _range.endColumn = maxCol;
        _range.endRow = maxRow;
    } else {
        _range.startRow = Math.max(0, _range.startRow);
        _range.endRow = Math.min(maxRow, _range.endRow);
        _range.startColumn = Math.max(0, _range.startColumn);
        _range.endColumn = Math.min(maxCol, _range.endColumn);
    }

    return _range;
};
export const rotateRange = (range: IRange): IRange => {
    // rotate {startRow:2,endRow:3,startCol:3,endCol:10} to
    // {startRow:3,endRow:10,startCol:2,endRow:3}
    let rangeType = range.rangeType;
    if (range.rangeType === RANGE_TYPE.COLUMN) {
        rangeType = RANGE_TYPE.ROW;
    } else if (range.rangeType === RANGE_TYPE.ROW) {
        rangeType = RANGE_TYPE.COLUMN;
    }
    return {
        startRow: range.startColumn,
        endRow: range.endColumn,
        startColumn: range.startRow,
        endColumn: range.endRow,
        rangeType,
    };
};
interface ILine {
    start: number;
    end: number;
}
/**
 * see docs/tldr/ref-range/move-rows-cols.tldr
 */
// eslint-disable-next-line max-lines-per-function, complexity
export const handleBaseMoveRowsCols = (
    fromRange: ILine,
    toRange: ILine,
    effectRange: ILine
): { length: number; step: number } => {
    const _effectRange = { ...effectRange };
    const _toRange = { ...toRange };
    const getIntersects = (line1: ILine, line2: ILine): Nullable<ILine> => {
        const start = Math.max(line1.start, line2.start);
        const end = Math.min(line1.end, line2.end);
        if (end < start) {
            return null;
        }
        return { start, end };
    };
    const getLength = (line: ILine) => line.end - line.start + 1;
    const getRelative = (line: ILine, origin: ILine) => ({
        start: line.start - origin.start,
        end: line.start - origin.start + line.end - line.start,
    });
    const getAbsolute = (line: ILine, origin: ILine): ILine => ({
        start: origin.start + line.start,
        end: origin.start + line.start + line.end - line.start,
    });
    const isToLargeFrom = toRange.start > fromRange.start;
    if (isToLargeFrom) {
        const step = Math.min(fromRange.end, toRange.start) - fromRange.start + 1;
        _toRange.start -= step;
        _toRange.end -= step;
    }
    const fromRangeStep = getLength(fromRange);
    const toRangeStep = fromRangeStep;
    const fromRangeIntersectsEffectRange = getIntersects(fromRange, _effectRange);
    const isFromRangeContainEffectRange =
        fromRangeIntersectsEffectRange && getLength(fromRangeIntersectsEffectRange) >= getLength(_effectRange);
    if (fromRange.end < _effectRange.start) {
        _effectRange.start -= fromRangeStep;
        _effectRange.end -= fromRangeStep;
    } else if (fromRangeIntersectsEffectRange) {
        //1- 4 5 8 9 11 12 14 15
        //2- 6 7 8 10 11 13 14 15
        //3- 3 5 6 7 8 9 11
        const fromRangeIntersectsEffectRangeStep = getLength(fromRangeIntersectsEffectRange);
        if (isFromRangeContainEffectRange) {
            //1- 12
            //2- 13
            //3- 6 8 9
            const relative = getRelative(_effectRange, fromRange);
            const newLine = getAbsolute(relative, _toRange);
            _effectRange.start = newLine.start;
            _effectRange.end = newLine.end;
        } else if (fromRangeIntersectsEffectRange.start > fromRange.start) {
            //1- 5 8
            //2- 6 8 10 11 14 15
            //3- 5 7
            if (isToLargeFrom) {
                _effectRange.end -= fromRangeIntersectsEffectRangeStep + fromRangeStep;
                _effectRange.start -= fromRangeStep;
            } else {
                _effectRange.end -= fromRangeIntersectsEffectRangeStep;
            }
        } else {
            if (isToLargeFrom) {
                //1- 4 9 11 14 15
                //3- 3 11
                _effectRange.end -= fromRangeIntersectsEffectRangeStep;
            } else {
                if (_effectRange.start > fromRange.start && _effectRange.end > fromRange.end) {
                    // 2-7
                    _effectRange.start -= fromRangeStep;
                    _effectRange.end -= fromRangeStep + fromRangeIntersectsEffectRangeStep;
                } else {
                    // 2-6 10 11 14 15
                    _effectRange.end -= fromRangeIntersectsEffectRangeStep;
                }
            }
        }
    }

    const toRangeIntersectsEffectRange = getIntersects(_toRange, _effectRange);
    if (!isFromRangeContainEffectRange) {
        if (_toRange.start <= _effectRange.start) {
            _effectRange.start += toRangeStep;
            _effectRange.end += toRangeStep;
        } else if (toRangeIntersectsEffectRange) {
            if (!isToLargeFrom) {
                if (_effectRange.start < _toRange.start && _effectRange.end > _toRange.start) {
                    // 2-4 9 14 expend
                    _effectRange.end += toRangeStep;
                } else if (_effectRange.start >= _toRange.end || (_effectRange.start >= _toRange.start && _effectRange.start <= _toRange.end)) {
                    // 2-5 8 12 15 move right
                    _effectRange.end += toRangeStep;
                    _effectRange.start += toRangeStep;
                }
            } else {
                if (_toRange.end <= _effectRange.start || (_toRange.start <= _effectRange.start && _toRange.end >= _effectRange.start)) {
                    // 1-3 7 13
                    _effectRange.start += toRangeStep;
                    _effectRange.end += toRangeStep;
                } else if (_toRange.start >= _effectRange.start && _toRange.start <= _effectRange.end) {
                    // 1-6 8 10  11 14 15
                    _effectRange.end += toRangeStep;
                }
            }
        }
    }

    return {
        step: _effectRange.start - effectRange.start,
        length: getLength(_effectRange) - getLength(effectRange),
    };
};

export const handleMoveRows = (params: IMoveRowsCommand, targetRange: IRange): IOperator[] => {
    const { fromRange, toRange } = params.params || {};
    if (!toRange || !fromRange) {
        return [];
    }
    const _fromRange = handleRangeTypeInput(fromRange);
    const _toRange = handleRangeTypeInput(toRange);
    const _targetRange = handleRangeTypeInput(targetRange);
    const result = handleBaseMoveRowsCols(
        { start: _fromRange.startRow, end: _fromRange.endRow },
        { start: _toRange.startRow, end: _toRange.endRow },
        { start: _targetRange.startRow, end: _targetRange.endRow }
    );
    if (result === null) {
        return [
            {
                type: OperatorType.Delete,
            },
        ];
    }
    return [
        {
            type: OperatorType.VerticalMove,
            step: result.step || 0,
            length: result.length || 0,
        },
    ];
};

export const handleMoveRowsCommon = (params: IMoveRowsCommand, targetRange: IRange) => {
    const { fromRange, toRange } = params.params || {};
    if (!fromRange || !toRange) {
        return [targetRange];
    }

    const { startRow: fromRow } = fromRange;
    const { startRow: toRow } = toRange;

    const count = toRange.endRow - toRange.startRow + 1;

    const matrix = new ObjectMatrix();

    Range.foreach(targetRange, (row, col) => {
        matrix.setValue(row, col, 1);
    });

    matrix.moveRows(fromRow, count, toRow);

    const res = queryObjectMatrix(matrix, (value) => value === 1);
    return res;
};

export const handleMoveCols = (params: IMoveColsCommand, targetRange: IRange): IOperator[] => {
    const { fromRange, toRange } = params.params || {};
    if (!toRange || !fromRange) {
        return [];
    }
    const _fromRange = handleRangeTypeInput(fromRange);
    const _toRange = handleRangeTypeInput(toRange);
    const _targetRange = handleRangeTypeInput(targetRange);
    const result = handleBaseMoveRowsCols(
        { start: _fromRange.startColumn, end: _fromRange.endColumn },
        { start: _toRange.startColumn, end: _toRange.endColumn },
        { start: _targetRange.startColumn, end: _targetRange.endColumn }
    );
    if (result === null) {
        return [
            {
                type: OperatorType.Delete,
            },
        ];
    }
    return [
        {
            type: OperatorType.HorizontalMove,
            step: result.step || 0,
            length: result.length || 0,
        },
    ];
};

export const handleMoveColsCommon = (params: IMoveColsCommand, targetRange: IRange) => {
    const { fromRange, toRange } = params.params || {};
    if (!fromRange || !toRange) {
        return [targetRange];
    }

    const { startColumn: fromCol } = fromRange;
    const { startColumn: toCol } = toRange;

    const count = toRange.endColumn - toRange.startColumn + 1;

    const matrix = new ObjectMatrix();

    Range.foreach(targetRange, (row, col) => {
        matrix.setValue(row, col, 1);
    });

    matrix.moveColumns(fromCol, count, toCol);

    return queryObjectMatrix(matrix, (value) => value === 1);
};

export const handleMoveRange = (param: IMoveRangeCommand, targetRange: IRange) => {
    const toRange = param.params?.toRange;
    const fromRange = param.params?.fromRange;
    if (!toRange || !fromRange) {
        return [];
    }
    const operators: IOperator[] = [];

    if (Rectangle.contains(toRange, targetRange)) {
        operators.push({
            type: OperatorType.Delete,
        });
    }

    if (Rectangle.contains(fromRange, targetRange)) {
        operators.push({
            type: OperatorType.Delete,
        });
        const relativeRange = Rectangle.getRelativeRange(targetRange, fromRange);
        const positionRange = Rectangle.getPositionRange(relativeRange, toRange);
        return [
            {
                type: OperatorType.Set,
                range: positionRange,
            },
        ] as IOperator[];
    }
    return operators;
};

export const handleMoveRangeCommon = (param: IMoveRangeCommand, targetRange: IRange) => {
    const toRange = param.params?.toRange;
    const fromRange = param.params?.fromRange;
    // illegal
    if (!toRange || !fromRange) {
        return [targetRange];
    }

    if (!Rectangle.intersects(fromRange, targetRange) && !Rectangle.intersects(toRange, targetRange)) {
        return [targetRange];
    }

    if (Rectangle.contains(fromRange, targetRange)) {
        const relativeRange = Rectangle.getRelativeRange(targetRange, fromRange);
        const positionRange = Rectangle.getPositionRange(relativeRange, toRange);
        return [positionRange];
    }

    const matrix = new ObjectMatrix();

    Range.foreach(targetRange, (row, col) => {
        matrix.setValue(row, col, 1);
    });

    const fromMatrix = new ObjectMatrix();
    const loopFromRange = Rectangle.getIntersects(fromRange, targetRange);

    loopFromRange && Range.foreach(loopFromRange, (row, col) => {
        if (matrix.getValue(row, col)) {
            matrix.setValue(row, col, undefined);
            fromMatrix.setValue(row, col, 1);
        }
    });

    const columnOffset = toRange.startColumn - fromRange.startColumn;
    const rowOffset = toRange.startRow - fromRange.startRow;

    const loopToRange = {
        startColumn: toRange.startColumn - columnOffset,
        endColumn: toRange.endColumn - columnOffset,
        startRow: toRange.startRow - rowOffset,
        endRow: toRange.endRow - rowOffset,
    };

    loopToRange && Range.foreach(loopToRange, (row, col) => {
        const targetRow = row + rowOffset;
        const targetCol = col + columnOffset;
        matrix.setValue(targetRow, targetCol, fromMatrix.getValue(row, col) ?? 0);
    });

    const res = queryObjectMatrix(matrix, (value) => value === 1);
    return res;
};

// see docs/tldr/ref-range/remove-rows-cols.tldr
export const handleBaseRemoveRange = (_removeRange: IRange, _targetRange: IRange) => {
    const removeRange = handleRangeTypeInput(_removeRange);
    const targetRange = handleRangeTypeInput(_targetRange);
    const getLength = (range: IRange): number => range.endColumn - range.startColumn + 1;
    const getRowLength = (range: IRange): number => range.endRow - range.startRow + 1;
    if (removeRange.startRow <= targetRange.startRow && removeRange.endRow >= targetRange.endRow) {
        if (
            // 2
            (targetRange.startColumn < removeRange.startColumn &&
                targetRange.endColumn >= removeRange.startColumn &&
                targetRange.endColumn <= removeRange.endColumn) ||
            // 6
            (targetRange.startColumn < removeRange.startColumn && targetRange.endColumn >= removeRange.endColumn)
        ) {
            const intersectedRange = Rectangle.getIntersects(targetRange, removeRange);
            if (intersectedRange) {
                const length = -getLength(intersectedRange);
                return { step: 0, length };
            }
        }
        // 3
        if (
            targetRange.startColumn >= removeRange.startColumn &&
            targetRange.endColumn <= removeRange.endColumn &&
            getRowLength(removeRange) >= getRowLength(targetRange)
        ) {
            return null;
        }
        // 4
        if (
            targetRange.startColumn >= removeRange.startColumn &&
            targetRange.startColumn <= removeRange.endColumn &&
            targetRange.endColumn > removeRange.endColumn
        ) {
            const intersectedRange = Rectangle.getIntersects(targetRange, removeRange);
            if (intersectedRange) {
                const length = -getLength(intersectedRange);
                const step = -(getLength(removeRange) - getLength(intersectedRange));

                return { step, length };
            }
        }
        // 5
        if (targetRange.startColumn > removeRange.endColumn) {
            const step = -getLength(removeRange);
            return { step, length: 0 };
        }
    }
    return { step: 0, length: 0 };
};
export const handleIRemoveCol = (param: IRemoveRowColCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }
    const operators: IOperator[] = [];
    const result = handleBaseRemoveRange(range, targetRange);
    if (!result) {
        operators.push({ type: OperatorType.Delete });
    } else {
        const { step, length } = result;
        operators.push({
            type: OperatorType.HorizontalMove,
            step,
            length,
        });
    }
    return operators;
};

export const handleIRemoveRow = (param: IRemoveRowColCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }
    const operators: IOperator[] = [];
    const result = handleBaseRemoveRange(rotateRange(range), rotateRange(targetRange));
    if (!result) {
        operators.push({ type: OperatorType.Delete });
    } else {
        const { step, length } = result;
        operators.push({
            type: OperatorType.VerticalMove,
            step,
            length,
        });
    }
    return operators;
};
// see docs/tldr/ref-range/insert-rows-cols.tldr
export const handleBaseInsertRange = (_insertRange: IRange, _targetRange: IRange) => {
    const insertRange = handleRangeTypeInput(_insertRange);
    const targetRange = handleRangeTypeInput(_targetRange);
    const getLength = (range: IRange): number => range.endColumn - range.startColumn + 1;
    if (insertRange.startRow <= targetRange.startRow && insertRange.endRow >= targetRange.endRow) {
        if (
            // 2
            (targetRange.startColumn < insertRange.startColumn &&
                targetRange.endColumn >= insertRange.startColumn &&
                targetRange.endColumn <= insertRange.endColumn) ||
            // 6
            (targetRange.startColumn < insertRange.startColumn && targetRange.endColumn >= insertRange.endColumn)
        ) {
            const length = getLength(insertRange);
            return { step: 0, length };
        }

        if (
            // 3
            (targetRange.startColumn >= insertRange.startColumn && targetRange.endColumn <= insertRange.endColumn) ||
            // 4
            (targetRange.startColumn > insertRange.startColumn &&
                targetRange.startColumn <= insertRange.endColumn &&
                targetRange.endColumn > insertRange.endColumn) ||
            //5
            targetRange.startColumn >= insertRange.endColumn
        ) {
            const step = getLength(insertRange);
            return { step, length: 0 };
        }
    }
    return { step: 0, length: 0 };
};

function handleBaseMoveRange(fromRange: IRange, toRange: IRange, targetRange: IRange) {
    const operators: IOperator[] = [];

    if (Rectangle.contains(toRange, targetRange)) {
        operators.push({
            type: OperatorType.Delete,
        });
    }

    if (Rectangle.contains(fromRange, targetRange)) {
        operators.push({
            type: OperatorType.Delete,
        });
        const relativeRange = Rectangle.getRelativeRange(targetRange, fromRange);
        const positionRange = Rectangle.getPositionRange(relativeRange, toRange);
        return [
            {
                type: OperatorType.Set,
                range: positionRange,
            },
        ] as IOperator[];
    }
    return operators;
};

export const handleInsertRow = (param: IInsertRowCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }
    const operators: IOperator[] = [];
    const result = handleBaseInsertRange(rotateRange(range), rotateRange(targetRange));
    const { step, length } = result;
    operators.push({
        type: OperatorType.VerticalMove,
        step,
        length,
    });
    return operators;
};

export const handleInsertCol = (param: IInsertColCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }
    const operators: IOperator[] = [];
    const result = handleBaseInsertRange(range, targetRange);
    const { step, length } = result;
    operators.push({
        type: OperatorType.HorizontalMove,
        step,
        length,
    });
    return operators;
};

export const handleInsertRangeMoveDown = (param: IInsertRangeMoveDownCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }
    const operators: IOperator[] = [];
    const result = handleBaseInsertRange(rotateRange(range), rotateRange(targetRange));
    const { step, length } = result;
    operators.push({
        type: OperatorType.VerticalMove,
        step,
        length,
    });
    return operators;
};

export const handleInsertRangeMoveDownCommon = (param: IInsertRangeMoveDownCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [targetRange];
    }

    const moveCount = range.endRow - range.startRow + 1;
    const bottomRange: IRange = {
        ...range,
        startRow: range.startRow,
        endRow: Number.POSITIVE_INFINITY,
    };

    const noMoveRanges = Rectangle.subtract(targetRange, bottomRange);
    const targetMoveRange = Rectangle.getIntersects(bottomRange, targetRange);

    if (!targetMoveRange) {
        return [targetRange];
    }

    const matrix = new ObjectMatrix<number>();
    noMoveRanges.forEach((noMoveRange) => {
        Range.foreach(noMoveRange, (row, col) => {
            matrix.setValue(row, col, 1);
        });
    });

    targetMoveRange && Range.foreach(targetMoveRange, (row, col) => {
        matrix.setValue(row + moveCount, col, 1);
    });

    return queryObjectMatrix(matrix, (v) => v === 1);
};

export const handleInsertRangeMoveRight = (param: IInsertRangeMoveRightCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }
    const operators: IOperator[] = [];
    const result = handleBaseInsertRange(range, targetRange);
    const { step, length } = result;
    operators.push({
        type: OperatorType.HorizontalMove,
        step,
        length,
    });
    return operators;
};

export const handleInsertRangeMoveRightCommon = (param: IInsertRangeMoveRightCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [targetRange];
    }

    const moveCount = range.endColumn - range.startColumn + 1;
    const bottomRange: IRange = {
        ...range,
        startColumn: range.startColumn,
        endColumn: Number.POSITIVE_INFINITY,
    };

    const noMoveRanges = Rectangle.subtract(targetRange, bottomRange);
    const targetMoveRange = Rectangle.getIntersects(bottomRange, targetRange);

    if (!targetMoveRange) {
        return [targetRange];
    }

    const matrix = new ObjectMatrix<number>();
    noMoveRanges.forEach((noMoveRange) => {
        Range.foreach(noMoveRange, (row, col) => {
            matrix.setValue(row, col, 1);
        });
    });

    targetMoveRange && Range.foreach(targetMoveRange, (row, col) => {
        matrix.setValue(row, col + moveCount, 1);
    });

    return queryObjectMatrix(matrix, (v) => v === 1);
};

export const handleDeleteRangeMoveLeft = (param: IDeleteRangeMoveLeftCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }

    const operators: IOperator[] = [];
    const result = handleBaseRemoveRange(range, targetRange);

    if (!result) {
        operators.push({ type: OperatorType.Delete });
    } else {
        const { step, length } = result;
        operators.push({
            type: OperatorType.HorizontalMove,
            step,
            length,
        });
    }

    return operators;
};

export const handleDeleteRangeMoveLeftCommon = (param: IDeleteRangeMoveLeftCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [targetRange];
    }

    const rightRange: IRange = {
        startRow: range.startRow,
        endRow: range.endRow,
        startColumn: range.startColumn,
        endColumn: Number.POSITIVE_INFINITY,
    };

    const moveCount = range.endColumn - range.startColumn + 1;
    // this range need delete
    const targetDeleteRange = Rectangle.getIntersects(range, targetRange);

    const noMoveRanges = Rectangle.subtract(targetRange, rightRange);
    const targetMoveRange = Rectangle.getIntersects(rightRange, targetRange);

    if (!targetDeleteRange && !targetMoveRange) {
        return [targetRange];
    }

    const matrix = new ObjectMatrix<number>();

    targetMoveRange && Range.foreach(targetMoveRange, (row, col) => {
        matrix.setValue(row, col - moveCount, 1);
    });

    targetDeleteRange && Range.foreach(targetDeleteRange, (row, col) => {
        matrix.setValue(row, col - moveCount, 0);
    });

    noMoveRanges.forEach((noMoveRange) => {
        Range.foreach(noMoveRange, (row, col) => {
            matrix.setValue(row, col, 1);
        });
    });

    return queryObjectMatrix(matrix, (v) => v === 1);
};

export const handleDeleteRangeMoveUp = (param: IDeleteRangeMoveUpCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }
    const operators: IOperator[] = [];
    const result = handleBaseRemoveRange(rotateRange(range), rotateRange(targetRange));
    if (!result) {
        operators.push({ type: OperatorType.Delete });
    } else {
        const { step, length } = result;
        operators.push({
            type: OperatorType.VerticalMove,
            step,
            length,
        });
    }
    return operators;
};

export const handleDeleteRangeMoveUpCommon = (param: IDeleteRangeMoveUpCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [targetRange];
    }

    const bottomRange: IRange = {
        ...range,
        startRow: range.startRow,
        endRow: Number.POSITIVE_INFINITY,
    };

    const moveCount = range.endRow - range.startRow + 1;
    // this range need delete
    const targetDeleteRange = Rectangle.getIntersects(range, targetRange);

    const noMoveRanges = Rectangle.subtract(targetRange, bottomRange);
    const targetMoveRange = Rectangle.getIntersects(bottomRange, targetRange);

    if (!targetDeleteRange && !targetMoveRange) {
        return [targetRange];
    }

    const matrix = new ObjectMatrix<number>();

    targetMoveRange && Range.foreach(targetMoveRange, (row, col) => {
        matrix.setValue(row - moveCount, col, 1);
    });

    targetDeleteRange && Range.foreach(targetDeleteRange, (row, col) => {
        matrix.setValue(row - moveCount, col, 0);
    });

    noMoveRanges.forEach((noMoveRange) => {
        Range.foreach(noMoveRange, (row, col) => {
            matrix.setValue(row, col, 1);
        });
    });

    return queryObjectMatrix(matrix, (v) => v === 1);
};

export const runRefRangeMutations = (operators: IOperator[], range: IRange) => {
    let result: Nullable<IRange> = { ...range };
    operators.forEach((operator) => {
        switch (operator.type) {
            case OperatorType.Delete: {
                result = null;
                break;
            }
            case OperatorType.HorizontalMove: {
                if (!result) {
                    return;
                }
                result.startColumn += operator.step;
                result.endColumn += operator.step + (operator.length || 0);
                break;
            }
            case OperatorType.VerticalMove: {
                if (!result) {
                    return;
                }
                result.startRow += operator.step;
                result.endRow += operator.step + (operator.length || 0);
                break;
            }
            case OperatorType.Set: {
                result = operator.range;
                break;
            }
        }
    });
    if (result) {
        if (result.endColumn < result.startColumn || result.endRow < result.startRow) {
            return null;
        }
    }
    return result;
};

export const handleDefaultRangeChangeWithEffectRefCommands = (range: IRange, commandInfo: ICommandInfo) => {
    let operator: IOperator[] = [];
    switch (commandInfo.id) {
        case EffectRefRangId.DeleteRangeMoveLeftCommandId: {
            operator = handleDeleteRangeMoveLeft(commandInfo as IDeleteRangeMoveLeftCommand, range);
            break;
        }
        case EffectRefRangId.DeleteRangeMoveUpCommandId: {
            operator = handleDeleteRangeMoveUp(commandInfo as IDeleteRangeMoveUpCommand, range);
            break;
        }
        case EffectRefRangId.InsertColCommandId: {
            operator = handleInsertCol(commandInfo as IInsertColCommand, range);
            break;
        }
        case EffectRefRangId.InsertRangeMoveDownCommandId: {
            operator = handleInsertRangeMoveDown(commandInfo as IInsertRangeMoveDownCommand, range);
            break;
        }
        case EffectRefRangId.InsertRangeMoveRightCommandId: {
            operator = handleInsertRangeMoveRight(commandInfo as IInsertRangeMoveRightCommand, range);
            break;
        }
        case EffectRefRangId.InsertRowCommandId: {
            operator = handleInsertRow(commandInfo as IInsertRowCommand, range);
            break;
        }
        case EffectRefRangId.MoveColsCommandId: {
            operator = handleMoveCols(commandInfo as IMoveColsCommand, range);
            break;
        }
        case EffectRefRangId.MoveRangeCommandId: {
            operator = handleMoveRange(commandInfo as IMoveRangeCommand, range);
            break;
        }
        case EffectRefRangId.MoveRowsCommandId: {
            operator = handleMoveRows(commandInfo as IMoveRowsCommand, range);
            break;
        }
        case EffectRefRangId.RemoveColCommandId: {
            operator = handleIRemoveCol(commandInfo as IRemoveRowColCommand, range);
            break;
        }
        case EffectRefRangId.RemoveRowCommandId: {
            operator = handleIRemoveRow(commandInfo as IRemoveRowColCommand, range);
            break;
        }
    }

    const resultRange = runRefRangeMutations(operator, range);
    return resultRange;
};

export const handleDefaultRangeChangeWithEffectRefCommandsSkipNoInterests = (range: IRange, commandInfo: ICommandInfo, deps: { selectionManagerService: SelectionManagerService }) => {
    const effectRanges = getEffectedRangesOnCommand(commandInfo as EffectRefRangeParams, deps);
    if (effectRanges.some((effectRange) => Rectangle.intersects(effectRange, range))) {
        return handleDefaultRangeChangeWithEffectRefCommands(range, commandInfo);
    }

    return range;
};

type MutationsAffectRange =
    ISheetCommandSharedParams
    | IRemoveSheetMutationParams
    | IMoveRowsMutationParams
    | IMoveColumnsMutationParams
    | IRemoveRowsMutationParams
    | IRemoveColMutationParams
    | IInsertColMutationParams
    | IInsertRowMutationParams
    | IMoveRangeMutationParams;

export const handleCommonDefaultRangeChangeWithEffectRefCommands = (range: IRange, commandInfo: ICommandInfo) => {
    let operator: IOperator[] = [];
    switch (commandInfo.id) {
        case EffectRefRangId.DeleteRangeMoveLeftCommandId: {
            return handleDeleteRangeMoveLeftCommon(commandInfo as IDeleteRangeMoveLeftCommand, range);
        }
        case EffectRefRangId.DeleteRangeMoveUpCommandId: {
            return handleDeleteRangeMoveUpCommon(commandInfo as IDeleteRangeMoveUpCommand, range);
        }
        case EffectRefRangId.InsertRangeMoveDownCommandId: {
            return handleInsertRangeMoveDownCommon(commandInfo as IInsertRangeMoveDownCommand, range);
        }
        case EffectRefRangId.InsertRangeMoveRightCommandId: {
            return handleInsertRangeMoveRightCommon(commandInfo as IInsertRangeMoveRightCommand, range);
        }
        case EffectRefRangId.InsertColCommandId: {
            operator = handleInsertCol(commandInfo as IInsertColCommand, range);
            break;
        }
        case EffectRefRangId.InsertRowCommandId: {
            operator = handleInsertRow(commandInfo as IInsertRowCommand, range);
            break;
        }
        case EffectRefRangId.MoveColsCommandId: {
            return handleMoveColsCommon(commandInfo as IMoveColsCommand, range);
        }
        case EffectRefRangId.MoveRangeCommandId: {
            return handleMoveRangeCommon(commandInfo as IMoveRangeCommand, range);
        }
        case EffectRefRangId.MoveRowsCommandId: {
            return handleMoveRowsCommon(commandInfo as IMoveRowsCommand, range);
        }
        case EffectRefRangId.RemoveColCommandId: {
            operator = handleIRemoveCol(commandInfo as IRemoveRowColCommand, range);
            break;
        }
        case EffectRefRangId.RemoveRowCommandId: {
            operator = handleIRemoveRow(commandInfo as IRemoveRowColCommand, range);
            break;
        }
    }
    const resultRange = runRefRangeMutations(operator, range);
    return resultRange;
};

/**
 * This function should work as a pure function.
 *
 * @pure
 * @param range
 * @param mutation
 * @returns the adjusted range
 */
export function adjustRangeOnMutation(range: Readonly<IRange>, mutation: IMutationInfo<MutationsAffectRange>): Nullable<IRange> {
    // we map mutation params to corresponding
    const { id, params } = mutation;
    let baseRangeOperator: {
        length: number;
        step: number;
        type?: OperatorType;
    } | null | IOperator[] = {
        length: 0,
        step: 0,
        type: OperatorType.Unknown,
    };
    switch (id) {
        case RemoveSheetMutation.id:
            baseRangeOperator.type = OperatorType.Delete;
            break;
        case MoveRowsMutation.id:
            baseRangeOperator = handleBaseMoveRowsCols(
                { start: (params as IMoveRowsMutationParams).sourceRange.startRow, end: (params as IMoveRowsMutationParams).sourceRange.endRow },
                { start: (params as IMoveRowsMutationParams).targetRange.startRow, end: (params as IMoveRowsMutationParams).targetRange.endRow },
                { start: range.startRow, end: range.endRow }
            );
            baseRangeOperator.type = OperatorType.VerticalMove;
            break;
        case MoveColsMutation.id:
            baseRangeOperator = handleBaseMoveRowsCols(
                { start: (params as IMoveColumnsMutationParams).sourceRange.startColumn, end: (params as IMoveColumnsMutationParams).sourceRange.endColumn },
                { start: (params as IMoveColumnsMutationParams).targetRange.startColumn, end: (params as IMoveColumnsMutationParams).targetRange.endColumn },
                { start: range.startColumn, end: range.endColumn }
            );
            baseRangeOperator.type = OperatorType.HorizontalMove;
            break;
        case RemoveColMutation.id:
            baseRangeOperator = handleBaseRemoveRange((params as IRemoveColMutationParams).range, range);
            if (baseRangeOperator) {
                baseRangeOperator.type = OperatorType.HorizontalMove;
            } else {
                baseRangeOperator = { step: 0, length: 0, type: OperatorType.Delete };
            }
            break;
        case RemoveRowMutation.id:
            baseRangeOperator = handleBaseRemoveRange(rotateRange((params as IRemoveRowsMutationParams).range), rotateRange(range));
            if (baseRangeOperator) {
                baseRangeOperator.type = OperatorType.VerticalMove;
            } else {
                baseRangeOperator = { step: 0, length: 0, type: OperatorType.Delete };
            }
            break;
        case InsertRowMutation.id:
            baseRangeOperator = handleBaseInsertRange(rotateRange((params as IInsertRowMutationParams).range), rotateRange(range));
            baseRangeOperator.type = OperatorType.VerticalMove;
            break;
        case InsertColMutation.id:
            baseRangeOperator = handleBaseInsertRange((params as IInsertColMutationParams).range, range);
            baseRangeOperator.type = OperatorType.HorizontalMove;
            break;
        case MoveRangeMutation.id:
            baseRangeOperator = handleBaseMoveRange(
                new ObjectMatrix((params as IMoveRangeMutationParams).from).getRange(),
                new ObjectMatrix((params as IMoveRangeMutationParams).to).getRange(),
                range
            );
            break;
        default:
            break;
    }
    if (baseRangeOperator) {
        return Array.isArray(baseRangeOperator) ? runRefRangeMutations(baseRangeOperator, range) : runRefRangeMutations([baseRangeOperator as IOperator], range);
    } else {
        return range;
    }
}

// eslint-disable-next-line max-lines-per-function
export function getEffectedRangesOnCommand(command: EffectRefRangeParams, deps: { selectionManagerService: SelectionManagerService }) {
    const { selectionManagerService } = deps;
    switch (command.id) {
        case EffectRefRangId.MoveColsCommandId: {
            const params = command.params!;
            return [
                params.fromRange,
                {
                    ...params.toRange,
                    startColumn: params.toRange.startColumn - 0.5,
                    endColumn: params.toRange.endColumn - 0.5,
                },
            ];
        }
        case EffectRefRangId.MoveRowsCommandId: {
            const params = command.params!;
            return [
                params.fromRange,
                {
                    ...params.toRange,
                    startRow: params.toRange.startRow - 0.5,
                    endRow: params.toRange.startRow - 0.5,
                },
            ];
        }
        case EffectRefRangId.MoveRangeCommandId: {
            const params = command;
            return [params.params!.fromRange, params.params!.toRange];
        }
        case EffectRefRangId.InsertRowCommandId: {
            const params = command;
            const range: IRange = params.params!.range;
            return [
                {
                    ...range,
                    startRow: range.startRow - 0.5,
                    endRow: range.endRow - 0.5,
                },
            ];
        }
        case EffectRefRangId.InsertColCommandId: {
            const params = command;
            const range: IRange = params.params!.range;
            return [
                {
                    ...range,
                    startColumn: range.startColumn - 0.5,
                    endColumn: range.endColumn - 0.5,
                },
            ];
        }
        case EffectRefRangId.RemoveRowCommandId: {
            const params = command;
            const range: IRange = params.params!.range;
            return [range];
        }
        case EffectRefRangId.RemoveColCommandId: {
            const params = command;
            const range: IRange = params.params!.range;
            return [range];
        }
        case EffectRefRangId.DeleteRangeMoveUpCommandId:
        case EffectRefRangId.InsertRangeMoveDownCommandId: {
            const params = command;
            const range = params.params?.range || selectionManagerService.getSelectionRanges()?.[0];
            if (!range) {
                return [];
            }
            return [range];
        }
        case EffectRefRangId.DeleteRangeMoveLeftCommandId:
        case EffectRefRangId.InsertRangeMoveRightCommandId: {
            const params = command;
            const range = params.params?.range || selectionManagerService.getSelectionRanges()?.[0];
            if (!range) {
                return [];
            }
            return [range];
        }
    }
}

export function getEffectedRangesOnMutation(mutation: IMutationInfo<MutationsAffectRange>) {
    switch (mutation.id) {
        case MoveColsMutation.id: {
            const params = mutation.params as IMoveColumnsMutationParams;
            return [
                params.sourceRange,
                {
                    ...params.targetRange,
                    startColumn: params.targetRange.startColumn - 0.5,
                    endColumn: params.targetRange.endColumn - 0.5,
                },
            ];
        }
        case MoveRowsMutation.id: {
            const params = mutation.params as IMoveRowsMutationParams;
            return [
                params.sourceRange,
                {
                    ...params.targetRange,
                    startRow: params.targetRange.startRow - 0.5,
                    endRow: params.targetRange.startRow - 0.5,
                },
            ];
        }

        case MoveRangeMutation.id: {
            const params = mutation.params as IMoveRangeMutationParams;
            return [new ObjectMatrix(params.from).getRange(), new ObjectMatrix(params.to).getRange()];
        }
        case InsertColMutation.id: {
            const params = mutation.params as IInsertColMutationParams;
            const range: IRange = params.range;
            return [
                {
                    ...range,
                    startColumn: range.startColumn - 0.5,
                    endColumn: range.endColumn - 0.5,
                },
            ];
        }
        case InsertRowMutation.id: {
            const params = mutation.params as IInsertRowMutationParams;
            const range: IRange = params.range;
            return [
                {
                    ...range,
                    startRow: range.startRow - 0.5,
                    endRow: range.endRow - 0.5,
                },
            ];
        }
        case RemoveColMutation.id: {
            const params = mutation.params as IRemoveColMutationParams;
            const range: IRange = params.range;
            return [range];
        }
        case RemoveRowMutation.id: {
            const params = mutation.params as IRemoveRowsMutationParams;
            const range: IRange = params.range;
            return [range];
        }
        default:
            break;
    }
}
