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

import type { ICellData, Nullable } from '@univerjs/core';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import { CellValueType } from '@univerjs/core';
import { ErrorType } from '../../basics/error-type';
import { compareToken } from '../../basics/token';
import { CellReferenceObject } from '../reference-object/cell-reference-object';
import { ColumnReferenceObject } from '../reference-object/column-reference-object';
import { RowReferenceObject } from '../reference-object/row-reference-object';
import { ArrayValueObject } from '../value-object/array-value-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject } from '../value-object/primitive-object';
import { expandArrayValueObject } from './array-object';
import { isWildcard } from './compare';
import { booleanObjectIntersection, findCompareToken, valueObjectCompare } from './object-compare';

export function convertTonNumber(valueObject: BaseValueObject) {
    const currentValue = valueObject.getValue();
    let result = 0;
    if (currentValue) {
        result = 1;
    }
    return NumberValueObject.create(result);
}

export function isSingleValueObject(valueObject: FunctionVariantType) {
    if (valueObject.isArray() && (valueObject as ArrayValueObject).getRowCount() === 1 && (valueObject as ArrayValueObject).getColumnCount() === 1) {
        return true;
    }

    if (valueObject.isReferenceObject()) {
        if ((valueObject as BaseReferenceObject).isCell()) {
            return true;
        }

        if ((valueObject as BaseReferenceObject).getRowCount() === 1 && (valueObject as BaseReferenceObject).getColumnCount() === 1) {
            return true;
        }

        return false;
    }

    valueObject = valueObject as BaseValueObject;

    if (valueObject.isString() || valueObject.isNumber() || valueObject.isBoolean() || valueObject.isError() || valueObject.isNull()) {
        return true;
    }

    return false;
}

/**
 * Covert BaseValueObject to cell value
 * @param objectValue
 * @returns
 */
export function objectValueToCellValue(objectValue: Nullable<BaseValueObject>): ICellData | undefined {
    const pattern = objectValue?.getPattern();
    let cellWithStyle: ICellData = {};
    let cellWithCustomData: ICellData = {};

    if (pattern) {
        cellWithStyle = {
            s: {
                n: {
                    pattern,
                },
            },
        };
    }

    if (objectValue?.getCustomData()) {
        cellWithCustomData = {
            custom: objectValue.getCustomData(),
        };
    }

    if (objectValue == null) {
        return {
            v: null,
            ...cellWithStyle,
        };
    }
    if (objectValue.isError()) {
        return {
            v: (objectValue as ErrorValueObject).getErrorType() as string,
            t: CellValueType.STRING,
            ...cellWithStyle,
            ...cellWithCustomData,
        };
    }
    if (objectValue.isValueObject()) {
        const vo = objectValue as BaseValueObject;
        const v = vo.getValue();
        if (vo.isNumber()) {
            return {
                v,
                t: CellValueType.NUMBER,
                ...cellWithStyle,
                ...cellWithCustomData,
            };
        }
        if (vo.isBoolean()) {
            return {
                v: v ? 1 : 0,
                t: CellValueType.BOOLEAN,
                ...cellWithStyle,
                ...cellWithCustomData,
            };
        }
        // String "00"
        // =IF(1,"0") evaluates to "0", which should be a normal string (regardless of whether it is a number or not). Forced strings only appear when preceded by single quotes
        if (vo.isString()) {
            return {
                v,
                t: CellValueType.STRING,
                ...cellWithStyle,
                ...cellWithCustomData,
            };
        }

        if (vo.isNull()) {
            return {
                v: null,
                ...cellWithStyle,
                ...cellWithCustomData,
            };
        }

        return {
            v,
            t: CellValueType.STRING,
            ...cellWithStyle,
            ...cellWithCustomData,
        };
    }
}

/**
 * The size of the extended range is determined by the maximum width and height of the criteria range.
 * @param variants
 * @returns
 */
