/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IRange } from '@univerjs/core';
import { ObjectMatrix, Range } from '@univerjs/core';

export const createTopMatrixFromRanges = (ranges: IRange[]) => {
    const matrix = new ObjectMatrix<number>();
    ranges.forEach((range) => {
        Range.foreach(range, (row, col) => {
            matrix.setValue(row, col, 1);
        });
    });
    matrix.forValue((row, col) => {
        const theLastRowValue = matrix.getValue(row - 1, col);
        if (theLastRowValue) {
            matrix.setValue(row, col, theLastRowValue + 1);
        }
    });
    return matrix;
};
export const createTopMatrixFromMatrix = (matrix: ObjectMatrix<1>) => {
    const _matrix = matrix as ObjectMatrix<number>;
    _matrix.forValue((row, col) => {
        const theLastRowValue = matrix.getValue(row - 1, col);
        if (theLastRowValue) {
            _matrix.setValue(row, col, theLastRowValue + 1);
        }
    });
    return _matrix;
};
const findMaximalRectangle = (topMatrix: ObjectMatrix<number>) => {
    const res: {
        area: number;
        range?: IRange;
    } = {
        area: 0,
    };
    const checkArea = (area: number, range: IRange) => {
        if (res.area < area) {
            res.area = area;
            res.range = range;
            return true;
        }
        return false;
    };

    topMatrix.forValue((row, col, lineArea) => {
        let cols = 1;
        let rows = lineArea;
        checkArea(cols * rows, {
            startRow: row - rows + 1,
            endRow: row,
            startColumn: col,
            endColumn: col,
        });
        const _range = {
            startRow: row - rows + 1,
            endRow: row,
            startColumn: 0,
            endColumn: col,
        };
        for (let k = col - 1; k >= 0; k--) {
            if (!topMatrix.getValue(row, k)) {
                break;
            } else {
                rows = Math.min(topMatrix.getValue(row, k) || 0, rows);
                cols++;
                const area = rows * cols;
                _range.startColumn = k;
                _range.startRow = row - rows + 1;
                checkArea(area, _range);
            }
        }
    });
    return res;
};

const filterLeftMatrix = (topMatrix: ObjectMatrix<number>, range: IRange) => {
    Range.foreach(range, (row, col) => {
        topMatrix.realDeleteValue(row, col);
    });

    for (let col = range.startColumn; col <= range.endColumn; col++) {
        const row = range.endRow + 1;
        const v = topMatrix.getValue(row, col)!;
        if (v > 0) {
            topMatrix.setValue(row, col, 1);
            let nextRow = row + 1;
            while (topMatrix.getValue(nextRow, col)! > 0) {
                topMatrix.setValue(nextRow, col, topMatrix.getValue(nextRow - 1, col)! + 1);
                nextRow++;
            }
        }
    }
    return topMatrix;
};

export const findAllRectangle = (topMatrix: ObjectMatrix<number>) => {
    const resultList = [];
    let result = findMaximalRectangle(topMatrix);
    while (result.area > 0) {
        if (result.range) {
            resultList.push(result.range);
            filterLeftMatrix(topMatrix, result.range);
        }
        result = findMaximalRectangle(topMatrix);
    }
    return resultList;
};

/**
 * Some operations generate sparse ranges such as paste/autofill/ref-range, and this function merge some small ranges into some large ranges to reduce transmission size.
 * Time Complexity: O(mn) , where m and n are rows and columns. It takes O(mn) to compute the markMatrix and O(n) to apply the histogram algorithm to each column.
 * ps. column sparse matrices have better performance
 * @param {IRange[]} ranges
 * @returns {IRange[]}
 */
export const rangeMerge = (ranges: IRange[]) => {
    const topMatrix = createTopMatrixFromRanges(ranges);
    return findAllRectangle(topMatrix);
};

export class RangeMergeUtil {
    private _matrix = new ObjectMatrix<1>();
    add(...ranges: IRange[]) {
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._matrix.setValue(row, col, 1);
            });
        });
        return this;
    }

    subtract(...ranges: IRange[]) {
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._matrix.realDeleteValue(row, col);
            });
        });
        return this;
    }

    merge() {
        const topMatrix = createTopMatrixFromMatrix(this._matrix);
        const ranges = findAllRectangle(topMatrix);
        return ranges;
    }
}
