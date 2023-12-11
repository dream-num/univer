/**
 * Copyright 2023 DreamNum Inc.
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
    IMoveRangeCommand,
    IOperator,
    IRemoveRowColCommand,
    IVerticalMoveOperator,
} from './type';
import { OperatorType } from './type';

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
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
    const ranges = param.params?.ranges;
    if (!ranges) {
        return [];
    }
    const operators: IOperator[] = [];
    for (let index = 0; index < ranges.length; index++) {
        const range = ranges[index];
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
    }
    return operators;
};
/**
 * see the doc 【ref-range-remove-row.tldr】
 */
export const handleIRemoveRow = (param: IRemoveRowColCommand, targetRange: IRange) => {
    const ranges = param.params?.ranges;
    if (!ranges) {
        return [];
    }
    const operators: IOperator[] = [];
    for (let index = 0; index < ranges.length; index++) {
        const range = ranges[index];
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
    const ranges = param.params?.ranges;

    if (!ranges || ranges.length !== 1) {
        return [];
    }
    const range = ranges[0];
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
    const ranges = param.params?.ranges;

    if (!ranges || ranges.length !== 1) {
        return [];
    }
    const range = ranges[0];
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
    const ranges = param.params?.ranges;

    if (!ranges || ranges.length !== 1) {
        return [];
    }
    const range = ranges[0];

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
    const ranges = param.params?.ranges;

    if (!ranges || ranges.length !== 1) {
        return [];
    }
    const range = ranges[0];

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