export function calculateMaxDimensions(variants: BaseValueObject[]) {
    let maxRowLength = 0;
    let maxColumnLength = 0;

    variants.forEach((variant, i) => {
        if (i % 2 === 1) {
            if (variant.isArray()) {
                const arrayValue = variant as ArrayValueObject;
                maxRowLength = Math.max(maxRowLength, arrayValue.getRowCount());
                maxColumnLength = Math.max(maxColumnLength, arrayValue.getColumnCount());
            } else {
                maxRowLength = Math.max(maxRowLength, 1);
                maxColumnLength = Math.max(maxColumnLength, 1);
            }
        }
    });

    return { maxRowLength, maxColumnLength };
}

/**
 * Parse the paired range and criteria in functions like COUNTIFS, SUMIFS, etc.
 * @param variants - The range and criteria pairs
 * @param targetRange - The target range for calculation (e.g., sumRange in SUMIFS)
 * @returns An object containing parsed information
 */
// eslint-disable-next-line max-lines-per-function
export function parsePairedRangeAndCriteria(
    variants: FunctionVariantType[],
    targetRange?: FunctionVariantType
): {
    isError: boolean;
    errorObject: ErrorValueObject | null;
    rangeIsDifferentSize: boolean;
    criteriaMaxRowLength: number;
    criteriaMaxColumnLength: number;
    targetRange: ArrayValueObject | null;
    variants: BaseValueObject[];
} {
    /**
     * The range and criteria must be in pairs.
     * If not, Excel will prevent the operation. But we can't do it like that, so we just return a #VALUE! error.
     */
    if (variants.length === 0 || variants.length % 2 !== 0) {
        return {
            isError: true,
            errorObject: ErrorValueObject.create(ErrorType.VALUE),
            rangeIsDifferentSize: false,
            criteriaMaxRowLength: 0,
            criteriaMaxColumnLength: 0,
            targetRange: null,
            variants: [],
        };
    }

    let _targetRange: ArrayValueObject | null = null;
    let targetRangeRowCount = -1;
    let targetRangeColumnCount = -1;

    if (targetRange) {
        /**
         * If the target range is provided, it must be a reference object.
         * If not, Excel will prevent the operation. But we can't do it like that, so we just return a #VALUE! error.
         */
        if (!targetRange.isReferenceObject()) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
                rangeIsDifferentSize: false,
                criteriaMaxRowLength: 0,
                criteriaMaxColumnLength: 0,
                targetRange: null,
                variants: [],
            };
        }

        _targetRange = (targetRange as BaseReferenceObject).toArrayValueObject();
        targetRangeRowCount = (_targetRange as ArrayValueObject).getRowCount();
        targetRangeColumnCount = (_targetRange as ArrayValueObject).getColumnCount();
    }

    let criteriaMaxRowLength = 0;
    let criteriaMaxColumnLength = 0;
    let rangeIsDifferentSize = false;

    const _variants: BaseValueObject[] = [];

    for (let i = 0; i < variants.length; i++) {
        if (i % 2 === 1) {
            const range = variants[i - 1];
            const criteria = variants[i];

            /**
             * The range must be a reference object.
             * If not, Excel will prevent the operation. But we can't do it like that, so we just return a #VALUE! error.
             */
            if (!range.isReferenceObject()) {
                return {
                    isError: true,
                    errorObject: ErrorValueObject.create(ErrorType.VALUE),
                    rangeIsDifferentSize: false,
                    criteriaMaxRowLength: 0,
                    criteriaMaxColumnLength: 0,
                    targetRange: null,
                    variants: [],
                };
            }

            const _range = (range as BaseReferenceObject).toArrayValueObject();
            const rangeRowCount = _range.getRowCount();
            const rangeColumnCount = _range.getColumnCount();

            if (i === 1 && targetRangeRowCount === -1 && targetRangeColumnCount === -1) {
                // If the target range is not specified, use the first range as the target range. e.g. COUNTIFS(A1:A3, ">1", B1:B3, "<5").
                targetRangeRowCount = rangeRowCount;
                targetRangeColumnCount = rangeColumnCount;
            } else if (!rangeIsDifferentSize && (targetRangeRowCount !== rangeRowCount || targetRangeColumnCount !== rangeColumnCount)) {
                // The size of each range must be the same as the target range
                rangeIsDifferentSize = true;
            }

            let _criteria = criteria;

            if (criteria.isReferenceObject()) {
                _criteria = (criteria as BaseReferenceObject).toArrayValueObject();
            }

            criteriaMaxRowLength = Math.max(criteriaMaxRowLength, _criteria.isArray() ? (_criteria as ArrayValueObject).getRowCount() : 1);
            criteriaMaxColumnLength = Math.max(criteriaMaxColumnLength, _criteria.isArray() ? (_criteria as ArrayValueObject).getColumnCount() : 1);

            _variants.push(_range);
            _variants.push(_criteria as BaseValueObject);
        }
    }

    return {
        isError: false,
        errorObject: null,
        rangeIsDifferentSize,
        criteriaMaxRowLength,
        criteriaMaxColumnLength,
        targetRange: _targetRange,
        variants: _variants,
    };
}

