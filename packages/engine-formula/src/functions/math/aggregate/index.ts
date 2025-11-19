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
import type { FormulaDataModel } from '../../../models/formula-data.model';
import { ErrorType } from '../../../basics/error-type';
import { AggregateFunctionType, getAggregateResult, getArrayValuesByAggregateIgnoreOptions, getLargeResult, getPercentileExcResult, getPercentileIncResult, getQuartileExcResult, getQuartileIncResult, getSmallResult, parseAggregateDataRefs } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

const AggregateFunctionMap: Record<number, AggregateFunctionType> = {
    1: AggregateFunctionType.AVERAGE,
    2: AggregateFunctionType.COUNT,
    3: AggregateFunctionType.COUNTA,
    4: AggregateFunctionType.MAX,
    5: AggregateFunctionType.MIN,
    6: AggregateFunctionType.PRODUCT,
    7: AggregateFunctionType.STDEV_S,
    8: AggregateFunctionType.STDEV_P,
    9: AggregateFunctionType.SUM,
    10: AggregateFunctionType.VAR_S,
    11: AggregateFunctionType.VAR_P,
    12: AggregateFunctionType.MEDIAN,
    13: AggregateFunctionType.MODE_SNGL,
};

export class Aggregate extends BaseFunction {
    override minParams = 3;

    override maxParams = 255;

    override needsReferenceObject = true;

    override needsFilteredOutRows = true;

    override needsFormulaDataModel = true;

    override calculate(functionNum: FunctionVariantType, options: FunctionVariantType, ...refs: FunctionVariantType[]) {
        const { isError, multiAreaRefs, normalRefs } = parseAggregateDataRefs(refs);

        let _functionNum: BaseValueObject;

        if (functionNum.isReferenceObject()) {
            _functionNum = (functionNum as BaseReferenceObject).toArrayValueObject();
        } else {
            _functionNum = functionNum as BaseValueObject;
        }

        let _options: BaseValueObject;

        if (options.isReferenceObject()) {
            _options = (options as BaseReferenceObject).toArrayValueObject();
        } else {
            _options = options as BaseValueObject;
        }

        const maxRowLength = Math.max(
            _functionNum.isArray() ? (_functionNum as ArrayValueObject).getRowCount() : 1,
            _options.isArray() ? (_options as ArrayValueObject).getRowCount() : 1
        );
        const maxColumnLength = Math.max(
            _functionNum.isArray() ? (_functionNum as ArrayValueObject).getColumnCount() : 1,
            _options.isArray() ? (_options as ArrayValueObject).getColumnCount() : 1
        );

        const functionNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, _functionNum, ErrorValueObject.create(ErrorType.NA));
        const optionsArray = expandArrayValueObject(maxRowLength, maxColumnLength, _options, ErrorValueObject.create(ErrorType.NA));

        const resultArray = functionNumArray.mapValue((functionNumObject, rowIndex, columnIndex) => {
            if (functionNumObject.isError()) {
                return functionNumObject;
            }

            const optionsObject = optionsArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (optionsObject.isError()) {
                return optionsObject;
            }

            // AGGREGATE function does not support the multi-area reference.
            if (multiAreaRefs.length > 0) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            return this._handleSingleObject(functionNumObject, optionsObject, refs, isError, normalRefs);
        });

        if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(
        functionNum: BaseValueObject,
        options: BaseValueObject,
        refs: FunctionVariantType[],
        isError: boolean,
        normalRefs: BaseReferenceObject[]
    ): BaseValueObject {
        let _functionNum = functionNum;

        if (functionNum.isString()) {
            _functionNum = functionNum.convertToNumberObjectValue();
        }

        if (_functionNum.isError()) {
            return _functionNum;
        }

        const functionNumValue = Math.floor(+_functionNum.getValue());

        // Validate function number
        if (functionNumValue < 1 || functionNumValue > 19) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        /**
         * For function numbers 1-13, if the refs has invalid reference, return #VALUE! error.
         */
        if (functionNumValue >= 1 && functionNumValue <= 13 && isError) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        /**
         * For function numbers 14-19: LARGE, SMALL, PERCENTILE.INC, QUARTILE.INC, PERCENTILE.EXC, QUARTILE.EXC.
         * They require exactly two arguments: the data array and the k value.
         */
        if (functionNumValue >= 14 && functionNumValue <= 19 && refs.length !== 2) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let _options = options;

        if (options.isString()) {
            _options = options.convertToNumberObjectValue();
        }

        if (_options.isError()) {
            return _options;
        }

        const optionsValue = Math.floor(+_options.getValue());

        if (optionsValue < 0 || optionsValue > 7) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const aggregateOptions = this._getAggregateOptions(optionsValue);

        if (functionNumValue >= 14 && functionNumValue <= 19) {
            return this._handleLargeSmallPercentileQuartile(
                functionNumValue,
                aggregateOptions,
                refs[0],
                refs[1]
            );
        }

        return getAggregateResult({
            type: AggregateFunctionMap[functionNumValue],
            ...aggregateOptions,
            formulaDataModel: this._formulaDataModel as FormulaDataModel,
        }, normalRefs);
    }

