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

import type { ThemeFonts } from '../utils/parse/parse-theme';
import { describe, expect, it } from 'vitest';
import {
    extractRFonts,
    parseRunsFromParagraphXml,
    parseRunsFromPNode,
    resolveFontFamily,
} from '../utils/parse/parse-run';
import { xmlParser } from '../utils/parse/xml';

describe('parseRunsFromParagraphXml', () => {
    it('extracts plain text', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:t>Hello</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs).toEqual([{ text: 'Hello' }]);
    });

    it('captures bold style (w:b)', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:rPr><w:b/></w:rPr><w:t>X</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs[0].style?.bl).toBe(1);
    });

    it('maps font size (w:sz val=22 = 11pt)', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>X</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs[0].style?.fs).toBe(11);
    });

    it('maps color rgb', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:rPr><w:color w:val="FF0000"/></w:rPr><w:t>X</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs[0].style?.cl?.rgb).toBe('#FF0000');
    });

    it('handles w:tab and w:br', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:t>A</w:t><w:tab/><w:t>B</w:t><w:br/><w:t>C</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs.map((r: { text: string }) => r.text).join('')).toBe('A\tB\nC');
    });

    it('preserves multiple runs in order', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:t>A</w:t></w:r><w:r><w:rPr><w:i/></w:rPr><w:t>B</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs.length).toBe(2);
        expect(runs[1].style?.it).toBe(1);
    });

    it('preserves leading/trailing whitespace in xml:space="preserve" t', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:t xml:space="preserve"> hello </w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs[0].text).toBe(' hello ');
    });

    it('honors w:val="none" / "0" to disable toggle props', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:rPr><w:b w:val="0"/><w:u w:val="none"/></w:rPr><w:t>X</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs[0].style?.bl).toBeUndefined();
        expect(runs[0].style?.ul).toBeUndefined();
    });

    it('drops bogus empty-URL hyperlinks (missing r:id) and emits plain run', () => {
        const xml = '<w:p xmlns:w="x"><w:hyperlink><w:r><w:t>x</w:t></w:r></w:hyperlink></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs[0].hyperlink).toBeUndefined();
        expect(runs[0].text).toBe('x');
    });

    it('maps w:highlight named color → bg rgb (yellow → #FFFF00)', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:rPr><w:highlight w:val="yellow"/></w:rPr><w:t>X</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs[0].style?.bg?.rgb).toBe('#FFFF00');
    });

    it('maps w:highlight green → #00FF00', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:rPr><w:highlight w:val="green"/></w:rPr><w:t>X</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs[0].style?.bg?.rgb).toBe('#00FF00');
    });

    it('ignores w:highlight w:val="none"', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:rPr><w:highlight w:val="none"/></w:rPr><w:t>X</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs[0].style?.bg).toBeUndefined();
    });

    it('maps w:shd w:fill="FFFF00" → bg rgb #FFFF00', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:rPr><w:shd w:val="clear" w:color="auto" w:fill="FFFF00"/></w:rPr><w:t>X</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs[0].style?.bg?.rgb).toBe('#FFFF00');
    });

    it('ignores w:shd w:fill="auto"', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:rPr><w:shd w:val="clear" w:fill="auto"/></w:rPr><w:t>X</w:t></w:r></w:p>';
        const runs = parseRunsFromParagraphXml(xml);
        expect(runs[0].style?.bg).toBeUndefined();
    });
});

describe('extractRFonts', () => {
    function rPrNode(xml: string) {
        const parsed = xmlParser.parse(xml) as Array<Record<string, unknown>>;
        return parsed[0] as Record<string, unknown>;
    }

    it('reads ascii / hAnsi / eastAsia / cs', () => {
        const rPr = rPrNode(
            '<w:rPr xmlns:w="x"><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="仿宋" w:cs="Times New Roman"/></w:rPr>'
        );
        expect(extractRFonts(rPr)).toEqual({
            ascii: 'Calibri',
            hAnsi: 'Calibri',
            eastAsia: '仿宋',
            cs: 'Times New Roman',
        });
    });

    it('reads asciiTheme / hAnsiTheme / eastAsiaTheme / cstheme', () => {
        const rPr = rPrNode(
            '<w:rPr xmlns:w="x"><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:eastAsiaTheme="minorEastAsia" w:cstheme="minorBidi"/></w:rPr>'
        );
        expect(extractRFonts(rPr)).toEqual({
            asciiTheme: 'minorHAnsi',
            hAnsiTheme: 'minorHAnsi',
            eastAsiaTheme: 'minorEastAsia',
            cstheme: 'minorBidi',
        });
    });

    it('returns undefined when no rFonts present', () => {
        const rPr = rPrNode('<w:rPr xmlns:w="x"><w:b/></w:rPr>');
        expect(extractRFonts(rPr)).toBeUndefined();
    });
});

