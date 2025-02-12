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
import type { BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Bahttext extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(number: BaseValueObject): BaseValueObject {
        if (number.isArray()) {
            const resultArray = (number as ArrayValueObject).mapValue((numberObject) => this._handleSingleObject(numberObject));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(number);
    }

    private _handleSingleObject(number: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(number);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numberObject] = variants as BaseValueObject[];

        const numberValue = +numberObject.getValue();

        const integerPart = Math.abs(Number.parseInt(numberValue.toString(), 10));
        const decimalPart = Number.parseFloat((Math.abs(numberValue) - integerPart).toFixed(2));

        let result = '';

        if (integerPart === 0) {
            if (decimalPart !== 0) {
                result = `${numberValue < 0 ? 'ลบ' : ''}${this._convertNumberToThaiText(decimalPart * 100)}สตางค์`;
            } else {
                result = 'ศูนย์บาทถ้วน';
            }
        } else {
            if (decimalPart === 0) {
                result = `${numberValue < 0 ? 'ลบ' : ''}${this._convertNumberToThaiText(integerPart)}บาทถ้วน`;
            } else {
                result = `${numberValue < 0 ? 'ลบ' : ''}${this._convertNumberToThaiText(integerPart)}บาท${this._convertNumberToThaiText(decimalPart * 100)}สตางค์`;
            }
        }

        return StringValueObject.create(result);
    }

    private _convertNumberToThaiText(number: number): string {
        const units = ['ล้าน', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', '']; // 10^6, 10^1, 10^2, 10^3, 10^4, 10^5, 10^0
        const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']; // 0~9
        const special = ['ลบ', 'บาท', 'ถ้วน', 'สตางค์', 'ยี่', 'เอ็ด', ',', ' ', '฿']; // minus, baht, integer, satang, two, one, comma, space, baht symbol

        const numberText = number.toString();
        const n = numberText.length;

        let result = '';

        for (let i = n; i > 0; i--) {
            const digit = Number.parseInt(numberText.charAt(n - i), 10);

            let digitText = digits[digit];
            const position = i > 1 ? (i - 1) % 6 : 6;

            if (position === 1 && digit === 2) {
                digitText = special[4];
            }

            if (digit === 1) {
                switch (position) {
                    case 0:
                    case 6:
                        result += i < n ? special[5] : digitText;
                        break;
                    case 1:
                        break;
                    default:
                        result += digitText;
                        break;
                }
            } else if (digit === 0) {
                if (position === 0) {
                    result += units[position];
                }

                continue;
            } else {
                result += digitText;
            }

            result += units[position];
        }

        return result;
    }
}
