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

import type { DateSystem, ICellData, Nullable } from '@univerjs/core';
import { CellValueType } from '@univerjs/core';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import { ERROR_TYPE_SET, ErrorType } from '../../basics/error-type';
import { compareToken } from '../../basics/token';
import { CellReferenceObject } from '../reference-object/cell-reference-object';
import { ColumnReferenceObject } from '../reference-object/column-reference-object';
import { RowReferenceObject } from '../reference-object/row-reference-object';
import { ArrayValueObject } from '../value-object/array-value-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../value-object/primitive-object';
import { isWildcard, normalizeTextForComparison } from './compare';
import { plus, stripErrorMargin } from './math-kit';
import {
    booleanObjectIntersection,
    createCriteriaValueObject,
    findCompareToken,
    valueObjectCompare,
} from './object-compare';

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
        // Error-looking text must remain distinct from actual errors when read back.
        if (vo.isString()) {
            return {
                v,
                t: ERROR_TYPE_SET.has(v as ErrorType) ? CellValueType.FORCE_STRING : CellValueType.STRING,
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

type EqualityIndexKey = string | number | symbol;
type EqualityPosition = [number, number];
type EqualityIndex = Map<EqualityIndexKey, EqualityPosition[]>;

interface IParsedCriteriaCondition {
    criteriaValueObject: BaseValueObject;
    operator: compareToken;
    criteriaObject: BaseValueObject;
    isBlankStringCriteria: boolean;
    isWildcardCriteria: boolean;
}

interface IArraySnapshot {
    value: ArrayValueObject;
    version: number;
    dateSystem: DateSystem;
}

interface ICachedPairedResult {
    formulaName: string;
    isNumberSensitive: boolean;
    maxRowLength: number;
    maxColumnLength: number;
    targetSnapshot: IArraySnapshot | null;
    rangeSnapshots: IArraySnapshot[];
    criteriaSnapshots: Array<IArraySnapshot | string>;
    results: BaseValueObject[][];
}

const NULL_EQUALITY_KEY = Symbol('NULL_EQUALITY');
const EMPTY_STRING_EQUALITY_KEY = Symbol('EMPTY_STRING_EQUALITY');
const TRUE_EQUALITY_KEY = Symbol('TRUE_EQUALITY');
const FALSE_EQUALITY_KEY = Symbol('FALSE_EQUALITY');
const MAX_PAIRED_RESULT_CACHE_ENTRIES = 16;

const equalityIndexCache = new WeakMap<ArrayValueObject, {
    version: number;
    dateSystem: DateSystem;
    index: EqualityIndex;
}>();

const pairedResultCache = new WeakMap<ArrayValueObject, ICachedPairedResult[]>();

function captureArraySnapshot(value: ArrayValueObject): IArraySnapshot {
    return {
        value,
        version: value.getCacheVersion(),
        dateSystem: value.getDateSystem(),
    };
}

function matchesArraySnapshot(snapshot: IArraySnapshot, value: ArrayValueObject): boolean {
    return snapshot.value === value &&
        snapshot.version === value.getCacheVersion() &&
        snapshot.dateSystem === value.getDateSystem();
}

function getEqualityValueKeys(value: BaseValueObject): EqualityIndexKey[] {
    if (value.isNull()) {
        return [NULL_EQUALITY_KEY];
    }

    if (value.isBoolean()) {
        return [value.getValue() ? TRUE_EQUALITY_KEY : FALSE_EQUALITY_KEY];
    }

    const keys: EqualityIndexKey[] = [];
    if (value.isString()) {
        const raw = String(value.getValue());
        if (raw === '') {
            return [EMPTY_STRING_EQUALITY_KEY];
        }
        keys.push(normalizeTextForComparison(raw));
    } else if (!value.isNumber()) {
        return keys;
    }

    const number = value.isNumber() ? value : createCriteriaValueObject(String(value.getValue()), value.getDateSystem());
    if (number.isNumber() && Number.isFinite(Number(number.getValue()))) {
        keys.push(stripErrorMargin(Number(number.getValue())));
    }
    return keys;
}

function buildEqualityIndex(range: ArrayValueObject): EqualityIndex {
    const index: EqualityIndex = new Map();
    range.iterator((value, row, column) => {
        if (!value) {
            return;
        }
        const position: EqualityPosition = [row, column];
        for (const key of getEqualityValueKeys(value)) {
            let matches = index.get(key);
            if (!matches) {
                matches = [];
                index.set(key, matches);
            }
            matches.push(position);
        }
    });
    return index;
}

function getOrBuildEqualityIndex(range: ArrayValueObject): EqualityIndex {
    const version = range.getCacheVersion();
    const dateSystem = range.getDateSystem();
    const cached = equalityIndexCache.get(range);
    if (cached && cached.version === version && cached.dateSystem === dateSystem) {
        return cached.index;
    }

    const index = buildEqualityIndex(range);
    equalityIndexCache.set(range, { version, dateSystem, index });
    return index;
}

function getIndexedPositions(
    index: EqualityIndex,
    keys: EqualityIndexKey[],
    range: ArrayValueObject
): EqualityPosition[] | undefined {
    const buckets = keys.map((key) => index.get(key) ?? []);
    const candidateCount = buckets.reduce((count, bucket) => count + bucket.length, 0);
    // ponytail: conservatively bound candidate copies; refine overlapping buckets only if profiling warrants it.
    if (candidateCount >= range.getRowCount() * range.getColumnCount() / 2) {
        return undefined;
    }
    if (buckets.length === 1) {
        return buckets[0];
    }
    return Array.from(new Set(buckets.flat())).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

function getExactCriteriaKeys(criteria: Nullable<BaseValueObject>): EqualityIndexKey[] | undefined {
    if (!criteria) {
        return undefined;
    }
    if (criteria.isNull()) {
        return [NULL_EQUALITY_KEY];
    }
    if (criteria.isBoolean()) {
        return [criteria.getValue() ? TRUE_EQUALITY_KEY : FALSE_EQUALITY_KEY];
    }
    if (!criteria.isString() && !criteria.isNumber()) {
        return undefined;
    }

    const [operator, value] = criteria.isString()
        ? findCompareToken(String(criteria.getValue()), criteria.getDateSystem())
        : [compareToken.EQUALS, criteria];
    if (operator !== compareToken.EQUALS || value.isDateFormat()) {
        return undefined;
    }
    if (value.isNull()) {
        return [NULL_EQUALITY_KEY];
    }
    if (value.isBoolean()) {
        return [value.getValue() ? TRUE_EQUALITY_KEY : FALSE_EQUALITY_KEY];
    }

    // Wildcard patterns retain the full comparison path; blank text matches both blanks and "".
    if (value.isString()) {
        const text = String(value.getValue());
        if (text === '') {
            return [NULL_EQUALITY_KEY, EMPTY_STRING_EQUALITY_KEY];
        }
        if (isWildcard(text)) {
            return undefined;
        }
    }

    const keys = getEqualityValueKeys(value);
    return keys.length > 0 ? keys : undefined;
}

function getSingleCriteriaCacheKey(value: Nullable<BaseValueObject>): string | undefined {
    if (!value) {
        return 'u';
    }
    if (value.isNull()) {
        return 'n';
    }
    if (value.isBoolean()) {
        return value.getValue() ? 'b:1' : 'b:0';
    }
    if (value.isError()) {
        return `e:${value.getValue()}`;
    }
    if (value.isNumber()) {
        const number = Number(value.getValue());
        const normalized = number === 0 ? 0 : number;
        return `d:${normalized}:${value.isDateFormat() ? `1:${value.getDateSystem()}` : '0'}`;
    }
    if (value.isString()) {
        return `s:${value.getDateSystem()}:${value.isDateFormat() ? '1' : '0'}:${value.getValue()}`;
    }
    return undefined;
}

function getCriteriaCacheKey(criteria: Array<Nullable<BaseValueObject>>): string | undefined {
    if (criteria.length === 0) {
        return undefined;
    }
    if (criteria.length === 1) {
        return getSingleCriteriaCacheKey(criteria[0]);
    }
    const keys: string[] = [];
    for (const value of criteria) {
        const key = getSingleCriteriaCacheKey(value);
        if (key === undefined) {
            return undefined;
        }
        keys.push(key);
    }
    return JSON.stringify(keys);
}

interface IRangeCriteriaSource {
    range: ArrayValueObject;
    criteria: BaseValueObject;
    isArray: boolean;
    rowCount: number;
    columnCount: number;
    constantCriteria: BaseValueObject | undefined;
    constantCondition: IParsedCriteriaCondition | undefined;
}

const NA_ERROR_OBJECT = ErrorValueObject.create(ErrorType.NA);

function getCriteriaValueAt(source: IRangeCriteriaSource, rowIndex: number, columnIndex: number): Nullable<BaseValueObject> {
    if (source.constantCriteria !== undefined) {
        return source.constantCriteria;
    }

    const { criteria, rowCount, columnCount } = source;
    const criteriaArray = criteria as ArrayValueObject;
    if (rowCount === 1 && columnCount === 1) {
        return criteriaArray.get(0, 0);
    }
    if (rowCount === 1 && columnIndex < columnCount) {
        return criteriaArray.get(0, columnIndex);
    }
    if (columnCount === 1 && rowIndex < rowCount) {
        return criteriaArray.get(rowIndex, 0);
    }
    if (rowIndex >= rowCount || columnIndex >= columnCount) {
        return NA_ERROR_OBJECT;
    }
    return criteriaArray.get(rowIndex, columnIndex);
}

function getCriteriaPositions(
    pairs: IRangeCriteriaSource[],
    indexes: Map<ArrayValueObject, EqualityIndex>,
    row: number,
    column: number
): EqualityPosition[] | undefined {
    for (const pair of pairs) {
        const keys = getExactCriteriaKeys(getCriteriaValueAt(pair, row, column));
        if (!keys) {
            continue;
        }
        let index = indexes.get(pair.range);
        if (!index) {
            index = getOrBuildEqualityIndex(pair.range);
            indexes.set(pair.range, index);
        }
        const positions = getIndexedPositions(index, keys, pair.range);
        // ponytail: stop at the first selective index; compare all criteria on its candidates.
        if (positions !== undefined) {
            return positions;
        }
    }
}

function parseCriteriaCondition(criteriaValueObject: BaseValueObject): IParsedCriteriaCondition {
    const [operator, criteriaObject] = criteriaValueObject.isString()
        ? findCompareToken(`${criteriaValueObject.getValue()}`, criteriaValueObject.getDateSystem())
        : [compareToken.EQUALS, criteriaValueObject];

    return {
        criteriaValueObject,
        operator,
        criteriaObject,
        isBlankStringCriteria: criteriaObject.isString() && criteriaObject.getValue() === '',
        isWildcardCriteria: criteriaObject.isString() && isWildcard(`${criteriaObject.getValue()}`),
    };
}

function matchesSingleCellCondition(
    rangeValueObject: Nullable<BaseValueObject>,
    condition: IParsedCriteriaCondition,
    isNumberSensitive: boolean
): boolean {
    if (!rangeValueObject) {
        return false;
    }

    let compareCell: BaseValueObject;
    if (rangeValueObject.isError()) {
        compareCell = rangeValueObject;
    } else if (condition.criteriaObject.isError()) {
        compareCell = condition.criteriaObject;
    } else {
        compareCell = rangeValueObject.compare(condition.criteriaObject, condition.operator);
    }

    const finalCell = isNumberSensitive
        ? filterSameValueObjectCell(
            compareCell,
            rangeValueObject,
            condition.criteriaObject,
            condition.operator,
            condition.isBlankStringCriteria,
            condition.isWildcardCriteria
        )
        : compareCell;

    return finalCell.isBoolean() && finalCell.getValue() === true;
}

function matchesAllConditionsAtPosition(
    conditions: Array<{ range: ArrayValueObject; condition: IParsedCriteriaCondition | undefined }>,
    row: number,
    column: number,
    isNumberSensitive: boolean
): boolean {
    for (const { range, condition } of conditions) {
        if (!condition) {
            continue;
        }
        if (!matchesSingleCellCondition(range.get(row, column), condition, isNumberSensitive)) {
            return false;
        }
    }
    return true;
}

interface ICandidateAggregateState {
    matchedCount: number;
    numericCount: number;
    numericSum: number;
    sumAccumulator: BaseValueObject | undefined;
    bestNumericValue: number;
    bestObject: BaseValueObject | undefined;
}

function formatAggregateError(formulaName: string, error: BaseValueObject, numericCount: number): BaseValueObject {
    return formulaName === 'AVERAGEIFS'
        ? error.divided(NumberValueObject.create(numericCount))
        : error;
}

function accumulateSumValue(
    formulaName: string,
    targetValue: BaseValueObject,
    state: ICandidateAggregateState
): BaseValueObject | undefined {
    state.numericCount++;
    const val = +targetValue.getValue();
    if (state.sumAccumulator === undefined && Number.isFinite(state.numericSum) && Number.isFinite(val)) {
        state.numericSum = plus(state.numericSum, val);
        if (!Number.isFinite(state.numericSum)) {
            return formatAggregateError(formulaName, ErrorValueObject.create(ErrorType.NUM), state.numericCount);
        }
        return undefined;
    }

    state.sumAccumulator ??= NumberValueObject.create(state.numericSum);
    state.sumAccumulator = state.sumAccumulator.plus(targetValue);
    if (state.sumAccumulator.isError()) {
        return formatAggregateError(formulaName, state.sumAccumulator, state.numericCount);
    }
    return undefined;
}

function updateExtremeValue(
    formulaName: string,
    targetValue: BaseValueObject,
    state: ICandidateAggregateState
): void {
    const val = Number(targetValue.getValue());
    if (formulaName === 'MAXIFS') {
        if (state.bestNumericValue < val) {
            state.bestNumericValue = val;
            state.bestObject = targetValue;
        }
        return;
    }

    if (Number.isFinite(val)) {
        if (state.bestNumericValue > val) {
            state.bestNumericValue = val;
            state.bestObject = targetValue;
        }
        return;
    }

    const cmp = (state.bestObject ?? NumberValueObject.create(state.bestNumericValue)).isGreaterThan(targetValue);
    if (cmp.isBoolean() && cmp.getValue()) {
        state.bestNumericValue = val;
        state.bestObject = targetValue;
    }
}

function finalizeCandidateAggregate(formulaName: string, state: ICandidateAggregateState): BaseValueObject | undefined {
    switch (formulaName) {
        case 'SUMIFS':
            return state.sumAccumulator ?? NumberValueObject.create(state.numericSum);
        case 'AVERAGEIFS':
            return state.numericCount === 0
                ? ErrorValueObject.create(ErrorType.DIV_BY_ZERO)
                : (state.sumAccumulator ?? NumberValueObject.create(state.numericSum)).divided(NumberValueObject.create(state.numericCount));
        case 'MAXIFS':
            return state.matchedCount === 0 ? NumberValueObject.create(0) : (state.bestObject ?? NumberValueObject.create(Number.NEGATIVE_INFINITY));
        case 'MINIFS':
            return state.matchedCount === 0 ? NumberValueObject.create(0) : (state.bestObject ?? NumberValueObject.create(Number.POSITIVE_INFINITY));
    }
}

function evaluateIndexedCandidates(
    formulaName: string,
    conditions: Array<{ range: ArrayValueObject; condition: IParsedCriteriaCondition | undefined }>,
    positions: EqualityPosition[],
    targetRange: ArrayValueObject | undefined,
    isNumberSensitive: boolean
): BaseValueObject | undefined {
    if (formulaName === 'COUNTIFS') {
        let matchedCount = 0;
        for (const [row, column] of positions) {
            if (matchesAllConditionsAtPosition(conditions, row, column, isNumberSensitive)) {
                matchedCount++;
            }
        }
        return NumberValueObject.create(matchedCount);
    }

    if (!targetRange) {
        return undefined;
    }

    const state: ICandidateAggregateState = {
        matchedCount: 0,
        numericCount: 0,
        numericSum: 0,
        sumAccumulator: undefined,
        bestNumericValue: formulaName === 'MAXIFS' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
        bestObject: undefined,
    };

    for (const [row, column] of positions) {
        if (!matchesAllConditionsAtPosition(conditions, row, column, isNumberSensitive)) {
            continue;
        }

        state.matchedCount++;
        const targetValue = targetRange.get(row, column);
        if (targetValue == null || targetValue.isString() || targetValue.isBoolean() || targetValue.isNull()) {
            continue;
        }
        if (targetValue.isError()) {
            return formatAggregateError(formulaName, targetValue, state.numericCount);
        }

        if (formulaName === 'SUMIFS' || formulaName === 'AVERAGEIFS') {
            const error = accumulateSumValue(formulaName, targetValue, state);
            if (error) {
                return error;
            }
        } else {
            updateExtremeValue(formulaName, targetValue, state);
        }
    }

    return finalizeCandidateAggregate(formulaName, state);
}

function matchesCachedEntryPairs(entry: ICachedPairedResult, variants: BaseValueObject[]): boolean {
    if (entry.rangeSnapshots.length * 2 !== variants.length) {
        return false;
    }

    for (let i = 0; i < entry.rangeSnapshots.length; i++) {
        if (!matchesArraySnapshot(entry.rangeSnapshots[i], variants[i * 2] as ArrayValueObject)) {
            return false;
        }
        const criteria = variants[i * 2 + 1];
        const snapshot = entry.criteriaSnapshots[i];
        if (criteria.isArray()) {
            if (typeof snapshot === 'string' || !matchesArraySnapshot(snapshot, criteria as ArrayValueObject)) {
                return false;
            }
        } else if (typeof snapshot !== 'string' || snapshot !== getSingleCriteriaCacheKey(criteria)) {
            return false;
        }
    }
    return true;
}

function matchesCachedEntry(
    entry: ICachedPairedResult,
    variants: BaseValueObject[],
    formulaName: string,
    maxRowLength: number,
    maxColumnLength: number,
    isNumberSensitive: boolean,
    targetRange?: ArrayValueObject
): boolean {
    if (
        entry.formulaName !== formulaName ||
        entry.isNumberSensitive !== isNumberSensitive ||
        entry.maxRowLength !== maxRowLength ||
        entry.maxColumnLength !== maxColumnLength
    ) {
        return false;
    }
    if (targetRange) {
        if (!entry.targetSnapshot || !matchesArraySnapshot(entry.targetSnapshot, targetRange)) {
            return false;
        }
    } else if (entry.targetSnapshot !== null) {
        return false;
    }
    return matchesCachedEntryPairs(entry, variants);
}

function getCachedPairedResult(
    variants: BaseValueObject[],
    formulaName: string,
    maxRowLength: number,
    maxColumnLength: number,
    isNumberSensitive: boolean,
    targetRange?: ArrayValueObject
): BaseValueObject[][] | undefined {
    const anchor = targetRange ?? (variants[0] as ArrayValueObject);
    const entries = pairedResultCache.get(anchor);
    if (!entries) {
        return undefined;
    }

    for (const entry of entries) {
        if (matchesCachedEntry(entry, variants, formulaName, maxRowLength, maxColumnLength, isNumberSensitive, targetRange)) {
            return entry.results.map((row) => row.slice());
        }
    }

    return undefined;
}

function setCachedPairedResult(
    variants: BaseValueObject[],
    formulaName: string,
    maxRowLength: number,
    maxColumnLength: number,
    isNumberSensitive: boolean,
    results: BaseValueObject[][],
    targetRange?: ArrayValueObject
): void {
    const rangeSnapshots: IArraySnapshot[] = [];
    const criteriaSnapshots: Array<IArraySnapshot | string> = [];
    for (let i = 0; i < variants.length; i += 2) {
        rangeSnapshots.push(captureArraySnapshot(variants[i] as ArrayValueObject));
        const criteria = variants[i + 1];
        if (criteria.isArray()) {
            criteriaSnapshots.push(captureArraySnapshot(criteria as ArrayValueObject));
        } else {
            const scalarKey = getSingleCriteriaCacheKey(criteria);
            if (scalarKey === undefined) {
                return;
            }
            criteriaSnapshots.push(scalarKey);
        }
    }

    const anchor = targetRange ?? (variants[0] as ArrayValueObject);
    let entries = pairedResultCache.get(anchor);
    if (!entries) {
        entries = [];
        pairedResultCache.set(anchor, entries);
    }
    if (entries.length >= MAX_PAIRED_RESULT_CACHE_ENTRIES) {
        entries.shift();
    }
    entries.push({
        formulaName,
        isNumberSensitive,
        maxRowLength,
        maxColumnLength,
        targetSnapshot: targetRange ? captureArraySnapshot(targetRange) : null,
        rangeSnapshots,
        criteriaSnapshots,
        results: results.map((row) => row.slice()),
    });
}

function getConditionalAggregateResult(
    formulaName: string,
    comparison: ArrayValueObject,
    targetRange?: ArrayValueObject
): BaseValueObject | undefined {
    if (formulaName === 'COUNTIFS') {
        let count = 0;
        comparison.iterator((value) => {
            if (value?.isBoolean() && value.getValue() === true) {
                count++;
            }
        });
        return NumberValueObject.create(count);
    }

    const picked = targetRange?.pick(comparison);
    switch (formulaName) {
        case 'SUMIFS':
            return picked!.sum();
        case 'AVERAGEIFS':
            return picked!.sum().divided(picked!.count());
        case 'MAXIFS':
            return picked!.getColumnCount() === 0 ? NumberValueObject.create(0) : picked!.max();
        case 'MINIFS':
            return picked!.getColumnCount() === 0 ? NumberValueObject.create(0) : picked!.min();
    }
}

function buildRangeCriteriaSources(variants: BaseValueObject[]): IRangeCriteriaSource[] {
    const sources: IRangeCriteriaSource[] = [];
    for (let i = 0; i < variants.length; i += 2) {
        const range = variants[i] as ArrayValueObject;
        const criteria = variants[i + 1];
        const isArray = criteria.isArray();
        const rowCount = isArray ? (criteria as ArrayValueObject).getRowCount() : 1;
        const columnCount = isArray ? (criteria as ArrayValueObject).getColumnCount() : 1;
        const isConstantScalar = !isArray || (rowCount === 1 && columnCount === 1);
        const constantCriteria = isConstantScalar
            ? (isArray ? (criteria as ArrayValueObject).get(0, 0) : criteria) ?? undefined
            : undefined;

        sources.push({
            range,
            criteria,
            isArray,
            rowCount,
            columnCount,
            constantCriteria,
            constantCondition: constantCriteria ? parseCriteriaCondition(constantCriteria) : undefined,
        });
    }
    return sources;
}

function evaluateFullScanCell(
    formulaName: string,
    sources: IRangeCriteriaSource[],
    rowIndex: number,
    columnIndex: number,
    isNumberSensitive: boolean,
    targetRange?: ArrayValueObject
): BaseValueObject | undefined {
    let finalCompareResult: ArrayValueObject | undefined;
    for (const source of sources) {
        const criteriaValueObject = getCriteriaValueAt(source, rowIndex, columnIndex);
        if (!criteriaValueObject) {
            continue;
        }

        let compareResult = valueObjectCompare(source.range, criteriaValueObject) as ArrayValueObject;
        if (isNumberSensitive) {
            compareResult = filterSameValueObjectResult(compareResult, source.range, criteriaValueObject);
        }
        finalCompareResult = finalCompareResult === undefined
            ? compareResult
            : booleanObjectIntersection(finalCompareResult, compareResult);
    }

    return getConditionalAggregateResult(formulaName, finalCompareResult as ArrayValueObject, targetRange);
}

function evaluateCriteriaCellResult(
    formulaName: string,
    sources: IRangeCriteriaSource[],
    arrayPairs: IRangeCriteriaSource[],
    equalityIndexes: Map<ArrayValueObject, EqualityIndex>,
    rowIndex: number,
    columnIndex: number,
    useEqualityIndex: boolean,
    isNumberSensitive: boolean,
    targetRange?: ArrayValueObject
): BaseValueObject | undefined {
    const positions = useEqualityIndex
        ? getCriteriaPositions(arrayPairs, equalityIndexes, rowIndex, columnIndex)
        : undefined;
    if (positions === undefined) {
        return evaluateFullScanCell(formulaName, sources, rowIndex, columnIndex, isNumberSensitive, targetRange);
    }
    if (positions.length === 0) {
        return formulaName === 'AVERAGEIFS'
            ? ErrorValueObject.create(ErrorType.DIV_BY_ZERO)
            : NumberValueObject.create(0);
    }

    const conditions = sources.map((source) => {
        if (source.constantCondition) {
            return { range: source.range, condition: source.constantCondition };
        }
        const criteriaValueObject = getCriteriaValueAt(source, rowIndex, columnIndex);
        return {
            range: source.range,
            condition: criteriaValueObject ? parseCriteriaCondition(criteriaValueObject) : undefined,
        };
    });
    return evaluateIndexedCandidates(formulaName, conditions, positions, targetRange, isNumberSensitive);
}

function resolveCellCriteriaCacheKey(
    arrayPairs: IRangeCriteriaSource[],
    rowIndex: number,
    columnIndex: number
): string | undefined {
    if (arrayPairs.length === 1) {
        return getSingleCriteriaCacheKey(getCriteriaValueAt(arrayPairs[0], rowIndex, columnIndex));
    }
    return getCriteriaCacheKey(arrayPairs.map((pair) => getCriteriaValueAt(pair, rowIndex, columnIndex)));
}

/**
 * Get the paired range and criteria result for COUNTIFS, SUMIFS, etc.
 */
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
    if (variants.length === 0) {
        return [];
    }

    const isArrayCriteria = maxRowLength * maxColumnLength > 1;
    if (isArrayCriteria) {
        const cachedPaired = getCachedPairedResult(
            variants,
            formulaName,
            maxRowLength,
            maxColumnLength,
            isNumberSensitive,
            targetRange
        );
        if (cachedPaired) {
            return cachedPaired;
        }
    }

    const rangeAndCriteriaSources = buildRangeCriteriaSources(variants);
    if (rangeAndCriteriaSources.length === 0) {
        return [];
    }

    const results: BaseValueObject[][] = [];
    const arrayPairs = rangeAndCriteriaSources.filter((source) =>
        source.isArray && source.rowCount * source.columnCount > 1
    );
    const useArrayCache = isArrayCriteria && arrayPairs.length > 0;
    const useEqualityIndex = isNumberSensitive && useArrayCache;
    const repeatedResults = new Map<string, BaseValueObject>();
    const equalityIndexes = new Map<ArrayValueObject, EqualityIndex>();

    for (let rowIndex = 0; rowIndex < maxRowLength; rowIndex++) {
        const rowResults: BaseValueObject[] = [];
        results[rowIndex] = rowResults;

        for (let columnIndex = 0; columnIndex < maxColumnLength; columnIndex++) {
            const cacheKey = useArrayCache ? resolveCellCriteriaCacheKey(arrayPairs, rowIndex, columnIndex) : undefined;
            const cached = cacheKey === undefined ? undefined : repeatedResults.get(cacheKey);
            if (cached) {
                rowResults[columnIndex] = cached;
                continue;
            }

            const result = evaluateCriteriaCellResult(
                formulaName,
                rangeAndCriteriaSources,
                arrayPairs,
                equalityIndexes,
                rowIndex,
                columnIndex,
                useEqualityIndex,
                isNumberSensitive,
                targetRange
            );
            rowResults[columnIndex] = result as BaseValueObject;
            if (cacheKey !== undefined && result) {
                repeatedResults.set(cacheKey, result);
            }
        }
    }

    if (isArrayCriteria) {
        setCachedPairedResult(variants, formulaName, maxRowLength, maxColumnLength, isNumberSensitive, results, targetRange);
    }
    return results;
}

function filterStringLessOrderCell(
    rangeValueObject: Nullable<BaseValueObject>,
    criteriaText: string,
    isEmptyStringRange: boolean
): BaseValueObject | undefined {
    if (criteriaText !== '' && isEmptyStringRange) {
        return BooleanValueObject.create(true);
    }
    if (criteriaText !== '' && (rangeValueObject == null || rangeValueObject.isNull())) {
        return BooleanValueObject.create(false);
    }
    if (rangeValueObject?.isString() && isSameLowerBoundBucket(rangeValueObject.getValue() as string, criteriaText)) {
        return BooleanValueObject.create(false);
    }
    return undefined;
}

function filterStringInequalityCell(
    valueObject: BaseValueObject,
    rangeValueObject: Nullable<BaseValueObject>,
    criteriaObject: BaseValueObject,
    operator: compareToken,
    isBlankStringCriteria: boolean,
    isWildcardCriteria: boolean
): BaseValueObject | undefined {
    const isOrderOperator = operator === compareToken.GREATER_THAN ||
        operator === compareToken.GREATER_THAN_OR_EQUAL ||
        operator === compareToken.LESS_THAN ||
        operator === compareToken.LESS_THAN_OR_EQUAL;

    if (isBlankStringCriteria && isOrderOperator) {
        return BooleanValueObject.create(false);
    }

    const isEmptyStringRange = Boolean(rangeValueObject?.isString() && rangeValueObject.getValue() === '');
    if (operator === compareToken.NOT_EQUAL && isBlankStringCriteria && isEmptyStringRange) {
        return BooleanValueObject.create(true);
    }
    if (isWildcardCriteria && isEmptyStringRange) {
        return valueObject;
    }

    const isLessOperator = operator === compareToken.LESS_THAN || operator === compareToken.LESS_THAN_OR_EQUAL;
    if (!isLessOperator || !criteriaObject.isString()) {
        return undefined;
    }

    return filterStringLessOrderCell(rangeValueObject, criteriaObject.getValue() as string, isEmptyStringRange);
}

function filterNumericCoercionCell(
    rangeValueObject: BaseValueObject,
    criteriaObject: BaseValueObject,
    operator: compareToken
): BaseValueObject | undefined {
    if (rangeValueObject.isNumber() && criteriaObject.isString()) {
        const criteriaNumber = createCriteriaValueObject(`${criteriaObject.getValue()}`, criteriaObject.getDateSystem());
        if (criteriaNumber.isNumber()) {
            return rangeValueObject.compare(criteriaNumber, operator);
        }
    }

    if (operator !== compareToken.NOT_EQUAL && criteriaObject.isNumber() && criteriaObject.isDateFormat() && rangeValueObject.isString()) {
        const rangeNumber = rangeValueObject.convertToNumberObjectValue();
        if (rangeNumber.isNumber()) {
            return rangeNumber.compare(criteriaObject, operator);
        }
    }

    return undefined;
}

function filterSameValueObjectCell(
    valueObject: BaseValueObject,
    rangeValueObject: Nullable<BaseValueObject>,
    criteriaObject: BaseValueObject,
    operator: compareToken,
    isBlankStringCriteria: boolean,
    isWildcardCriteria: boolean
): BaseValueObject {
    const stringDecision = filterStringInequalityCell(
        valueObject,
        rangeValueObject,
        criteriaObject,
        operator,
        isBlankStringCriteria,
        isWildcardCriteria
    );
    if (stringDecision !== undefined) {
        return stringDecision;
    }

    if (rangeValueObject) {
        const numericDecision = filterNumericCoercionCell(rangeValueObject, criteriaObject, operator);
        if (numericDecision !== undefined) {
            return numericDecision;
        }
        if (isSameValueObjectType(rangeValueObject, criteriaObject)) {
            return valueObject;
        }
        if (rangeValueObject.isError() && criteriaObject.isError() && rangeValueObject.getValue() === criteriaObject.getValue()) {
            return BooleanValueObject.create(true);
        }
        /**
         * Equality criteria coerce numeric text; numeric inequality criteria
         * retain the distinction between text cells and numeric cells.
         */
        if (operator === compareToken.EQUALS && criteriaObject.isNumber() && rangeValueObject.isString()) {
            const rangeNumber = createCriteriaValueObject(`${rangeValueObject.getValue()}`, rangeValueObject.getDateSystem());
            if (rangeNumber.isNumber()) {
                return rangeNumber.compare(criteriaObject, operator);
            }
        }
    }

    return BooleanValueObject.create(operator === compareToken.NOT_EQUAL);
}

/**
 * Two ArrayValueObject of the same type can be compared
 */
export function filterSameValueObjectResult(
    array: ArrayValueObject,
    range: ArrayValueObject,
    criteria: BaseValueObject
): ArrayValueObject {
    const [operator, criteriaObject] = criteria.isString()
        ? findCompareToken(`${criteria.getValue()}`, criteria.getDateSystem())
        : [compareToken.EQUALS, criteria];
    const isBlankStringCriteria = criteriaObject.isString() && criteriaObject.getValue() === '';
    const isWildcardCriteria = criteriaObject.isString() && isWildcard(`${criteriaObject.getValue()}`);

    return array.mapValue((valueObject, r, c) =>
        filterSameValueObjectCell(
            valueObject,
            range.get(r, c),
            criteriaObject,
            operator,
            isBlankStringCriteria,
            isWildcardCriteria
        )
    );
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