export function baseValueObjectToArrayValueObject(valueObject: BaseValueObject): ArrayValueObject {
    if (valueObject.isArray()) {
        return valueObject as ArrayValueObject;
    }

    return ArrayValueObject.createByArray([[valueObject.getValue()]]);
}

/**
 * Get the paired range and criteria result for COUNTIFS, SUMIFS, etc.
 */
// eslint-disable-next-line max-lines-per-function
export function getPairedRangeAndCriteriaResult(
    variants: BaseValueObject[],
    params: {
        formulaName: string;
        maxRowLength: number;
        maxColumnLength: number;
        isNumberSensitive?: boolean;
        targetRange?: ArrayValueObject;
    }
) {
    const { formulaName, maxRowLength, maxColumnLength, isNumberSensitive = false, targetRange } = params;

    // Align all criteria values to the same dimension as the maximum criteria range.
    const rangeAndCriteriaArrays: Array<{
        range: ArrayValueObject;
        criteriaArray: ArrayValueObject;
    }> = [];

    for (let i = 0; i < variants.length; i++) {
        if (i % 2 === 1) continue;

        const range = variants[i] as ArrayValueObject;
        const criteria = variants[i + 1];
        const criteriaArray = expandArrayValueObject(maxRowLength, maxColumnLength, criteria, ErrorValueObject.create(ErrorType.NA));

        rangeAndCriteriaArrays.push({
            range,
            criteriaArray,
        });
    }

    if (rangeAndCriteriaArrays.length === 0) return [];

    const results: BaseValueObject[][] = [];

    /**
     * Iterate through all criteria values for each dimension, calculate the comparison result with the corresponding range, and then calculate the Boolean intersection of all comparison results as the final result for that dimension criteria value.
     * Then calculate this dimension criteria value's result.
     * This avoiding store the all dimension comparison result in memory and then calculating all dimension criteria value's result, which may cause memory overflow when the range is large and there are multiple dimension criteria.
     * For example, `=COUNTIFS(Q$3:Q$10002,C$3:C$5002,R$3:R$10002,L6)`.
     */
    // eslint-disable-next-line max-lines-per-function
    rangeAndCriteriaArrays[0].criteriaArray.iterator((_, rowIndex, columnIndex) => {
        // Fast path: avoid building full-length boolean mask ArrayValueObjects per criterion.
        // It collects matching cell positions directly and reuses the same reducer methods,
        // producing bit-identical results. Returns undefined to fall back to the slow path below.
        const fastResult = tryFastCriteriaReduce(
            rangeAndCriteriaArrays,
            rowIndex,
            columnIndex,
            formulaName,
            targetRange,
            isNumberSensitive
        );

        if (fastResult !== undefined) {
            if (!results[rowIndex]) {
                results[rowIndex] = [];
            }

            results[rowIndex][columnIndex] = fastResult;
            return;
        }

        let finalCompareResult: ArrayValueObject | undefined;

        for (let i = 0; i < rangeAndCriteriaArrays.length; i++) {
            const { range, criteriaArray } = rangeAndCriteriaArrays[i];
            const criteriaValueObject = criteriaArray.get(rowIndex, columnIndex);

            if (!criteriaValueObject) {
                continue;
            }

            // range must be an ArrayValueObject, criteria must be a BaseValueObject
            let compareResult = valueObjectCompare(range, criteriaValueObject) as ArrayValueObject;

            // When comparing non-numbers and numbers, countifs does not take the result
            if (isNumberSensitive) {
                compareResult = filterSameValueObjectResult(compareResult, range, criteriaValueObject);
            }

            if (finalCompareResult === undefined) {
                finalCompareResult = compareResult;
                continue;
            }

            finalCompareResult = booleanObjectIntersection(finalCompareResult, compareResult);
        }

        let result: BaseValueObject | undefined;

        if (formulaName === 'COUNTIFS') {
            let count = 0;
            (finalCompareResult as ArrayValueObject).iterator((value) => {
                if (value?.isBoolean() && value.getValue() === true) {
                    count++;
                }
            });
            result = NumberValueObject.create(count);
        } else if (formulaName === 'SUMIFS') {
            result = targetRange!.pick(finalCompareResult as ArrayValueObject).sum();
        } else if (formulaName === 'AVERAGEIFS') {
            const picked = targetRange!.pick(finalCompareResult as ArrayValueObject);
            const sum = picked.sum();
            const count = picked.count();
            result = sum.divided(count);
        } else if (formulaName === 'MAXIFS') {
            const picked = targetRange!.pick(finalCompareResult as ArrayValueObject);
            if (picked.getColumnCount() === 0) {
                result = ArrayValueObject.create('0');
            } else {
                result = picked.max();
            }
        } else if (formulaName === 'MINIFS') {
            const picked = targetRange!.pick(finalCompareResult as ArrayValueObject);
            if (picked.getColumnCount() === 0) {
                result = ArrayValueObject.create('0');
            } else {
                result = picked.min();
            }
        }

        if (!results[rowIndex]) {
            results[rowIndex] = [];
        }

        results[rowIndex][columnIndex] = result as BaseValueObject;
    });

    return results;
}

