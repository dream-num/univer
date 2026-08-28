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

import { DateSystem } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { NumberValueObject, StringValueObject } from '../primitive-object';

describe('StringValueObject', () => {
    it('binds the date system in place for scalar values', () => {
        const value = NumberValueObject.create(1);

        expect(value.withDateSystem(DateSystem.Date1904)).toBe(value);
        expect(value.getDateSystem()).toBe(DateSystem.Date1904);
    });

    it('uses the date system bound to the value for numeric conversion', () => {
        const date1900Value = StringValueObject.create('1904-1-1').withDateSystem(DateSystem.Date1900);
        const date1904Value = StringValueObject.create('1904-1-1').withDateSystem(DateSystem.Date1904);

        expect(date1900Value.convertToNumberObjectValue().getValue()).toBe(1462);
        expect(date1904Value.convertToNumberObjectValue().getValue()).toBe(0);
        expect(date1900Value.convertToNumberObjectValue().getValue()).toBe(1462);
    });

    it('does not reuse a hyperlink object as a plain string', () => {
        const hyperlink = StringValueObject.create('https://example.com/context-cache', {
            isHyperlink: true,
            hyperlinkUrl: 'https://example.com/context-cache',
        });
        const plainText = StringValueObject.create('https://example.com/context-cache');

        expect(hyperlink.isHyperlink()).toBe(true);
        expect(plainText.isHyperlink()).toBe(false);
    });

    it('does not share mutable metadata between plain strings', () => {
        const first = StringValueObject.create('plain-string-cache-isolation').withCustomData({ source: 'first' });
        const second = StringValueObject.create('plain-string-cache-isolation');

        expect(second).not.toBe(first);
        expect(second.getCustomData()).toBeUndefined();
    });
});
