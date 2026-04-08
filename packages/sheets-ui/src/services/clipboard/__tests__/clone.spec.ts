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
import { cloneCellDataWithSpanInfo } from '../clone';

describe('cloneCellDataWithSpanInfo', () => {
    it('should keep nullish values as-is', () => {
        expect(cloneCellDataWithSpanInfo(null)).toBeNull();
        expect(cloneCellDataWithSpanInfo(undefined as any)).toBeUndefined();
    });

    it('should deep clone object fields and keep primitive fields', () => {
        const source: any = {
            p: { body: { dataStream: 'abc' } },
            s: { bg: { rgb: '#fff' } },
            v: '1',
            t: 1,
            f: '=A1',
            ref: 'A1',
            xf: '=SUM()',
            si: 'sid',
            custom: { hello: 'world' },
            rowSpan: 2,
            colSpan: 3,
            plain: 'plain-text',
        };

        const cloned = cloneCellDataWithSpanInfo(source)!;
        expect(cloned).toEqual(source);

        expect(cloned.p).not.toBe(source.p);
        expect(cloned.s).not.toBe(source.s);
        expect(cloned.custom).not.toBe(source.custom);

        (cloned.s as any).bg.rgb = '#000';
        (cloned.custom as any).hello = 'changed';

        expect(source.s.bg.rgb).toBe('#fff');
        expect(source.custom.hello).toBe('world');
    });
});