/**
 * Fast path for a single criteria cell of COUNTIFS/SUMIFS/AVERAGEIFS/MAXIFS/MINIFS.
 *
 * Instead of building a full-length boolean mask ArrayValueObject per criterion (and then
 * intersecting and picking), this collects the matching cell positions directly in row-major
 * order and feeds the matched TARGET values to the SAME reducer methods used by the slow path.
 * This keeps results bit-identical while avoiding per-criterion full-length allocations.
 *
 * @returns the computed result, or `undefined` to indicate the caller should fall back to the
 * existing slow path (e.g. missing criteria cell, mismatched dims, wildcard criteria, or an
 * unhandled formula name).
 */
// eslint-disable-next-line max-lines-per-function, complexity
function tryFastCriteriaReduce(
    rangeAndCriteriaArrays: Array<{ range: ArrayValueObject; criteriaArray: ArrayValueObject }>,
    rowIndex: number,
    columnIndex: number,
    formulaName: string,
    targetRange: ArrayValueObject | undefined,
    isNumberSensitive: boolean
): BaseValueObject | undefined {
    // Parse all criteria up front; bail out (fall back) on any case the fast path does not handle.
    const parsedCriteria: Array<{
        range: ArrayValueObject;
        operator: compareToken;
        criteriaObj: BaseValueObject;
    }> = [];

    let rows = -1;
    let cols = -1;

    for (let i = 0; i < rangeAndCriteriaArrays.length; i++) {
        const { range, criteriaArray } = rangeAndCriteriaArrays[i];
        const criteriaValueObject = criteriaArray.get(rowIndex, columnIndex);

        // The slow path's `continue` on a missing criteria cell is subtle; fall back instead.
        if (criteriaValueObject == null) {
            return undefined;
        }

        // All ranges must share identical dimensions; capture from the first range.
        const rangeRows = range.getRowCount();
        const rangeCols = range.getColumnCount();

        if (rows === -1) {
            rows = rangeRows;
            cols = rangeCols;
        } else if (rangeRows !== rows || rangeCols !== cols) {
            return undefined;
        }

        const [operator, criteriaObj] = findCompareToken(`${criteriaValueObject.getValue()}`);

        // Wildcards use a different compare path; let the slow path handle them.
        if (criteriaObj.isString() && isWildcard(criteriaObj.getValue() as string)) {
            return undefined;
        }

        parsedCriteria.push({ range, operator, criteriaObj });
    }

    if (rows <= 0 || cols <= 0) {
        return undefined;
    }

    // Collect matching cell positions row-major, intersecting across criteria.
    let matched: Array<[number, number]> = [];

    for (let i = 0; i < parsedCriteria.length; i++) {
        const { range, operator, criteriaObj } = parsedCriteria[i];

        if (i === 0) {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (cellMatchesCriteria(range.get(r, c), criteriaObj, operator, isNumberSensitive)) {
                        matched.push([r, c]);
                    }
                }
            }
        } else {
            matched = matched.filter(([r, c]) => cellMatchesCriteria(range.get(r, c), criteriaObj, operator, isNumberSensitive));
        }

        // Once nothing matches, further criteria cannot add matches.
        if (matched.length === 0) {
            break;
        }
    }

    // Reduce, reusing the engine's own reducers for bit-identity with the slow path.
    if (formulaName === 'COUNTIFS') {
        return NumberValueObject.create(matched.length);
    }

    // Build a `pick`-equivalent single-row array of the matched TARGET cells, in row-major order.
    const pickedValues = matched.map(([r, c]) => targetRange!.get(r, c) ?? NullValueObject.create());
    const picked = ArrayValueObject.create({
        calculateValueList: [pickedValues],
        rowCount: 1,
        columnCount: pickedValues.length,
        unitId: '',
        sheetId: '',
        row: 0,
        column: 0,
    });

    if (formulaName === 'SUMIFS') {
        return picked.sum();
    } else if (formulaName === 'AVERAGEIFS') {
        return picked.sum().divided(picked.count());
    } else if (formulaName === 'MAXIFS') {
        return picked.getColumnCount() === 0 ? ArrayValueObject.create('0') : picked.max();
    } else if (formulaName === 'MINIFS') {
        return picked.getColumnCount() === 0 ? ArrayValueObject.create('0') : picked.min();
    }

    // Unhandled formula name: fall back to the slow path.
    return undefined;
}

