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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import type { CubeValueObject } from '../../../engine/value-object/cube-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

/**
 * The result of the INDEX function is a reference and is interpreted as such by other formulas. Depending on the formula, the return value of INDEX may be used as a reference or as a value.
 *
 * =INDEX(A2:A5,2,1):A1 same as =A1:A3
 *
 * We refer to Google Sheets and set both rowNum and columnNum to optional
 *
 */
export class Index extends BaseFunction {
    override minParams = 2;

    override maxParams = 4;

    override needsReferenceObject = true;

    // eslint-disable-next-line max-lines-per-function, complexity
    override calculate(
        reference: FunctionVariantType,
        rowNum: FunctionVariantType,
        columnNum?: FunctionVariantType,
        areaNum?: FunctionVariantType
    ): BaseValueObject | BaseReferenceObject {
        if (reference.isError()) {
            return reference;
        }

        const referenceRowColumnCounts = this._getReferenceCounts(reference);

        let _rowNum = rowNum;

        if (rowNum.isReferenceObject()) {
            _rowNum = (rowNum as BaseReferenceObject).toArrayValueObject();
        }

        let _columnNum = columnNum;

        if (_columnNum?.isReferenceObject()) {
            _columnNum = (columnNum as BaseReferenceObject).toArrayValueObject();
        }

        let _areaNum = areaNum ?? NumberValueObject.create(1);

        if (_areaNum.isReferenceObject()) {
            _areaNum = (areaNum as BaseReferenceObject).toArrayValueObject();
        }

        // get max row length
        const maxRowLength = Math.max(
            _rowNum.isArray() ? (_rowNum as ArrayValueObject).getRowCount() : 1,
            _columnNum?.isArray() ? (_columnNum as ArrayValueObject).getRowCount() : 1,
            _areaNum.isArray() ? (_areaNum as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            _rowNum.isArray() ? (_rowNum as ArrayValueObject).getColumnCount() : 1,
            _columnNum?.isArray() ? (_columnNum as ArrayValueObject).getColumnCount() : 1,
            _areaNum.isArray() ? (_areaNum as ArrayValueObject).getColumnCount() : 1
        );

        // If maxRowLength and maxColumnLength are both 1, pick the value from the reference array
        // Otherwise, filter the results from the reference according to the specified rowNum/columnNum/areaNum, take the upper left corner cell value of each result array, and then form an array with maxRowLength row number and maxColumnLength column number.
        if (maxRowLength === 1 && maxColumnLength === 1) {
            return this._handleSingleObject(
                reference,
                _rowNum.isArray()
                    ? (_rowNum as ArrayValueObject).get(0, 0) as BaseValueObject
                    : _rowNum as BaseValueObject,
                _columnNum
                    ? (
                        _columnNum.isArray()
                            ? (_columnNum as ArrayValueObject).get(0, 0) as BaseValueObject
                            : _columnNum as BaseValueObject
                    )
                    : undefined,
                _areaNum.isArray()
                    ? (_areaNum as ArrayValueObject).get(0, 0) as BaseValueObject
                    : _areaNum as BaseValueObject,
                referenceRowColumnCounts
            );
        } else {
            const rowNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, _rowNum as BaseValueObject, ErrorValueObject.create(ErrorType.NA));
            const columnNumArray = _columnNum ? expandArrayValueObject(maxRowLength, maxColumnLength, _columnNum as BaseValueObject, ErrorValueObject.create(ErrorType.NA)) : [];
            const areaNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, _areaNum as BaseValueObject, ErrorValueObject.create(ErrorType.NA));

            return rowNumArray.mapValue((rowNumObject, rowIndex, columnIndex) => {
                const columnNumObject = _columnNum ? (columnNumArray as ArrayValueObject).get(rowIndex, columnIndex) as BaseValueObject : undefined;
                const areaNumObject = areaNumArray.get(rowIndex, columnIndex) as BaseValueObject;

                const result = this._handleSingleObject(reference, rowNumObject, columnNumObject, areaNumObject, referenceRowColumnCounts);

                if (result.isReferenceObject()) {
                    return (result as BaseReferenceObject).getCellByPosition();
                }

                return result as BaseValueObject;
            });
        }
    }

    private _handleSingleObject(
        reference: FunctionVariantType,
        rowNum: BaseValueObject,
        columnNum: BaseValueObject | undefined,
        areaNum: BaseValueObject,
        referenceRowColumnCounts: { rowCount: number; columnCount: number }[]
    ): BaseReferenceObject | BaseValueObject {
        let _rowNum;
        let _columnNum;
        let _areaNum;

        if (columnNum) {
            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(rowNum, columnNum, areaNum);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            _rowNum = (variants as BaseValueObject[])[0];
            _columnNum = (variants as BaseValueObject[])[1];
            _areaNum = (variants as BaseValueObject[])[2];
        } else {
            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(rowNum, areaNum);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            _rowNum = (variants as BaseValueObject[])[0];
            _areaNum = (variants as BaseValueObject[])[1];
        }

        const areaNumValue = Math.floor(+_areaNum.getValue());

        if (areaNumValue < 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (areaNumValue > referenceRowColumnCounts.length) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const referenceRowColumnCount = referenceRowColumnCounts[areaNumValue - 1];

        let rowNumValue = 0;
        let columnNumValue = 0;

        // When there is only one row, the rowNum is considered to be the column number.
        // =INDEX(A6:B6,2) equals =INDEX(A6:B6,1,2)
        if (referenceRowColumnCount.rowCount === 1 && !columnNum) {
            columnNumValue = Math.floor(+_rowNum.getValue());
        } else {
            rowNumValue = Math.floor(+_rowNum.getValue());

            if (columnNum) {
                columnNumValue = Math.floor(+(_columnNum as BaseValueObject).getValue());
            }
        }

        if (rowNumValue < 0 || columnNumValue < 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (rowNumValue > referenceRowColumnCount.rowCount || columnNumValue > referenceRowColumnCount.columnCount) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        let _reference = reference;

        if (areaNumValue > 1) {
            _reference = (reference as CubeValueObject).getCubeValues()[areaNumValue - 1];
        }

        if (_reference.isReferenceObject()) {
            return this._calculateReferenceObject(_reference as BaseReferenceObject, rowNumValue, columnNumValue);
        }

        return this._calculateArrayObject(_reference as BaseValueObject, rowNumValue, columnNumValue);
    }

    private _getReferenceCounts(reference: FunctionVariantType): { rowCount: number; columnCount: number }[] {
        let referenceRowColumnCounts = [
            {
                rowCount: 1,
                columnCount: 1,
            },
        ];

        if (reference.isReferenceObject()) {
            referenceRowColumnCounts = [
                {
                    rowCount: (reference as BaseReferenceObject).getRowCount(),
                    columnCount: (reference as BaseReferenceObject).getColumnCount(),
                },
            ];
        } else if ((reference as BaseValueObject).isCube()) {
            referenceRowColumnCounts = (reference as CubeValueObject).getCubeValues().map((value) => {
                return {
                    rowCount: value.getRowCount(),
                    columnCount: value.getColumnCount(),
                };
            });
        } else if ((reference as BaseValueObject).isArray()) {
            referenceRowColumnCounts = [
                {
                    rowCount: (reference as ArrayValueObject).getRowCount(),
                    columnCount: (reference as ArrayValueObject).getColumnCount(),
                },
            ];
        }

        return referenceRowColumnCounts;
    }

    private _calculateReferenceObject(reference: BaseReferenceObject, rowNum: number, columnNum: number): BaseReferenceObject | ErrorValueObject {
        const { startRow, endRow, startColumn, endColumn } = reference.getRangePosition();

        let referenceStartRow = 0;
        let referenceEndRow = 0;
        let referenceStartColumn = 0;
        let referenceEndColumn = 0;

        if (rowNum === 0) {
            referenceStartRow = startRow;
            referenceEndRow = endRow;
        } else {
            referenceStartRow = referenceEndRow = startRow + rowNum - 1;
        }

        if (columnNum === 0) {
            referenceStartColumn = startColumn;
            referenceEndColumn = endColumn;
        } else {
            referenceStartColumn = referenceEndColumn = startColumn + columnNum - 1;
        }

        if (referenceStartRow > endRow || referenceStartColumn > endColumn) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const range = {
            startRow: referenceStartRow,
            startColumn: referenceStartColumn,
            endRow: referenceEndRow,
            endColumn: referenceEndColumn,
        };

        return this.createReferenceObject(reference, range);
    }

    private _calculateArrayObject(reference: BaseValueObject, rowNum: number, columnNum: number): BaseValueObject {
        if (!reference.isArray() || (rowNum === 0 && columnNum === 0)) {
            return reference;
        }

        if (rowNum === 0) {
            return (reference as ArrayValueObject).slice(undefined, [columnNum - 1, columnNum]) as ArrayValueObject;
        }

        if (columnNum === 0) {
            return (reference as ArrayValueObject).slice([rowNum - 1, rowNum], undefined) as ArrayValueObject;
        }

        return (reference as ArrayValueObject).get(rowNum - 1, columnNum - 1) as BaseValueObject;
    }
}