    private _getAggregateOptions(options: number): {
        ignoreRowHidden: boolean;
        ignoreErrorValues: boolean;
        ignoreNested: boolean;
    } {
        switch (options) {
            case 1:
                return {
                    ignoreRowHidden: true,
                    ignoreErrorValues: false,
                    ignoreNested: true,
                };
            case 2:
                return {
                    ignoreRowHidden: false,
                    ignoreErrorValues: true,
                    ignoreNested: true,
                };
            case 3:
                return {
                    ignoreRowHidden: true,
                    ignoreErrorValues: true,
                    ignoreNested: true,
                };
            case 4:
                return {
                    ignoreRowHidden: false,
                    ignoreErrorValues: false,
                    ignoreNested: false,
                };
            case 5:
                return {
                    ignoreRowHidden: true,
                    ignoreErrorValues: false,
                    ignoreNested: false,
                };
            case 6:
                return {
                    ignoreRowHidden: false,
                    ignoreErrorValues: true,
                    ignoreNested: false,
                };
            case 7:
                return {
                    ignoreRowHidden: true,
                    ignoreErrorValues: true,
                    ignoreNested: false,
                };
            case 0:
            default:
                return {
                    ignoreRowHidden: false,
                    ignoreErrorValues: false,
                    ignoreNested: true,
                };
        }
    }

    private _handleLargeSmallPercentileQuartile(
        functionNum: number,
        aggregateOptions: {
            ignoreRowHidden: boolean;
            ignoreErrorValues: boolean;
            ignoreNested: boolean;
        },
        array: FunctionVariantType,
        kOrQuart: FunctionVariantType
    ): BaseValueObject {
        let _kOrQuart: BaseValueObject;

        if (kOrQuart.isReferenceObject()) {
            _kOrQuart = (kOrQuart as BaseReferenceObject).toArrayValueObject();
        } else {
            _kOrQuart = kOrQuart as BaseValueObject;
        }

        if (_kOrQuart.isError()) {
            return _kOrQuart;
        }

        if (_kOrQuart.isArray()) {
            const rowCount = (_kOrQuart as ArrayValueObject).getRowCount();
            const columnCount = (_kOrQuart as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _kOrQuart = (_kOrQuart as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        const arrayValues = getArrayValuesByAggregateIgnoreOptions(array, aggregateOptions, this._formulaDataModel as FormulaDataModel);

        if (!Array.isArray(arrayValues)) {
            return arrayValues as ErrorValueObject;
        }

        const kOrQuartValue = +_kOrQuart.getValue();

        switch (functionNum) {
            case 14: // LARGE
                return getLargeResult(arrayValues, kOrQuartValue);
            case 15: // SMALL
                return getSmallResult(arrayValues, kOrQuartValue);
            case 16: // PERCENTILE.INC
                return getPercentileIncResult(arrayValues, kOrQuartValue);
            case 17: // QUARTILE.INC
                return getQuartileIncResult(arrayValues, kOrQuartValue);
            case 18: // PERCENTILE.EXC
                return getPercentileExcResult(arrayValues, kOrQuartValue);
            case 19: // QUARTILE.EXC
                return getQuartileExcResult(arrayValues, kOrQuartValue);
            default:
                return ErrorValueObject.create(ErrorType.VALUE);
        }
    }
}