/**
 * Determine whether a single range cell matches a parsed criteria, ported exactly from
 * `valueObjectCompare` + `filterSameValueObjectResult` so the fast path stays bit-identical.
 */
function cellMatchesCriteria(
    rangeCell: Nullable<BaseValueObject>,
    criteriaObj: BaseValueObject,
    operator: compareToken,
    isNumberSensitive: boolean
): boolean {
    if (rangeCell == null) {
        return false;
    }

    const raw = rangeCell.compare(criteriaObj, operator);
    const rawTrue = raw.getValue() === true;

    if (!isNumberSensitive) {
        return rawTrue;
    }

    // Mirrors filterSameValueObjectResult.
    if (isSameValueObjectType(rangeCell, criteriaObj)) {
        return rawTrue;
    }

    if (rangeCell.isError() && criteriaObj.isError() && rangeCell.getValue() === criteriaObj.getValue()) {
        return true;
    }

    if (operator === compareToken.EQUALS || operator === compareToken.NOT_EQUAL) {
        if (rangeCell.isNumber() && criteriaObj.isString()) {
            const cn = criteriaObj.convertToNumberObjectValue();
            if (cn.isNumber()) {
                return rangeCell.compare(cn, operator).getValue() === true;
            }
        }

        if (criteriaObj.isNumber() && rangeCell.isString()) {
            const rn = rangeCell.convertToNumberObjectValue();
            if (rn.isNumber()) {
                return rn.compare(criteriaObj, operator).getValue() === true;
            }
        }

        if (operator === compareToken.EQUALS) {
            return false;
        }

        if (operator === compareToken.NOT_EQUAL) {
            return true;
        }
    }

    return false;
}

/**
 * Two ArrayValueObject of the same type can be compared
 */
