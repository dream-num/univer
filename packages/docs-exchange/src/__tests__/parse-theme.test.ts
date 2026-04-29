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
import { parseTheme } from '../utils/parse/parse-theme';

const NS_A = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"';

describe('parseTheme', () => {
    it('returns empty fonts map when xml is undefined', () => {
        const t = parseTheme(undefined);
        expect(t.resolve('minorHAnsi')).toBeUndefined();
    });

    it('reads minorFont latin (asciiTheme=minorHAnsi)', () => {
        const xml = `<a:theme ${NS_A}><a:themeElements>
      <a:fontScheme name="Office">
        <a:majorFont><a:latin typeface="Cambria"/><a:ea typeface=""/></a:majorFont>
        <a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/></a:minorFont>
      </a:fontScheme>
    </a:themeElements></a:theme>`;
        const t = parseTheme(xml);
        expect(t.resolve('minorHAnsi')).toBe('Calibri');
        expect(t.resolve('majorHAnsi')).toBe('Cambria');
        expect(t.resolve('minorAscii')).toBe('Calibri');
        expect(t.resolve('majorAscii')).toBe('Cambria');
    });

    it('falls back to script="Hans" when ea typeface is empty', () => {
        const xml = `<a:theme ${NS_A}><a:themeElements>
      <a:fontScheme>
        <a:minorFont>
          <a:latin typeface="Calibri"/>
          <a:ea typeface=""/>
          <a:font script="Hans" typeface="宋体"/>
        </a:minorFont>
        <a:majorFont>
          <a:latin typeface="Cambria"/>
          <a:ea typeface=""/>
          <a:font script="Hans" typeface="宋体"/>
        </a:majorFont>
      </a:fontScheme>
    </a:themeElements></a:theme>`;
        const t = parseTheme(xml);
        expect(t.resolve('minorEastAsia')).toBe('宋体');
        expect(t.resolve('majorEastAsia')).toBe('宋体');
    });

    it('uses ea typeface directly when not empty', () => {
        const xml = `<a:theme ${NS_A}><a:themeElements>
      <a:fontScheme>
        <a:minorFont>
          <a:latin typeface="Calibri"/>
          <a:ea typeface="仿宋"/>
        </a:minorFont>
      </a:fontScheme>
    </a:themeElements></a:theme>`;
        const t = parseTheme(xml);
        expect(t.resolve('minorEastAsia')).toBe('仿宋');
    });

    it('returns undefined for unknown theme refs', () => {
        const t = parseTheme(`<a:theme ${NS_A}/>`);
        expect(t.resolve('minorBidi')).toBeUndefined();
    });
});
