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

import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { getDateSerialNumberByObject } from '../../basics/date';
import { ErrorType } from '../../basics/error-type';
import { expandArrayValueObject } from '../../engine/utils/array-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';

export abstract class CouponFunction extends BaseFunction {
    override minParams = 3;

    override maxParams = 4;

    override calculate(settlement: BaseValueObject, maturity: BaseValueObject, frequency: BaseValueObject, basis?: BaseValueObject): BaseValueObject {
        const args = [settlement, maturity, frequency, basis ?? NumberValueObject.create(0)] as const;
        const arrays = args.filter((item): item is ArrayValueObject => item.isArray());
        const rows = Math.max(1, ...arrays.map((item) => item.getRowCount()));
        const columns = Math.max(1, ...arrays.map((item) => item.getColumnCount()));
        if (rows === 1 && columns === 1) {
            return this._calculateSingle(...args);
        }

        const missing = ErrorValueObject.create(ErrorType.NA);
        const expanded = args.map((item) => expandArrayValueObject(rows, columns, item, missing));
        return expanded[0].map((_, row, column) => {
            const [settlementCell, maturityCell, frequencyCell, basisCell] = expanded.map((item) => item.get(row, column) ?? missing);
            return this._calculateSingle(settlementCell, maturityCell, frequencyCell, basisCell);
        });
    }

    private _calculateSingle(settlement: BaseValueObject, maturity: BaseValueObject, frequency: BaseValueObject, basis: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(settlement, maturity, frequency, basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [settlementObject, maturityObject, frequencyObject, basisObject] = variants as BaseValueObject[];
        const settlementDate = getDateSerialNumberByObject(settlementObject, this.getDateSystem());
        if (typeof settlementDate !== 'number') {
            return settlementDate;
        }

        const maturityDate = getDateSerialNumberByObject(maturityObject, this.getDateSystem());
        if (typeof maturityDate !== 'number') {
            return maturityDate;
        }

        const settlementSerial = Math.floor(settlementDate);
        const maturitySerial = Math.floor(maturityDate);
        const frequencyValue = Math.floor(+frequencyObject.getValue());
        const basisValue = Math.floor(+basisObject.getValue());

        if (Number.isNaN(frequencyValue) || Number.isNaN(basisValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (
            ![1, 2, 4].includes(frequencyValue) ||
            basisValue < 0 ||
            basisValue > 4 ||
            settlementSerial >= maturitySerial
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return this.calculateCoupon(settlementSerial, maturitySerial, frequencyValue, basisValue, settlementObject.isString() && maturityObject.isString());
    }

    protected abstract calculateCoupon(settlement: number, maturity: number, frequency: number, basis: number, textDates: boolean): BaseValueObject;
}
