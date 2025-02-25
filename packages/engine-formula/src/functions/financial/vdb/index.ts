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
import { ErrorType } from '../../../basics/error-type';
import { calculateDDB } from '../../../basics/financial';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { getCurrencyFormat } from '../../../engine/utils/numfmt-kit';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
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
        let _factor = factor ?? NumberValueObject.create(2);

        if (_factor.isNull()) {
            _factor = NumberValueObject.create(2);
        }

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
            const noSwitchObject = noSwitchArray.get(rowIndex, columnIndex) as BaseValueObject;

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

    private _getResult(cost: number, salvage: number, life: number, startPeriod: number, endPeriod: number, factor: number, noSwitch: number): number {
        const start = Math.floor(startPeriod);
        const end = Math.ceil(endPeriod);

        let result = 0;

        if (cost < salvage) {
            if (startPeriod >= 1 || noSwitch) {
                return result;
            }

            const tempMinus = Math.abs(cost - salvage);
            result = tempMinus * (endPeriod - startPeriod) > tempMinus ? tempMinus : tempMinus * (endPeriod - startPeriod);

            return -result;
        }

        if (noSwitch) {
            for (let i = start + 1; i <= end; i++) {
                let ddb = calculateDDB(cost, salvage, life, i, factor);

                if (i === start + 1) {
                    ddb *= (Math.min(endPeriod, start + 1) - startPeriod);
                } else if (i === end) {
                    ddb *= (endPeriod + 1 - end);
                }

                result += ddb;
            }
        } else {
            const _cost = cost - this._getVdb(cost, salvage, life, life, startPeriod, factor);
            result = this._getVdb(_cost, salvage, life, life - startPeriod, endPeriod - startPeriod, factor);
        }

        return result;
    }

    private _getVdb(cost: number, salvage: number, life: number, startPeriod: number, endPeriod: number, factor: number): number {
        const end = Math.ceil(endPeriod);

        let result = 0;
        let rest = cost - salvage;
        let sln = 0;
        let temp = 0;
        let flag = false;

        for (let i = 1; i <= end; i++) {
            if (!flag) {
                const ddb = calculateDDB(cost, salvage, life, i, factor);
                sln = rest / (startPeriod - (i - 1));

                if (sln > ddb) {
                    temp = sln;
                    flag = true;
                } else {
                    temp = ddb;
                    rest -= ddb;
                }
            } else {
                temp = sln;
            }

            if (i === end) {
                temp *= (endPeriod + 1 - end);
            }

            result += temp;
        }

        return result;
    }
}
