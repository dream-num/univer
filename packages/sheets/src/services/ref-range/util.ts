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

import type { IRange, Nullable } from '@univerjs/core';
import { Rectangle } from '@univerjs/core';

import type {
    IDeleteOperator,
    IDeleteRangeMoveLeftCommand,
    IDeleteRangeMoveUpCommand,
    IHorizontalMoveOperator,
    IInsertColCommand,
    IInsertRangeMoveDownCommand,
    IInsertRangeMoveRightCommand,
    IInsertRowCommand,
    IMoveColsCommand,
    IMoveRangeCommand,
    IMoveRowsCommand,
    IOperator,
    IRemoveRowColCommand,
    IVerticalMoveOperator,
} from './type';
import { OperatorType } from './type';

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
interface ILine {
    start: number;
    end: number;
}
/**
 * see docs/tldr/handMoveRowsCols.tldr
 */
const handleBaseMove = (fromRange: ILine, toRange: ILine, effectRange: ILine): Nullable<number> => {
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

    if (toRange.start > fromRange.start) {
        const step = Math.min(fromRange.end, toRange.start) - fromRange.start + 1;
        _toRange.start -= step;
        _toRange.end -= step;
    }
    const fromRangeStep = getLength(fromRange);
    const toRangeStep = fromRangeStep;
    const fromRangeIntersectsEffectRange = getIntersects(fromRange, _effectRange);
    const isFromRangeContainEffectRange =
        fromRangeIntersectsEffectRange && getLength(fromRangeIntersectsEffectRange) <= getLength(_effectRange);
    if (fromRange.end < _effectRange.start) {
        _effectRange.start -= fromRangeStep;
        _effectRange.end -= fromRangeStep;
    } else if (fromRangeIntersectsEffectRange) {
        const fromRangeIntersectsEffectRangeStep = getLength(fromRangeIntersectsEffectRange);
        if (isFromRangeContainEffectRange) {
            const relative = getRelative(_effectRange, fromRange);
            const newLine = getAbsolute(relative, _toRange);
            _effectRange.start = newLine.start;
            _effectRange.end = newLine.end;
        } else if (fromRangeIntersectsEffectRange.start > fromRange.start) {
            _effectRange.end -= fromRangeIntersectsEffectRangeStep;
        } else {
            _effectRange.start -= fromRangeStep;
            _effectRange.start -= fromRangeStep + fromRangeIntersectsEffectRangeStep;
        }
    }

    const toRangeIntersectsEffectRange = getIntersects(_toRange, _effectRange);
    if (_toRange.start <= _effectRange.start && !isFromRangeContainEffectRange) {
        _effectRange.start += toRangeStep;
        _effectRange.end += toRangeStep;
    } else if (toRangeIntersectsEffectRange) {
        const insertStart = _toRange.start;
        if (getLength(toRangeIntersectsEffectRange) <= getLength(_effectRange)) {
            return _effectRange.start - effectRange.start;
        }
        if (insertStart < _effectRange.start) {
            _effectRange.start += toRangeStep;
            _effectRange.end += toRangeStep;
        } else if (insertStart >= _effectRange.start && insertStart <= _effectRange.end) {
            // 1. move
            _effectRange.end += toRangeStep;
            _effectRange.start += toRangeStep;
            // 2. split
            // 3. expansion
        }
    }
    return _effectRange.start - effectRange.start;
};

export const handleMoveRows = (params: IMoveRowsCommand, targetRange: IRange): IOperator[] => {
    const { fromRange, toRange } = params.params || {};
    if (!toRange || !fromRange) {
        return [];
    }
    const step = handleBaseMove(
        { start: fromRange.startRow, end: fromRange.endRow },
        { start: toRange.startRow, end: toRange.endRow },
        { start: targetRange.startRow, end: targetRange.endRow }
    );
    if (step === null) {
        return [
            {
                type: OperatorType.Delete,
            },
        ];
    }
    return [
        {
            type: OperatorType.VerticalMove,
            step: step || 0,
        },
    ];
};

export const handleMoveCols = (params: IMoveColsCommand, targetRange: IRange): IOperator[] => {
    const { fromRange, toRange } = params.params || {};
    if (!toRange || !fromRange) {
        return [];
    }
    const step = handleBaseMove(
        { start: fromRange.startColumn, end: fromRange.endColumn },
        { start: toRange.startColumn, end: toRange.endColumn },
        { start: targetRange.startColumn, end: targetRange.endColumn }
    );
    if (step === null) {
        return [
            {
                type: OperatorType.Delete,
            },
        ];
    }
    return [
        {
            type: OperatorType.HorizontalMove,
            step: step || 0,
        },
    ];
};

