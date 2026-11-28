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
import { getWorkbookLocale, LocaleType, normalizeLocaleTag } from '../locale-type';

describe('locale tags', () => {
    it('exposes standard enum values and normalizes structured tags independently of the host', () => {
        expect(LocaleType.EN_US).toBe('en-US');
        expect(LocaleType.ZH_CN).toBe('zh-CN');
        expect(normalizeLocaleTag('SR-lAtN-rs')).toBe('sr-Latn-RS');
        expect(normalizeLocaleTag('es-419')).toBe('es-419');
        expect(normalizeLocaleTag('EN-us-u-NU-latn-X-demo')).toBe('en-US-u-nu-latn-x-demo');
        expect(normalizeLocaleTag('i-KLINGON')).toBe('i-klingon');
        expect(normalizeLocaleTag('X-DEMO')).toBe('x-demo');
    });

    it.each(['en_US', 'en-x', 'de-1901-1901', 'en-a-foo-a-bar'])('rejects malformed input %s', (tag) => {
        expect(() => normalizeLocaleTag(tag)).toThrow(RangeError);
    });

    it('reads old workbook metadata and preserves the formatting fallback for unusable tags', () => {
        expect(getWorkbookLocale('zhCN')).toBe('zh-CN');
        expect(getWorkbookLocale('sr-Latn-RS')).toBe('sr-Latn-RS');
        expect(getWorkbookLocale('invalid-locale')).toBeUndefined();
        expect(getWorkbookLocale(undefined)).toBeUndefined();
    });
});