describe('resolveFontFamily', () => {
    const themeFonts: ThemeFonts = {
        resolve(ref) {
            if (ref === 'minorHAnsi') return 'Calibri';
            if (ref === 'minorEastAsia') return '等线';
            return undefined;
        },
    };

    it('CJK text picks eastAsia first', () => {
        const f = resolveFontFamily({ ascii: 'Calibri', eastAsia: '仿宋' }, '你好', themeFonts);
        expect(f).toBe('仿宋');
    });

    it('CJK text falls back to eastAsiaTheme when no direct eastAsia', () => {
        const f = resolveFontFamily({ ascii: 'Arial', eastAsiaTheme: 'minorEastAsia' }, '你好', themeFonts);
        expect(f).toBe('等线');
    });

    it('CJK text falls back to ascii when no eastAsia at all', () => {
        const f = resolveFontFamily({ ascii: 'Arial' }, '你好', themeFonts);
        expect(f).toBe('Arial');
    });

    it('Latin text picks ascii first', () => {
        const f = resolveFontFamily({ ascii: 'Calibri', eastAsia: '仿宋' }, 'hello', themeFonts);
        expect(f).toBe('Calibri');
    });

    it('Latin text resolves asciiTheme via themeFonts', () => {
        const f = resolveFontFamily({ asciiTheme: 'minorHAnsi' }, 'hello', themeFonts);
        expect(f).toBe('Calibri');
    });

    it('returns undefined when rfonts is undefined', () => {
        expect(resolveFontFamily(undefined, 'hi', themeFonts)).toBeUndefined();
    });
});

describe('parseRunsFromPNode with themeFonts (eastAsia + theme inheritance)', () => {
    const themeFonts: ThemeFonts = {
        resolve(ref) {
            if (ref === 'minorHAnsi') return 'Calibri';
            if (ref === 'minorEastAsia') return '等线';
            return undefined;
        },
    };

    function pNode(xml: string): Record<string, unknown> {
        return (xmlParser.parse(xml) as Array<Record<string, unknown>>)[0];
    }

    it('CJK run inherits eastAsia from docDefault rFonts via styles', () => {
        const node = pNode('<w:p xmlns:w="x"><w:r><w:t>你好</w:t></w:r></w:p>');
        const runs = parseRunsFromPNode(
            node,
            undefined,
            {
                docDefaults: { rFonts: { ascii: 'Calibri', eastAsiaTheme: 'minorEastAsia' } },
                paragraphStyles: new Map(),
                characterStyles: new Map(),
                resolvePStyle: () => ({}),
                resolveRStyle: () => undefined,
                resolveRFonts: () => undefined,
                tableStyles: new Map(),
                resolveTableStyle: () => ({}),
            },
            undefined,
            themeFonts,
            undefined
        );
        expect(runs[0].style?.ff).toBe('等线');
    });

    it('Latin run uses asciiTheme from docDefault when no inline rFonts', () => {
        const node = pNode('<w:p xmlns:w="x"><w:r><w:t>hello</w:t></w:r></w:p>');
        const runs = parseRunsFromPNode(
            node,
            undefined,
            {
                docDefaults: { rFonts: { asciiTheme: 'minorHAnsi' } },
                paragraphStyles: new Map(),
                characterStyles: new Map(),
                resolvePStyle: () => ({}),
                resolveRStyle: () => undefined,
                resolveRFonts: () => undefined,
                tableStyles: new Map(),
                resolveTableStyle: () => ({}),
            },
            undefined,
            themeFonts,
            undefined
        );
        expect(runs[0].style?.ff).toBe('Calibri');
    });

    it('inline w:rFonts eastAsia wins over docDefault', () => {
        const node = pNode('<w:p xmlns:w="x"><w:r><w:rPr><w:rFonts w:eastAsia="楷体"/></w:rPr><w:t>你好</w:t></w:r></w:p>');
        const runs = parseRunsFromPNode(
            node,
            undefined,
            {
                docDefaults: { rFonts: { eastAsiaTheme: 'minorEastAsia' } },
                paragraphStyles: new Map(),
                characterStyles: new Map(),
                resolvePStyle: () => ({}),
                resolveRStyle: () => undefined,
                resolveRFonts: () => undefined,
                tableStyles: new Map(),
                resolveTableStyle: () => ({}),
            },
            undefined,
            themeFonts,
            undefined
        );
        expect(runs[0].style?.ff).toBe('楷体');
    });
});
