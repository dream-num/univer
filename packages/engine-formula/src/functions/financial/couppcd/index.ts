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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { DateSystem, EXCEL_1904_OFFSET } from '@univerjs/core';
import { calculateCouppcd } from '../../../basics/financial';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { CouponFunction } from '../coupon-function';

export class Couppcd extends CouponFunction {
    protected override calculateCoupon(settlement: number, maturity: number, frequency: number, _basis: number, textDates: boolean): BaseValueObject {
        let result = calculateCouppcd(settlement, maturity, frequency, this.getDateSystem());

        // special handle for excel
        if (this.getDateSystem() === DateSystem.Date1900 && result < 0) {
            result = 0;
        }

        // Excel's 1904 COUPPCD text path keeps the legacy 1900 serial offset.
        if (
            this.getDateSystem() === DateSystem.Date1904 &&
            textDates
        ) {
            result -= EXCEL_1904_OFFSET;
        }

        return NumberValueObject.create(result);
    }
}
