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

import { describe, expect, it } from 'vitest';
import { isLegalUrl, normalizeUrl } from '../url';

describe('Test url utils', () => {
    it('should return true on legal url', () => {
        expect(isLegalUrl('https://univer.ai/')).toBeTruthy();
        expect(isLegalUrl('univer.ai')).toBeTruthy();
    });

    it('should return false on illegal url', () => {
        expect(isLegalUrl('https://univer')).toBeFalsy();
        expect(isLegalUrl('univer')).toBeFalsy();
        expect(isLegalUrl('192.168')).toBeFalsy();
        expect(isLegalUrl('咋看手机看到.是多少')).toBeFalsy();
        expect(isLegalUrl('univer.univer')).toBeFalsy();
    });

    it('should add protocol to no protocol url', () => {
        expect(normalizeUrl('univer.ai')).toEqual('https://univer.ai');
        expect(normalizeUrl('https://univer.ai')).toEqual('https://univer.ai');
        expect(normalizeUrl('zhang@univer.ai')).toEqual('mailto://zhang@univer.ai');
    });
});
