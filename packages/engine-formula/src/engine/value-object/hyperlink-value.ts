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

import type { BaseValueObject } from './base-value-object';
import { formatExcelTextNumber } from '../../functions/text/format-excel-text-number';
import { BooleanValueObject, NumberValueObject, StringValueObject } from './primitive-object';

class HyperlinkNumber extends NumberValueObject {
    constructor(value: BaseValueObject, readonly url: string) {
        super(Number(value.getValue()), value.getDateSystem());
        this.setPattern(value.getPattern());
    }

    override isHyperlink(): boolean {
        return true;
    }
}

class HyperlinkBoolean extends BooleanValueObject {
    constructor(value: boolean, readonly url: string) {
        super(value);
    }

    override isHyperlink(): boolean {
        return true;
    }
}

class HyperlinkText extends StringValueObject {
    constructor(value: string, readonly url: string) {
        super(value);
    }

    override isHyperlink(): boolean {
        return true;
    }
}

export function createTypedHyperlink(url: string, label: BaseValueObject): BaseValueObject {
    if (label.isNumber()) return new HyperlinkNumber(label, url);
    if (label.isBoolean()) return new HyperlinkBoolean(Boolean(label.getValue()), url);
    return new HyperlinkText(String(label.getValue()), url);
}

export function getTypedHyperlink(value: BaseValueObject): { url: string; label: string } | undefined {
    if (value instanceof HyperlinkNumber) {
        return { url: value.url, label: formatExcelTextNumber(value.getValue()) };
    }
    if (value instanceof HyperlinkBoolean) {
        return { url: value.url, label: value.getValue() ? 'TRUE' : 'FALSE' };
    }
    if (value instanceof HyperlinkText) {
        return { url: value.url, label: value.getValue() };
    }
}
