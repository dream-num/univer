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
import { FUNCTION_NAMES_MATH } from '../../functions/math/function-names';
import { FUNCTION_NAMES_STATISTICAL } from '../../functions/statistical/function-names';
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
type IfsFunctionName =
    | FUNCTION_NAMES_MATH.SUMIFS
    | FUNCTION_NAMES_STATISTICAL.AVERAGEIFS
    | FUNCTION_NAMES_STATISTICAL.COUNTIFS
    | FUNCTION_NAMES_STATISTICAL.MAXIFS
    | FUNCTION_NAMES_STATISTICAL.MINIFS;

// eslint-disable-next-line max-lines-per-function
export function getPairedRangeAndCriteriaResult(
    variants: BaseValueObject[],
    params: {
        formulaName: IfsFunctionName;
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
    rangeAndCriteriaArrays[0].criteriaArray.iterator((_, rowIndex, columnIndex) => {
        const fastResult = maxRowLength === 1 && maxColumnLength === 1
            ? tryFastCriteriaReduce(rangeAndCriteriaArrays, rowIndex, columnIndex, formulaName, targetRange, isNumberSensitive)
            : undefined;

        if (fastResult !== undefined) {
            results[rowIndex] = [fastResult];
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

        if (formulaName === FUNCTION_NAMES_STATISTICAL.COUNTIFS) {
            let count = 0;
            (finalCompareResult as ArrayValueObject).iterator((value) => {
                if (value?.isBoolean() && value.getValue() === true) {
                    count++;
                }
            });
            result = NumberValueObject.create(count);
        } else if (formulaName === FUNCTION_NAMES_MATH.SUMIFS) {
            result = targetRange!.pick(finalCompareResult as ArrayValueObject).sum();
        } else if (formulaName === FUNCTION_NAMES_STATISTICAL.AVERAGEIFS) {
            const picked = targetRange!.pick(finalCompareResult as ArrayValueObject);
            const sum = picked.sum();
            const count = picked.count();
            result = sum.divided(count);
        } else if (formulaName === FUNCTION_NAMES_STATISTICAL.MAXIFS) {
            const picked = targetRange!.pick(finalCompareResult as ArrayValueObject);
            if (picked.getColumnCount() === 0) {
                result = NumberValueObject.create(0);
            } else {
                result = picked.max();
            }
        } else if (formulaName === FUNCTION_NAMES_STATISTICAL.MINIFS) {
            const picked = targetRange!.pick(finalCompareResult as ArrayValueObject);
            if (picked.getColumnCount() === 0) {
                result = NumberValueObject.create(0);
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

interface IRangeAndCriteriaArray {
    range: ArrayValueObject;
    criteriaArray: ArrayValueObject;
}

interface IParsedCriteria {
    range: ArrayValueObject;
    operator: compareToken;
    criteriaObject: BaseValueObject;
}

interface IParsedCriteriaResult {
    criteria: IParsedCriteria[];
    rowCount: number;
    columnCount: number;
}

function tryFastCriteriaReduce(
    rangeAndCriteriaArrays: IRangeAndCriteriaArray[],
    rowIndex: number,
    columnIndex: number,
    formulaName: IfsFunctionName,
    targetRange: ArrayValueObject | undefined,
    isNumberSensitive: boolean
): BaseValueObject | undefined {
    const isCount = formulaName === FUNCTION_NAMES_STATISTICAL.COUNTIFS;
    const isTargetFormula = formulaName === FUNCTION_NAMES_MATH.SUMIFS ||
        formulaName === FUNCTION_NAMES_STATISTICAL.AVERAGEIFS ||
        formulaName === FUNCTION_NAMES_STATISTICAL.MAXIFS ||
        formulaName === FUNCTION_NAMES_STATISTICAL.MINIFS;
    if (!isCount && (!isTargetFormula || targetRange === undefined)) {
        return undefined;
    }

    const parsed = parseFastCriteria(rangeAndCriteriaArrays, rowIndex, columnIndex);
    if (!parsed || !hasMatchingDimensions(targetRange, parsed.rowCount, parsed.columnCount)) {
        return undefined;
    }

    const matchedPositions = findMatchingPositions(parsed, isNumberSensitive);
    return reduceMatchingPositions(formulaName, targetRange, matchedPositions, parsed.columnCount);
}

function parseFastCriteria(
    rangeAndCriteriaArrays: IRangeAndCriteriaArray[],
    rowIndex: number,
    columnIndex: number
): IParsedCriteriaResult | undefined {
    const parsedCriteria: IParsedCriteria[] = [];
    const firstRange = rangeAndCriteriaArrays[0].range;
    const rowCount = firstRange.getRowCount();
    const columnCount = firstRange.getColumnCount();

    if (rowCount < 1 || columnCount < 1) {
        return undefined;
    }

    for (const { range, criteriaArray } of rangeAndCriteriaArrays) {
        const criteria = criteriaArray.get(rowIndex, columnIndex);
        if (!criteria || range.getRowCount() !== rowCount || range.getColumnCount() !== columnCount) {
            return undefined;
        }

        const [operator, criteriaObject] = criteria.isString()
            ? findCompareToken(`${criteria.getValue()}`)
            : [compareToken.EQUALS, criteria];
        if (criteriaObject.isString() && isWildcard(`${criteriaObject.getValue()}`)) {
            return undefined;
        }

        parsedCriteria.push({ range, operator, criteriaObject });
    }

    return { criteria: parsedCriteria, rowCount, columnCount };
}

function hasMatchingDimensions(targetRange: ArrayValueObject | undefined, rowCount: number, columnCount: number): boolean {
    return targetRange === undefined ||
        (targetRange.getRowCount() === rowCount && targetRange.getColumnCount() === columnCount);
}

function findMatchingPositions(parsed: IParsedCriteriaResult, isNumberSensitive: boolean): number[] {
    const { criteria, rowCount, columnCount } = parsed;
    const matchedPositions: number[] = [];

    for (let criteriaIndex = 0; criteriaIndex < criteria.length; criteriaIndex++) {
        const { range, operator, criteriaObject } = criteria[criteriaIndex];
        if (criteriaIndex === 0) {
            for (let row = 0; row < rowCount; row++) {
                for (let column = 0; column < columnCount; column++) {
                    if (isCriteriaMatch(range.get(row, column), criteriaObject, operator, isNumberSensitive)) {
                        matchedPositions.push(row * columnCount + column);
                    }
                }
            }
        } else {
            filterMatchingPositions(matchedPositions, range, criteriaObject, operator, columnCount, isNumberSensitive);
        }

        if (matchedPositions.length === 0) {
            break;
        }
    }

    return matchedPositions;
}

function filterMatchingPositions(
    matchedPositions: number[],
    range: ArrayValueObject,
    criteriaObject: BaseValueObject,
    operator: compareToken,
    columnCount: number,
    isNumberSensitive: boolean
): void {
    let writeIndex = 0;
    for (const position of matchedPositions) {
        const row = Math.floor(position / columnCount);
        const column = position % columnCount;
        if (isCriteriaMatch(range.get(row, column), criteriaObject, operator, isNumberSensitive)) {
            matchedPositions[writeIndex++] = position;
        }
    }
    matchedPositions.length = writeIndex;
}

function reduceMatchingPositions(
    formulaName: IfsFunctionName,
    targetRange: ArrayValueObject | undefined,
    matchedPositions: number[],
    columnCount: number
): BaseValueObject | undefined {
    if (formulaName === FUNCTION_NAMES_STATISTICAL.COUNTIFS) {
        return NumberValueObject.create(matchedPositions.length);
    }

    const pickedValues = matchedPositions.map((position) => {
        const row = Math.floor(position / columnCount);
        const column = position % columnCount;
        return targetRange!.get(row, column) ?? NullValueObject.create();
    });
    const picked = ArrayValueObject.create({
        calculateValueList: [pickedValues],
        rowCount: 1,
        columnCount: pickedValues.length,
        unitId: '',
        sheetId: '',
        row: -1,
        column: -1,
    });

    if (formulaName === FUNCTION_NAMES_MATH.SUMIFS) {
        return picked.sum();
    }
    if (formulaName === FUNCTION_NAMES_STATISTICAL.AVERAGEIFS) {
        return picked.sum().divided(picked.count());
    }
    if (formulaName === FUNCTION_NAMES_STATISTICAL.MAXIFS) {
        return picked.getColumnCount() === 0 ? NumberValueObject.create(0) : picked.max();
    }
    return picked.getColumnCount() === 0 ? NumberValueObject.create(0) : picked.min();
}

function isCriteriaMatch(
    rangeValueObject: Nullable<BaseValueObject>,
    criteriaObject: BaseValueObject,
    operator: compareToken,
    isNumberSensitive: boolean
): boolean {
    if (!rangeValueObject) {
        return false;
    }

    let result = rangeValueObject.compare(criteriaObject, operator);
    if (isNumberSensitive) {
        result = filterSameValueObject(result, rangeValueObject, criteriaObject, operator);
    }

    return result.isBoolean() && result.getValue() === true;
}

/**
 * Two ArrayValueObject of the same type can be compared
 */
export function filterSameValueObjectResult(array: ArrayValueObject, range: ArrayValueObject, criteria: BaseValueObject): ArrayValueObject {
    const [operator, criteriaObject] = criteria.isString()
        ? findCompareToken(`${criteria.getValue()}`)
        : [compareToken.EQUALS, criteria];

    return array.mapValue((valueObject, r, c) => filterSameValueObject(valueObject, range.get(r, c), criteriaObject, operator));
}

function filterSameValueObject(
    valueObject: BaseValueObject,
    rangeValueObject: Nullable<BaseValueObject>,
    criteriaObject: BaseValueObject,
    operator: compareToken
): BaseValueObject {
    const stringResult = filterStringCriteria(valueObject, rangeValueObject, criteriaObject, operator);
    if (stringResult) {
        return stringResult;
    }

    const convertedResult = filterConvertedNumber(rangeValueObject, criteriaObject, operator);
    if (convertedResult) {
        return convertedResult;
    }

    if (rangeValueObject && isSameValueObjectType(rangeValueObject, criteriaObject)) {
        return valueObject;
    }

    if (rangeValueObject?.isError() && criteriaObject.isError() && rangeValueObject.getValue() === criteriaObject.getValue()) {
        return BooleanValueObject.create(true);
    }

    return filterCrossTypeEquality(rangeValueObject, criteriaObject, operator);
}

function filterStringCriteria(
    valueObject: BaseValueObject,
    rangeValueObject: Nullable<BaseValueObject>,
    criteriaObject: BaseValueObject,
    operator: compareToken
): BaseValueObject | undefined {
    if (!criteriaObject.isString()) {
        return undefined;
    }

    const criteriaValue = `${criteriaObject.getValue()}`;
    const blankResult = filterBlankStringCriteria(rangeValueObject, criteriaValue, operator);
    if (blankResult) {
        return blankResult;
    }
    if (isWildcard(criteriaValue) && rangeValueObject?.isString() && rangeValueObject.getValue() === '') {
        return valueObject;
    }

    return filterLowerStringCriteria(rangeValueObject, criteriaValue, operator);
}

function filterBlankStringCriteria(
    rangeValueObject: Nullable<BaseValueObject>,
    criteriaValue: string,
    operator: compareToken
): BaseValueObject | undefined {
    if (criteriaValue !== '') {
        return undefined;
    }

    const isOrderedComparison = operator === compareToken.LESS_THAN ||
        operator === compareToken.LESS_THAN_OR_EQUAL ||
        operator === compareToken.GREATER_THAN ||
        operator === compareToken.GREATER_THAN_OR_EQUAL;
    if (isOrderedComparison) {
        return BooleanValueObject.create(false);
    }
    if (operator === compareToken.NOT_EQUAL && rangeValueObject?.isString() && rangeValueObject.getValue() === '') {
        return BooleanValueObject.create(true);
    }

    return undefined;
}

function filterLowerStringCriteria(
    rangeValueObject: Nullable<BaseValueObject>,
    criteriaValue: string,
    operator: compareToken
): BaseValueObject | undefined {
    const isLowerComparison = operator === compareToken.LESS_THAN || operator === compareToken.LESS_THAN_OR_EQUAL;
    if (criteriaValue === '' || !isLowerComparison) {
        return undefined;
    }
    if (rangeValueObject?.isString() && rangeValueObject.getValue() === '') {
        return BooleanValueObject.create(true);
    }
    if (rangeValueObject == null || rangeValueObject.isNull()) {
        return BooleanValueObject.create(false);
    }
    if (rangeValueObject.isString() && isSameLowerBoundBucket(rangeValueObject.getValue() as string, criteriaValue)) {
        return BooleanValueObject.create(false);
    }

    return undefined;
}

function filterConvertedNumber(
    rangeValueObject: Nullable<BaseValueObject>,
    criteriaObject: BaseValueObject,
    operator: compareToken
): BaseValueObject | undefined {
    if (rangeValueObject?.isNumber() && criteriaObject.isString()) {
        const criteriaNumber = criteriaObject.convertToNumberObjectValue();
        if (criteriaNumber.isNumber()) {
            return rangeValueObject.compare(criteriaNumber, operator);
        }
    }

    if (criteriaObject.isNumber() && criteriaObject.isDateFormat() && rangeValueObject?.isString()) {
        const rangeNumber = rangeValueObject.convertToNumberObjectValue();
        if (rangeNumber.isNumber()) {
            return rangeNumber.compare(criteriaObject, operator);
        }
    }

    return undefined;
}

function filterCrossTypeEquality(
    rangeValueObject: Nullable<BaseValueObject>,
    criteriaObject: BaseValueObject,
    operator: compareToken
): BaseValueObject {
    /**
     * If the operator is '=' or '<>', we can compare string numbers against numeric criteria directly in COUNTIF, COUNTIFS, SUMIF, SUMIFS, etc.
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
    if (operator !== compareToken.EQUALS && operator !== compareToken.NOT_EQUAL) {
        return BooleanValueObject.create(false);
    }

    if (criteriaObject.isNumber() && rangeValueObject?.isString()) {
        const rangeNumber = rangeValueObject.convertToNumberObjectValue();
        if (rangeNumber.isNumber()) {
            return rangeNumber.compare(criteriaObject, operator);
        }
    }

    return BooleanValueObject.create(operator === compareToken.NOT_EQUAL);
}

function isSameLowerBoundBucket(rangeValue: string, criteriaValue: string): boolean {
    const criteriaMatch = criteriaValue.match(/^(\d+)\|/);
    const rangeMatch = rangeValue.match(/^(\d+)-/);
    return criteriaMatch != null && rangeMatch != null && criteriaMatch[1] === rangeMatch[1];
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
