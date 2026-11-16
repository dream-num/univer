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
import { getDateSerialNumberByObject, getTwoDateDaysByBasis } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Amordegrc extends BaseFunction {
    override minParams = 6;
    override maxParams = 7;

    override calculate(
        cost: BaseValueObject,
        datePurchased: BaseValueObject,
        firstPeriod: BaseValueObject,
        salvage: BaseValueObject,
        period: BaseValueObject,
        rate: BaseValueObject,
        basis: BaseValueObject = NumberValueObject.create(0)
    ): BaseValueObject {
        const args = [cost, datePurchased, firstPeriod, salvage, period, rate, basis] as const;
        const arrays = args.filter((item): item is ArrayValueObject => item.isArray());
        if (arrays.length === 0) {
            return this._calculateSingle(...args);
        }

        const rowCount = Math.max(...arrays.map((item) => item.getRowCount()));
        const columnCount = Math.max(...arrays.map((item) => item.getColumnCount()));
        const missing = ErrorValueObject.create(ErrorType.NA);
        const [costs, purchases, ends, salvages, periods, rates, bases] = args.map((item) => expandArrayValueObject(rowCount, columnCount, item, missing));
        const result = costs.map((item, row, column) => this._calculateSingle(
            item ?? missing,
            purchases.get(row, column) ?? missing,
            ends.get(row, column) ?? missing,
            salvages.get(row, column) ?? missing,
            periods.get(row, column) ?? missing,
            rates.get(row, column) ?? missing,
            bases.get(row, column) ?? missing
        ));
        return rowCount === 1 && columnCount === 1 ? (result as ArrayValueObject).getFirstCell() : result;
    }

    private _calculateSingle(
        cost: BaseValueObject,
        datePurchased: BaseValueObject,
        firstPeriod: BaseValueObject,
        salvage: BaseValueObject,
        period: BaseValueObject,
        rate: BaseValueObject,
        basis: BaseValueObject
    ): BaseValueObject {
        const input = checkVariantsErrorIsArrayOrBoolean(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
        if (input.isError) {
            return input.errorObject!;
        }

        const [costObject, purchaseObject, endObject, salvageObject, periodObject, rateObject, basisObject] = input.variants!;
        const dateSystem = this.getDateSystem();
        const purchase = getDateSerialNumberByObject(purchaseObject, dateSystem);
        if (typeof purchase !== 'number') {
            return purchase;
        }
        const end = getDateSerialNumberByObject(endObject, dateSystem);
        if (typeof end !== 'number') {
            return end;
        }

        const [costValue, salvageValue, periodValue, rateValue, basisValue] = [costObject, salvageObject, periodObject, rateObject, basisObject].map((value) => Number(value.getValue()));
        if ([costValue, salvageValue, periodValue, rateValue, basisValue].some((value) => !Number.isFinite(value))) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const dayBasis = Math.trunc(basisValue);
        const purchaseDay = Math.trunc(purchase);
        const endDay = Math.trunc(end);
        if (costValue <= 0 || salvageValue < 0 || salvageValue > costValue || periodValue < 0 ||
            rateValue <= 0 || rateValue >= 0.5 || purchaseDay > endDay || ![0, 1, 3, 4].includes(dayBasis)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const { days, yearDays } = getTwoDateDaysByBasis(purchaseDay, endDay, dayBasis, dateSystem);
        const fraction = purchaseDay === endDay || (periodValue > 0 && periodValue < 1) ? 1 : days / yearDays;
        return this._depreciate(costValue, salvageValue, periodValue, rateValue, fraction);
    }

    private _depreciate(cost: number, salvage: number, period: number, rate: number, fraction: number): BaseValueObject {
        const life = 1 / rate;
        const lastPeriod = Math.ceil(life) - 1;
        const targetPeriod = Math.max(1, Math.trunc(period));
        if (targetPeriod > lastPeriod || cost === salvage) {
            return NumberValueObject.create(0);
        }

        const coefficient = life <= 4 ? 1.5 : life <= 6 ? 2 : 2.5;
        const depreciationRate = rate * coefficient;
        const first = Math.min(cost - salvage, Math.round(cost * depreciationRate * fraction));
        if (period === 0) {
            return NumberValueObject.create(first);
        }

        // Excel carries the unrounded book value and splits the final balance over two periods.
        const regularPeriods = Math.min(targetPeriod - 1, lastPeriod - 2);
        const balance = (cost - first) * Math.exp(regularPeriods * Math.log1p(-depreciationRate));
        const depreciation = balance * (targetPeriod >= lastPeriod - 1 ? 0.5 : depreciationRate);
        const openingBalance = targetPeriod === lastPeriod ? balance - depreciation : balance;
        return NumberValueObject.create(openingBalance < salvage ? 0 : Math.round(depreciation));
    }
}