export function filterSameValueObjectResult(array: ArrayValueObject, range: ArrayValueObject, criteria: BaseValueObject): ArrayValueObject {
    const [operator, criteriaObject] = findCompareToken(`${criteria.getValue()}`);

    return array.mapValue((valueObject, r, c) => {
        const rangeValueObject = range.get(r, c);

        if (rangeValueObject && isSameValueObjectType(rangeValueObject, criteriaObject)) {
            return valueObject;
        }

        if (rangeValueObject?.isError() && criteriaObject.isError() && rangeValueObject.getValue() === criteriaObject.getValue()) {
            return BooleanValueObject.create(true);
        }

        /**
         * If the operator is '=' or '<>', we can compare numbers and strings directly in COUNTIF, COUNTIFS, SUMIF, SUMIFS, etc.
         * Other operators require both valueObjects to be of the same type.
         * For example:
         * | A1    | B1  |
         * | '123' | 123 |
         *
         * =COUNTIF(A1:B1, '=123') will return 2
         * =COUNTIF(A1:B1, '<>1') will return 2
         * =COUNTIF(A1:B1, '>1') will return 1
         * =COUNTIF(A1:B1, '<=123') will return 1
         */
        if (operator === compareToken.EQUALS || operator === compareToken.NOT_EQUAL) {
            if (rangeValueObject?.isNumber() && criteriaObject.isString()) {
                const criteriaNumber = criteriaObject.convertToNumberObjectValue();

                if (criteriaNumber.isNumber()) {
                    return rangeValueObject.compare(criteriaNumber, operator);
                }
            }

            if (criteriaObject.isNumber() && rangeValueObject?.isString()) {
                const rangeNumber = rangeValueObject.convertToNumberObjectValue();

                if (rangeNumber.isNumber()) {
                    return rangeNumber.compare(criteriaObject, operator);
                }
            }

            if (operator === compareToken.EQUALS) {
                return BooleanValueObject.create(false);
            }

            if (operator === compareToken.NOT_EQUAL) {
                return BooleanValueObject.create(true);
            }
        }

        return BooleanValueObject.create(false);
    });
}

/**
 * Check if the two valueObjects are of the same type
 * @param left
 * @param right
 * @returns
 */
export function isSameValueObjectType(left: BaseValueObject, right: BaseValueObject) {
    if (left.isNumber() && right.isNumber()) {
        return true;
    }

    if (left.isBoolean() && right.isBoolean()) {
        return true;
    }

    // blank string is same as a blank cell
    const isLeftBlank = left.isString() && left.getValue() === '';
    const isRightBlank = right.isString() && right.getValue() === '';

    if ((isLeftBlank || left.isNull()) && (isRightBlank || right.isNull())) {
        return true;
    }

    if (left.isString() && !isLeftBlank && right.isString() && !isRightBlank) {
        return true;
    }

    return false;
}

export enum ReferenceObjectType {
    CELL,
    COLUMN,
    ROW,
}

export function getReferenceObjectFromCache(trimToken: string, type: ReferenceObjectType) {
    let referenceObject: BaseReferenceObject;
    switch (type) {
        case ReferenceObjectType.COLUMN:
            referenceObject = new ColumnReferenceObject(trimToken);
            break;
        case ReferenceObjectType.ROW:
            referenceObject = new RowReferenceObject(trimToken);
            break;

        case ReferenceObjectType.CELL:
        default:
            referenceObject = new CellReferenceObject(trimToken);
            break;
    }

    return referenceObject;
}

export function getRangeReferenceObjectFromCache(variant1: BaseReferenceObject, variant2: BaseReferenceObject) {
    let referenceObject: FunctionVariantType;
    if (variant1.isCell() && variant2.isCell()) {
        referenceObject = variant1.unionBy(variant2) as BaseReferenceObject;
    } else if (variant1.isRow() && variant2.isRow()) {
        referenceObject = variant1.unionBy(variant2) as BaseReferenceObject;
    } else if (variant1.isColumn() && variant2.isColumn()) {
        referenceObject = variant1.unionBy(variant2) as BaseReferenceObject;
    } else {
        referenceObject = ErrorValueObject.create(ErrorType.NAME);
    }
    return referenceObject;
}