export const handleMoveRange = (param: IMoveRangeCommand, targetRange: IRange) => {
    const toRange = param.params?.toRange;
    const fromRange = param.params?.fromRange;
    if (!toRange || !fromRange) {
        return [];
    }
    const operators: IOperator[] = [];

    if (Rectangle.intersects(fromRange, targetRange)) {
        operators.push({
            type: OperatorType.Delete,
        });
        if (Rectangle.contains(fromRange, targetRange)) {
            const relativeRange = Rectangle.getRelativeRange(targetRange, fromRange);
            const positionRange = Rectangle.getPositionRange(relativeRange, toRange);
            return [
                {
                    type: OperatorType.Set,
                    range: positionRange,
                },
            ] as IOperator[];
        }
    } else if (Rectangle.intersects(toRange, targetRange)) {
        operators.push({
            type: OperatorType.Delete,
        });
    }
    return operators;
};

/**
 * see the doc 【ref-range-remove-col.tldr】
 */
export const handleIRemoveCol = (param: IRemoveRowColCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }
    const operators: IOperator[] = [];
    if (range.endColumn < targetRange.startColumn) {
        const result: IHorizontalMoveOperator = {
            type: OperatorType.HorizontalMove,
            step: -(range.endColumn - range.startColumn + 1),
        };
        operators.push(result);
    } else if (
        (range.startColumn <= targetRange.startColumn && range.endColumn >= targetRange.endColumn) ||
        (range.startColumn >= targetRange.startColumn && range.endColumn <= targetRange.endColumn)
    ) {
        const result: IDeleteOperator = {
            type: OperatorType.Delete,
        };
        return [result];
    } else if (
        range.startColumn <= targetRange.startColumn &&
        range.endColumn >= targetRange.startColumn &&
        range.endColumn <= targetRange.endColumn
    ) {
        // the targetRange in the range right
        const result: IHorizontalMoveOperator = {
            type: OperatorType.HorizontalMove,
            step: -(targetRange.startColumn - range.startColumn),
            length: -(range.endColumn - targetRange.startColumn + 1),
        };
        operators.push(result);
    } else if (
        // the targetRange in the range left
        range.startColumn >= targetRange.startColumn &&
        range.startColumn <= targetRange.endColumn &&
        range.endColumn >= targetRange.endColumn
    ) {
        const result: IHorizontalMoveOperator = {
            type: OperatorType.HorizontalMove,
            step: 0,
            length: -(targetRange.endColumn - range.startColumn + 1),
        };
        operators.push(result);
    }
    return operators;
};
/**
 * see the doc 【ref-range-remove-row.tldr】
 */
export const handleIRemoveRow = (param: IRemoveRowColCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }
    const operators: IOperator[] = [];
    if (range.endRow < targetRange.startRow) {
        const result: IVerticalMoveOperator = {
            type: OperatorType.VerticalMove,
            step: -(range.endRow - range.startRow + 1),
        };
        operators.push(result);
    } else if (
        (range.startRow <= targetRange.startRow && range.endRow >= targetRange.endRow) ||
        (range.startRow >= targetRange.startRow && range.endRow <= targetRange.endRow)
    ) {
        const result: IDeleteOperator = {
            type: OperatorType.Delete,
        };
        return [result];
    } else if (
        range.startRow <= targetRange.startRow &&
        range.endRow >= targetRange.startRow &&
        range.endRow <= targetRange.endRow
    ) {
        // the range in the targetRange top
        const result: IVerticalMoveOperator = {
            type: OperatorType.VerticalMove,
            step: -(targetRange.startRow - range.startRow),
            length: -(range.endRow - targetRange.startRow + 1),
        };
        operators.push(result);
    } else if (
        range.startRow >= targetRange.startRow &&
        range.startRow <= targetRange.endRow &&
        range.endRow >= targetRange.endRow
    ) {
        // the range in the targetRange bottom
        const result: IVerticalMoveOperator = {
            type: OperatorType.VerticalMove,
            step: 0,
            length: -(targetRange.endRow - range.startRow + 1),
        };
        operators.push(result);
    }
    return operators;
};

