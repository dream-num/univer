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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
    addLocale,
    getLocale,
    listLocales,
    parseLocale,
    resolveLocale,
} from '../locale';

describe('numfmt locale registry', () => {
    it('parses BCP 47 tags and Excel LCIDs', () => {
        expect(parseLocale('zh-CN')).toEqual({
            lang: 'zh_CN',
            language: 'zh',
            territory: 'CN',
        });
        expect(resolveLocale(0x0409)).toBe('en_US');
        expect(resolveLocale('[$-409]')).toBeNull();
    });

    it('registers a partial locale over defaults', () => {
        const locale = addLocale({ decimal: '·', group: '~' }, 'xy');
        expect(locale.decimal).toBe('·');
        expect(locale.group).toBe('~');
        expect(getLocale('xy')).toBe(locale);
        expect(listLocales()).toContain('xy');
    });

    it('rejects malformed locale tags', () => {
        expect(() => parseLocale('not a locale!')).toThrow(SyntaxError);
    });
});
