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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { getCurrencyFormat } from '../../../engine/utils/numfmt-kit';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Vdb extends BaseFunction {
    override minParams = 5;

    override maxParams = 7;

    override needsLocale = true;

    override calculate(
        cost: BaseValueObject,
        salvage: BaseValueObject,
        life: BaseValueObject,
        startPeriod: BaseValueObject,
        endPeriod: BaseValueObject,
        factor?: BaseValueObject,
        noSwitch?: BaseValueObject
    ): BaseValueObject {
        const _factor = factor ?? NumberValueObject.create(2);

        let _noSwitch = noSwitch ?? BooleanValueObject.create(false);

        if (_noSwitch.isNull()) {
            _noSwitch = BooleanValueObject.create(false);
        }

        const maxRowLength = Math.max(
            cost.isArray() ? (cost as ArrayValueObject).getRowCount() : 1,
            salvage.isArray() ? (salvage as ArrayValueObject).getRowCount() : 1,
            life.isArray() ? (life as ArrayValueObject).getRowCount() : 1,
            startPeriod.isArray() ? (startPeriod as ArrayValueObject).getRowCount() : 1,
            endPeriod.isArray() ? (endPeriod as ArrayValueObject).getRowCount() : 1,
            _factor.isArray() ? (_factor as ArrayValueObject).getRowCount() : 1,
            _noSwitch.isArray() ? (_noSwitch as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            cost.isArray() ? (cost as ArrayValueObject).getColumnCount() : 1,
            salvage.isArray() ? (salvage as ArrayValueObject).getColumnCount() : 1,
            life.isArray() ? (life as ArrayValueObject).getColumnCount() : 1,
            startPeriod.isArray() ? (startPeriod as ArrayValueObject).getColumnCount() : 1,
            endPeriod.isArray() ? (endPeriod as ArrayValueObject).getColumnCount() : 1,
            _factor.isArray() ? (_factor as ArrayValueObject).getColumnCount() : 1,
            _noSwitch.isArray() ? (_noSwitch as ArrayValueObject).getColumnCount() : 1
        );

        const costArray = expandArrayValueObject(maxRowLength, maxColumnLength, cost, ErrorValueObject.create(ErrorType.NA));
        const salvageArray = expandArrayValueObject(maxRowLength, maxColumnLength, salvage, ErrorValueObject.create(ErrorType.NA));
        const lifeArray = expandArrayValueObject(maxRowLength, maxColumnLength, life, ErrorValueObject.create(ErrorType.NA));
        const startPeriodArray = expandArrayValueObject(maxRowLength, maxColumnLength, startPeriod, ErrorValueObject.create(ErrorType.NA));
        const endPeriodArray = expandArrayValueObject(maxRowLength, maxColumnLength, endPeriod, ErrorValueObject.create(ErrorType.NA));
        const factorArray = expandArrayValueObject(maxRowLength, maxColumnLength, _factor, ErrorValueObject.create(ErrorType.NA));
        const noSwitchArray = expandArrayValueObject(maxRowLength, maxColumnLength, _noSwitch, ErrorValueObject.create(ErrorType.NA));

        return this._getResultArray(
            costArray,
            salvageArray,
            lifeArray,
            startPeriodArray,
            endPeriodArray,
            factorArray,
            noSwitchArray,
            maxRowLength,
            maxColumnLength
        );
    }

    private _getResultArray(
        costArray: ArrayValueObject,
        salvageArray: ArrayValueObject,
        lifeArray: ArrayValueObject,
        startPeriodArray: ArrayValueObject,
        endPeriodArray: ArrayValueObject,
        factorArray: ArrayValueObject,
        noSwitchArray: ArrayValueObject,
        maxRowLength: number,
        maxColumnLength: number
    ): BaseValueObject {
        const resultArray = costArray.map((costObject, rowIndex, columnIndex) => {
            const salvageObject = salvageArray.get(rowIndex, columnIndex) as BaseValueObject;
            const lifeObject = lifeArray.get(rowIndex, columnIndex) as BaseValueObject;
            const startPeriodObject = startPeriodArray.get(rowIndex, columnIndex) as BaseValueObject;
            const endPeriodObject = endPeriodArray.get(rowIndex, columnIndex) as BaseValueObject;
            const factorObject = factorArray.get(rowIndex, columnIndex) as BaseValueObject;
            let noSwitchObject = noSwitchArray.get(rowIndex, columnIndex) as BaseValueObject;
            if (noSwitchObject.isString()) {
                const logical = String(noSwitchObject.getValue()).toUpperCase();
                if (logical === 'TRUE' || logical === 'FALSE') {
                    noSwitchObject = BooleanValueObject.create(logical === 'TRUE');
                }
            }

            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(costObject, salvageObject, lifeObject, startPeriodObject, endPeriodObject, factorObject, noSwitchObject);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [_costObject, _salvageObject, _lifeObject, _startPeriodObject, _endPeriodObject, _factorObject, _noSwitchObject] = variants as BaseValueObject[];

            const costValue = +_costObject.getValue();
            const salvageValue = +_salvageObject.getValue();
            const lifeValue = +_lifeObject.getValue();
            const startPeriodValue = +_startPeriodObject.getValue();
            const endPeriodValue = +_endPeriodObject.getValue();
            const factorValue = +_factorObject.getValue();
            const noSwitchValue = +_noSwitchObject.getValue();

            if (
                costValue < 0 ||
                salvageValue < 0 ||
                lifeValue < 0 ||
                startPeriodValue < 0 ||
                endPeriodValue < 0 ||
                endPeriodValue > lifeValue ||
                startPeriodValue > endPeriodValue ||
                factorValue < 0
            ) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            if (lifeValue === 0 && startPeriodValue === 0 && endPeriodValue === 0) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            const result = this._getResult(costValue, salvageValue, lifeValue, startPeriodValue, endPeriodValue, factorValue, noSwitchValue);

            if (rowIndex === 0 && columnIndex === 0) {
                return NumberValueObject.create(result, getCurrencyFormat(this.getLocale()));
            }

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _getResult(cost: number, salvage: number, life: number, start: number, end: number, factor: number, noSwitch: number): number {
        if (start === end) return 0;
        if (cost < salvage) {
            return noSwitch || start >= 1 ? 0 : (cost - salvage) * Math.min(end - start, 1);
        }
        const rate = Math.min(1, factor / life);
        if (noSwitch) {
            const balanceAt = (age: number) => {
                const whole = Math.floor(age);
                const opening = cost * (1 - rate) ** whole;
                const depreciation = Math.max(0, Math.min(opening * rate, opening - salvage));
                return Math.max(salvage, opening) - depreciation * (age - whole);
            };
            return balanceAt(start) - balanceAt(end);
        }

        const whole = Math.floor(start);
        const balance = cost - switchedDepreciation(cost, salvage, life, whole, rate);
        const partial = (start - whole) * Math.max(balance * rate, (balance - salvage) / (life - whole));
        return switchedDepreciation(balance - partial, salvage, life - whole, end - start, rate);
    }
}

function switchedDepreciation(balance: number, salvage: number, remaining: number, duration: number, rate: number): number {
    let book = balance;
    let total = 0;
    for (let age = 0; age < duration && book > salvage; age++) {
        const left = book - salvage;
        const linear = left / (remaining - age);
        const declining = Math.min(left, book * rate);
        if (linear > declining) {
            return total + linear * (duration - age);
        }
        const depreciation = declining * Math.min(duration - age, 1);
        if (book - depreciation === book) break;
        total += depreciation;
        book -= depreciation;
    }
    return total;
}