export const handleInsertRow = (param: IInsertRowCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }
    if (
        range.endRow <= targetRange.startRow ||
        (range.startRow <= targetRange.startRow && range.endRow >= targetRange.endRow)
    ) {
        const result: IVerticalMoveOperator = {
            type: OperatorType.VerticalMove,
            step: range.endRow - range.startRow + 1,
        };
        return [result];
    }
    if (range.startRow >= targetRange.startRow && range.endRow <= targetRange.endRow) {
        const result: IVerticalMoveOperator = {
            type: OperatorType.VerticalMove,
            step: 0,
            length: range.endRow - range.startRow + 1,
        };
        return [result];
    }

    if (Rectangle.intersects({ ...range, endRow: MAX_SAFE_INTEGER }, targetRange)) {
        const result: IDeleteOperator = {
            type: OperatorType.Delete,
        };
        return [result];
    }
    return [];
};

export const handleInsertCol = (param: IInsertColCommand, targetRange: IRange) => {
    const range = param.params?.range;
    if (!range) {
        return [];
    }
    if (
        range.endColumn < targetRange.startColumn ||
        (range.startColumn <= targetRange.startColumn && range.endColumn >= targetRange.endColumn)
    ) {
        const result: IHorizontalMoveOperator = {
            type: OperatorType.HorizontalMove,
            step: range.endColumn - range.startColumn + 1,
        };
        return [result];
    }
    if (range.startColumn >= targetRange.startColumn && range.endColumn <= targetRange.endColumn) {
        const result: IHorizontalMoveOperator = {
            type: OperatorType.HorizontalMove,
            step: 0,
            length: range.endColumn - range.startColumn + 1,
        };
        return [result];
    }
    if (Rectangle.intersects({ ...range, endColumn: MAX_SAFE_INTEGER }, targetRange)) {
        const result: IDeleteOperator = {
            type: OperatorType.Delete,
        };
        return [result];
    }
    return [];
};
export const handleInsertRangeMoveDown = (param: IInsertRangeMoveDownCommand, targetRange: IRange) => {
    const range = param.params?.range;

    if (!range) {
        return [];
    }

    if (
        range.startColumn <= targetRange.startColumn &&
        range.endColumn >= targetRange.endColumn &&
        range.endRow <= targetRange.startRow
    ) {
        if (range.startRow <= targetRange.startRow) {
            const result: IVerticalMoveOperator = {
                type: OperatorType.VerticalMove,
                step: range.endRow - range.startRow + 1,
            };
            return [result];
        }
    }
    if (Rectangle.intersects({ ...range, endRow: MAX_SAFE_INTEGER }, targetRange)) {
        const result: IDeleteOperator = {
            type: OperatorType.Delete,
        };
        return [result];
    }
    return [];
};

export const handleInsertRangeMoveRight = (param: IInsertRangeMoveRightCommand, targetRange: IRange) => {
    const range = param.params?.range;

    if (!range) {
        return [];
    }
    if (range.startRow <= targetRange.startRow && range.endRow >= targetRange.endRow) {
        if (range.startColumn <= targetRange.startColumn) {
            const result: IHorizontalMoveOperator = {
                type: OperatorType.HorizontalMove,
                step: range.endColumn - range.startColumn + 1,
            };
            return [result];
        }
    }
    if (Rectangle.intersects({ ...range, endColumn: MAX_SAFE_INTEGER }, targetRange)) {
        const result: IDeleteOperator = {
            type: OperatorType.Delete,
        };
        return [result];
    }
    return [];
};

export const handleDeleteRangeMoveLeft = (param: IDeleteRangeMoveLeftCommand, targetRange: IRange) => {
    const range = param.params?.range;

    if (!range) {
        return [];
    }

    if (range.startRow <= targetRange.startRow && range.endRow >= targetRange.endRow) {
        if (range.endColumn < targetRange.startColumn) {
            const result: IHorizontalMoveOperator = {
                type: OperatorType.HorizontalMove,
                step: -(range.endColumn - range.startColumn + 1),
            };
            return [result];
        }
    }
    if (Rectangle.intersects({ ...range, endColumn: MAX_SAFE_INTEGER }, targetRange)) {
        const result: IDeleteOperator = {
            type: OperatorType.Delete,
        };
        return [result];
    }
    return [];
};

export const handleDeleteRangeMoveUp = (param: IDeleteRangeMoveUpCommand, targetRange: IRange) => {
    const range = param.params?.range;

    if (!range) {
        return [];
    }

    if (range.startColumn <= targetRange.startColumn && range.endColumn >= targetRange.endColumn) {
        if (range.endRow < targetRange.startRow) {
            const result: IVerticalMoveOperator = {
                type: OperatorType.VerticalMove,
                step: -(range.endRow - range.startRow + 1),
            };
            return [result];
        }
    }
    if (Rectangle.intersects({ ...range, endRow: MAX_SAFE_INTEGER }, targetRange)) {
        const result: IDeleteOperator = {
            type: OperatorType.Delete,
        };
        return [result];
    }
    return [];
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
