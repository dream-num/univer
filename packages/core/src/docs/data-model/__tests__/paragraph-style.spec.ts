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
import type { IDocStyles, IDocumentData, IDocumentStyle, ILists, IParagraph, IParagraphStyle } from '../../../types/interfaces/i-document-data';
import { BooleanNumber } from '../../../types/enum/text-style';
import { DocStyleType, DocumentFlavor, NamedStyleType, NumberUnitType, TabStopAlignment, TabStopLeader } from '../../../types/interfaces/i-document-data';
import { resolveDocumentParagraphBullet, resolveDocumentParagraphStyle, resolveDocumentParagraphWordWrap } from '../paragraph-style';

describe('resolveDocumentParagraphStyle pagination', () => {
    it('resolves Word list indents according to inherited, direct and disabled numbering', () => {
        const styles: IDocStyles = {
            base: { name: 'Base', type: DocStyleType.paragraph, bullet: { listId: '16' } },
            child: { name: 'Child', type: DocStyleType.paragraph, basedOn: 'base', bullet: { nestingLevel: 0 }, paragraphStyle: { indentStart: { v: 102 } } },
        };
        const lists: ILists = { 13: { listType: '13', counterIds: ['16'], nestingLevel: [{ bulletAlignment: 1, glyphFormat: '%1.', startNumber: 0, paragraphProperties: { indentStart: { v: 148.8 }, hanging: { v: 24 } } }] } };
        const documentStyle = { documentFlavor: DocumentFlavor.TRADITIONAL };
        const options = { styles, lists, paragraphStyleId: 'child' };
        expect(resolveDocumentParagraphStyle(documentStyle, {}, options)).toMatchObject({ indentStart: { v: 102 }, hanging: { v: 24 } });
        expect(resolveDocumentParagraphStyle(documentStyle, {}, { ...options, bullet: { nestingLevel: 0 } }))
            .toMatchObject({ indentStart: { v: 148.8 }, hanging: { v: 24 } });
        expect(resolveDocumentParagraphStyle(documentStyle, {}, { ...options, bullet: null }))
            .toMatchObject({ indentStart: { v: 0 }, hanging: { v: 0 } });
        expect(resolveDocumentParagraphStyle(documentStyle, {}, { ...options, bullet: null }).indentFirstLine?.v ?? 0).toBe(0);
        expect(resolveDocumentParagraphStyle(documentStyle, { indentStart: { v: 42 } }, { ...options, bullet: null }).indentStart).toEqual({ v: 42 });
        expect(resolveDocumentParagraphStyle(documentStyle, { indentStart: { v: 42 } }, { ...options, bullet: { listId: '16' } }).indentStart).toEqual({ v: 42 });
        expect(styles.child.paragraphStyle?.indentStart).toEqual({ v: 102 });
    });

    it('keeps imported heading roles separate from SDK formatting presets', () => {
        const result = resolveDocumentParagraphStyle({
            documentFlavor: DocumentFlavor.TRADITIONAL,
            textStyle: { fs: 11 },
            defaultParagraphStyle: { spaceAbove: { v: 0 }, spaceBelow: { v: 0 } },
        }, { namedStyleType: NamedStyleType.HEADING_1 }, {
            paragraphStyleId: 'word-heading',
            styles: { 'word-heading': { name: 'Custom heading', type: DocStyleType.paragraph, paragraphStyle: { outlineLevel: 0 }, textStyle: { bl: BooleanNumber.TRUE } } },
        });
        expect(result.textStyle).toMatchObject({ fs: 11, bl: BooleanNumber.TRUE });
        expect(result.spaceAbove).toEqual({ v: 0 });
        expect(result.spaceBelow).toEqual({ v: 0 });
        expect(result.namedStyleType).toBe(NamedStyleType.HEADING_1);
    });

    it('retains explicit zero spacing over inherited and document spacing', () => {
        const styles: IDocStyles = {
            base: { name: 'Base', type: DocStyleType.paragraph, paragraphStyle: { spaceBelow: { v: 12 } } },
            note: { name: 'Note', type: DocStyleType.paragraph, basedOn: 'base', paragraphStyle: { spaceBelow: { v: 0 } } },
        };
        expect(resolveDocumentParagraphStyle({ documentFlavor: DocumentFlavor.TRADITIONAL, defaultParagraphStyle: { spaceBelow: { v: 16 } } }, {}, { styles, paragraphStyleId: 'note' }).spaceBelow).toEqual({ v: 0 });
    });

    it('inherits named text formatting and merges partial direct formatting', () => {
        const styles: IDocStyles = {
            base: { name: 'Base', type: DocStyleType.paragraph, textStyle: { ff: 'Calibri', fs: 10, bl: BooleanNumber.TRUE } },
            quote: { name: 'Quote', type: DocStyleType.paragraph, basedOn: 'base', textStyle: { it: BooleanNumber.TRUE }, paragraphStyle: { keepNext: BooleanNumber.FALSE } },
        };
        const documentStyle: IDocumentStyle = { documentFlavor: DocumentFlavor.TRADITIONAL, textStyle: { cl: { rgb: '#112233' } } };
        const direct = { textStyle: { bl: BooleanNumber.FALSE } };
        const before = JSON.stringify({ styles, direct });
        expect(resolveDocumentParagraphStyle(documentStyle, direct, { styles, paragraphStyleId: 'quote' })).toMatchObject({
            keepNext: BooleanNumber.FALSE,
            textStyle: { ff: 'Calibri', fs: 10, bl: BooleanNumber.FALSE, it: BooleanNumber.TRUE, cl: { rgb: '#112233' } },
        });
        expect(JSON.stringify({ styles, direct })).toBe(before);
        styles.base.textStyle!.fs = 18;
        expect(resolveDocumentParagraphStyle(documentStyle, direct, { styles, paragraphStyleId: 'quote' }).textStyle!.fs).toBe(18);
    });

    it('keeps direct numbering above named indents while retaining direct paragraph edits', () => {
        const documentStyle = { documentFlavor: DocumentFlavor.TRADITIONAL };
        const styles: IDocStyles = {
            ListParagraph: { name: 'List Paragraph', type: DocStyleType.paragraph, paragraphStyle: { indentStart: { v: 48 }, lineSpacing: 1.5 } },
        };
        const lists: ILists = {
            7: {
                listType: '7',
                counterIds: ['16'],
                nestingLevel: Array.from({ length: 4 }, (_, level) => ({ glyphFormat: `%${level + 1}.`, bulletAlignment: 0, startNumber: 0, paragraphProperties: { indentStart: { v: 24 }, hanging: { v: 24 } } })),
            },
        };
        const cases: [IParagraphStyle, number, number, number][] = [
            [{}, 24, 0, 24],
            [{ indentStart: { v: 48 } }, 48, 0, 24],
            [{ indentStart: { v: 0 }, indentFirstLine: { v: 8 } }, 0, 8, 0],
        ];
        const before = JSON.stringify({ styles, lists, cases });
        for (const [direct, left, first, hanging] of cases) {
            const result = resolveDocumentParagraphStyle(documentStyle, direct, { styles, lists, paragraphStyleId: 'ListParagraph', bullet: { listId: '16', nestingLevel: 3 } });
            expect(result.indentStart?.v).toBe(left);
            expect(result.indentFirstLine?.v ?? 0).toBe(first);
            expect(result.hanging?.v ?? 0).toBe(hanging);
            expect(result.lineSpacing).toBe(1.5);
        }
        expect(JSON.stringify({ styles, lists, cases })).toBe(before);
    });

    it('matches Word numbering cancellation for absent, first-line, left and hanging direct indents', () => {
        const documentStyle = { documentFlavor: DocumentFlavor.TRADITIONAL };
        const styles: IDocStyles = {
            Indented: { name: 'Indented', type: DocStyleType.paragraph, paragraphStyle: { indentStart: { v: 75.6 }, hanging: { v: 75.6 }, indentEnd: { v: 48 } } },
        };
        // Word COM points: (0,36,0), (0,36,56.7), (36,36,0), (0,36,-18).
        const cases: [IParagraphStyle, number, number][] = [
            [{}, 0, 0],
            [{ indentFirstLine: { v: 75.6 } }, 0, 75.6],
            [{ indentStart: { v: 48 } }, 48, 0],
            [{ hanging: { v: 24 } }, 0, -24],
        ];
        const before = JSON.stringify({ styles, cases });
        for (const [direct, left, first] of cases) {
            const options = { styles, paragraphStyleId: 'Indented', bullet: null };
            const result = resolveDocumentParagraphStyle(documentStyle, direct, options);
            expect(result.indentStart?.v).toBe(left);
            expect(result.indentEnd?.v).toBe(48);
            expect((result.indentFirstLine?.v ?? 0) - (result.hanging?.v ?? 0)).toBe(first);
            expect(resolveDocumentParagraphBullet({ styles, documentStyle }, { styleId: 'Indented', bullet: null })).toBeUndefined();
        }
        expect(JSON.stringify({ styles, cases })).toBe(before);
    });

    it('inherits Word heading spacing from its actual named owner and document defaults', () => {
        const documentStyle: IDocumentStyle = { documentFlavor: DocumentFlavor.TRADITIONAL, defaultParagraphStyleId: 'Normal', defaultParagraphStyle: { spaceAbove: { v: 4 }, spaceBelow: { v: 32 / 3 } } };
        const styles: IDocStyles = {
            Normal: { name: 'Normal', type: DocStyleType.paragraph, paragraphStyle: { spaceBelow: { v: 16 } } },
            Based: { name: 'Based Heading', type: DocStyleType.paragraph, basedOn: 'Normal', paragraphStyle: { outlineLevel: 0, spaceAbove: { v: 80 / 3 } } },
            Independent: { name: 'Independent Heading', type: DocStyleType.paragraph, paragraphStyle: { outlineLevel: 0, spaceAbove: { v: 80 / 3 } } },
            Zero: { name: 'Zero Heading', type: DocStyleType.paragraph, basedOn: 'Independent', paragraphStyle: { spaceBelow: { v: 0 } } },
        };
        // Word COM after-spacing: Normal/Based/Independent/Zero/Direct = 12/12/8/0/2pt.
        const cases: [string, IParagraphStyle, number][] = [
            ['Normal', {}, 16],
            ['Based', { namedStyleType: NamedStyleType.HEADING_1 }, 16],
            ['Independent', { namedStyleType: NamedStyleType.HEADING_1 }, 32 / 3],
            ['Zero', { namedStyleType: NamedStyleType.HEADING_1 }, 0],
            ['Independent', { namedStyleType: NamedStyleType.HEADING_1, spaceBelow: { v: 8 / 3 } }, 8 / 3],
        ];
        const before = JSON.stringify({ documentStyle, styles, cases });
        for (const [paragraphStyleId, direct, expected] of cases) {
            expect(resolveDocumentParagraphStyle(documentStyle, direct, { styles, paragraphStyleId }).spaceBelow?.v).toBeCloseTo(expected, 10);
        }
        expect(JSON.stringify({ documentStyle, styles, cases })).toBe(before);
        styles.Normal.paragraphStyle!.spaceBelow = { v: 24 };
        expect(resolveDocumentParagraphStyle(documentStyle, {}, { styles, paragraphStyleId: 'Based' }).spaceBelow?.v).toBe(24);
        expect(resolveDocumentParagraphStyle(documentStyle, {}, { styles, paragraphStyleId: 'Independent' }).spaceBelow?.v).toBeCloseTo(32 / 3, 10);
    });

    const traditionalDocumentStyle: IDocumentStyle = {
        documentFlavor: DocumentFlavor.TRADITIONAL,
    };

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('replaces inherited hanging and first-line indents independently, including zero (%s)', (documentFlavor) => {
        const documentStyle: IDocumentStyle = { documentFlavor, defaultParagraphStyle: { hanging: { v: 23.8 } } };
        const styles: IDocStyles = {
            normal: { name: 'Normal', type: DocStyleType.paragraph, paragraphStyle: { hanging: { v: 23.8 }, indentStart: { v: 76.33333333333333 } } },
            flat: { name: 'Flat', type: DocStyleType.paragraph, basedOn: 'normal', paragraphStyle: { indentFirstLine: { v: 0 } } },
            offset: { name: 'Offset', type: DocStyleType.paragraph, paragraphStyle: { indentFirstLine: { v: 12 } } },
            hanging: { name: 'Hanging', type: DocStyleType.paragraph, basedOn: 'offset', paragraphStyle: { hanging: { v: 0 } } },
        };
        const direct = { indentFirstLine: { v: 0 }, indentStart: { v: 0 } };
        const before = JSON.stringify({ documentStyle, styles, direct });
        const result = resolveDocumentParagraphStyle(documentStyle, direct, { styles, paragraphStyleId: 'normal' });
        expect(result.indentStart).toEqual({ v: 0 });
        expect(result.indentFirstLine).toEqual({ v: 0 });
        expect(result.hanging).toBeUndefined();
        expect(resolveDocumentParagraphStyle(documentStyle, direct).hanging).toBeUndefined();
        const flat = resolveDocumentParagraphStyle(documentStyle, {}, { styles, paragraphStyleId: 'flat' });
        expect(flat.hanging).toBeUndefined();
        expect(flat.indentFirstLine).toEqual({ v: 0 });
        const hanging = resolveDocumentParagraphStyle(documentStyle, {}, { styles, paragraphStyleId: 'hanging' });
        expect(hanging.indentFirstLine).toBeUndefined();
        expect(hanging.hanging).toEqual({ v: 0 });
        const simultaneous = resolveDocumentParagraphStyle(documentStyle, { indentFirstLine: { v: 7 }, hanging: { v: 3 } });
        expect(simultaneous.hanging).toEqual({ v: 3 });
        expect(simultaneous.indentFirstLine).toEqual(documentFlavor === DocumentFlavor.TRADITIONAL ? undefined : { v: 7 });
        expect(JSON.stringify({ documentStyle, styles, direct })).toBe(before);
    });

    it('keeps explicit unbound East Asian font slots in paragraph and mark styles', () => {
        const documentStyle: IDocumentStyle = {
            textStyle: { eastAsiaFontTheme: 'minor' },
        };
        const direct = {
            textStyle: { eastAsiaFontTheme: null, eastAsiaFontFamily: 'Direct Face' },
            paragraphMarkTextStyle: { eastAsiaFontTheme: null, eastAsiaFontFamily: 'Mark Face' },
        };
        const styles: IDocStyles = {
            inherited: { name: 'Inherited', type: DocStyleType.paragraph, textStyle: { eastAsiaFontTheme: 'major' } },
            explicit: { name: 'Explicit', type: DocStyleType.paragraph, basedOn: 'inherited', paragraphStyle: direct },
        };
        for (const options of [{}, { styles, paragraphStyleId: 'explicit' }]) {
            const result = resolveDocumentParagraphStyle(documentStyle, direct, options);
            expect(result.textStyle).toMatchObject({ eastAsiaFontTheme: null, eastAsiaFontFamily: 'Direct Face' });
            expect(result.paragraphMarkTextStyle).toEqual({ eastAsiaFontTheme: null, eastAsiaFontFamily: 'Mark Face' });
        }
        expect(direct.textStyle.eastAsiaFontTheme).toBeNull();
    });

    it('preserves direct false over a named style and document default', () => {
        const styles: IDocStyles = {
            base: {
                name: 'Base',
                type: DocStyleType.paragraph,
                paragraphStyle: {
                    keepNext: BooleanNumber.TRUE,
                    keepLines: BooleanNumber.TRUE,
                },
            },
            heading: {
                name: 'Heading',
                basedOn: 'base',
                type: DocStyleType.paragraph,
                paragraphStyle: {
                    pageBreakBefore: BooleanNumber.TRUE,
                },
            },
        };

        expect(resolveDocumentParagraphStyle(
            {
                ...traditionalDocumentStyle,
                defaultParagraphStyle: {
                    keepNext: BooleanNumber.TRUE,
                },
            },
            {
                keepNext: BooleanNumber.FALSE,
                widowControl: BooleanNumber.FALSE,
            },
            {
                styles,
                paragraphStyleId: 'heading',
            }
        )).toMatchObject({
            keepNext: BooleanNumber.FALSE,
            keepLines: BooleanNumber.TRUE,
            widowControl: BooleanNumber.FALSE,
            pageBreakBefore: BooleanNumber.TRUE,
        });
    });

    it('uses the traditional widow default only when no higher-precedence value exists', () => {
        expect(resolveDocumentParagraphStyle(traditionalDocumentStyle, {}))
            .toMatchObject({ widowControl: BooleanNumber.TRUE });
        expect(resolveDocumentParagraphStyle(
            {
                ...traditionalDocumentStyle,
                defaultParagraphStyle: { widowControl: BooleanNumber.FALSE },
            },
            {}
        )).toMatchObject({ widowControl: BooleanNumber.FALSE });
        expect(resolveDocumentParagraphStyle(
            { documentFlavor: DocumentFlavor.MODERN },
            {}
        ).widowControl).toBeUndefined();
    });

    it('terminates style cycles and reads current named-style values', () => {
        const styles: IDocStyles = {
            first: {
                name: 'First',
                basedOn: 'second',
                type: DocStyleType.paragraph,
                paragraphStyle: { keepNext: BooleanNumber.TRUE },
            },
            second: {
                name: 'Second',
                basedOn: 'first',
                type: DocStyleType.paragraph,
                paragraphStyle: { keepLines: BooleanNumber.TRUE },
            },
        };

        expect(resolveDocumentParagraphStyle(traditionalDocumentStyle, {}, {
            styles,
            paragraphStyleId: 'first',
        })).toMatchObject({
            keepNext: BooleanNumber.TRUE,
            keepLines: BooleanNumber.TRUE,
        });

        styles.first.paragraphStyle = { keepNext: BooleanNumber.FALSE };
        expect(resolveDocumentParagraphStyle(traditionalDocumentStyle, {}, {
            styles,
            paragraphStyleId: 'first',
        })).toMatchObject({
            keepNext: BooleanNumber.FALSE,
            keepLines: BooleanNumber.TRUE,
        });
    });
});

describe('resolveDocumentParagraphWordWrap', () => {
    it('resolves direct overrides, named style chains, document defaults and product defaults without changing source data', () => {
        const document: IDocumentData = {
            id: 'wrapping',
            documentStyle: { documentFlavor: DocumentFlavor.DRAWINGML, defaultParagraphStyle: { wordWrap: BooleanNumber.TRUE } },
            styles: {
                base: { type: DocStyleType.paragraph, name: 'Base', paragraphStyle: { wordWrap: BooleanNumber.FALSE } },
                derived: { type: DocStyleType.paragraph, name: 'Derived', basedOn: 'base' },
            },
        };
        const paragraph: IParagraph = { startIndex: 4, paragraphId: 'word-wrap', styleId: 'derived', paragraphStyle: { wordWrap: BooleanNumber.TRUE } };
        expect(resolveDocumentParagraphWordWrap(document, paragraph)).toBe(BooleanNumber.TRUE);
        delete paragraph.paragraphStyle!.wordWrap;
        expect(resolveDocumentParagraphWordWrap(document, paragraph)).toBe(BooleanNumber.FALSE);
        delete paragraph.styleId;
        expect(resolveDocumentParagraphWordWrap(document, paragraph)).toBe(BooleanNumber.TRUE);
        delete document.documentStyle.defaultParagraphStyle!.wordWrap;
        const snapshot = JSON.stringify({ document, paragraph });
        expect(resolveDocumentParagraphWordWrap(document, paragraph)).toBe(BooleanNumber.FALSE);
        expect(JSON.stringify({ document, paragraph })).toBe(snapshot);
    });
});

describe('implicit document paragraph styles', () => {
    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('keeps paragraph mark character styles live without formatting body text (%s)', (documentFlavor) => {
        const documentStyle: IDocumentStyle = { documentFlavor };
        const styles: IDocStyles = {
            Body: { name: 'Body', type: DocStyleType.paragraph, textStyle: { fs: 12, cl: { rgb: '#0000FF' } } },
            Base: { name: 'Base', type: DocStyleType.character, textStyle: { fs: 10, it: BooleanNumber.TRUE } },
            Mark: { name: 'Mark', type: DocStyleType.character, basedOn: 'Base', textStyle: { cl: { rgb: '#FF0000' } } },
        };
        const paragraph = { paragraphMarkStyleId: 'Mark', paragraphMarkTextStyle: { it: BooleanNumber.FALSE } };
        const options = { styles, paragraphStyleId: 'Body' };
        const resolved = resolveDocumentParagraphStyle(documentStyle, paragraph, options);
        expect(resolved.paragraphMarkTextStyle).toEqual({ fs: 10, it: BooleanNumber.FALSE, cl: { rgb: '#FF0000' } });
        expect(resolved.textStyle).toEqual({ fs: 12, cl: { rgb: '#0000FF' } });
        styles.Base.textStyle!.fs = 18;
        expect(resolveDocumentParagraphStyle(documentStyle, paragraph, options).paragraphMarkTextStyle?.fs).toBe(18);
        expect(resolveDocumentParagraphStyle(documentStyle, {
            ...paragraph,
            paragraphMarkTextStyle: { fs: 15 },
        }, options).paragraphMarkTextStyle?.fs).toBe(15);
        expect(paragraph).toEqual({ paragraphMarkStyleId: 'Mark', paragraphMarkTextStyle: { it: BooleanNumber.FALSE } });
        expect(styles.Mark.textStyle).toEqual({ cl: { rgb: '#FF0000' } });
    });

    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('resolves editable defaults below materialized table fonts and preserves heading presets (%s)', (documentFlavor) => {
        const documentStyle: IDocumentStyle = { documentFlavor, defaultParagraphStyleId: 'default', textStyle: { ff: 'Arial' } };
        const styles: IDocStyles = {
            default: { name: 'Document Default', type: DocStyleType.paragraph, textStyle: { ff: 'Calibri' } },
            other: { name: 'Other', type: DocStyleType.paragraph, textStyle: { ff: 'Georgia' } },
        };
        expect(resolveDocumentParagraphStyle(documentStyle, undefined, { styles }).textStyle?.ff).toBe('Calibri');
        const paragraph = { textStyle: { ff: 'Cambria' } };
        expect(resolveDocumentParagraphStyle(documentStyle, paragraph, { styles }).textStyle?.ff).toBe('Cambria');
        expect(resolveDocumentParagraphStyle(documentStyle, undefined, { styles, paragraphStyleId: 'other' }).textStyle?.ff).toBe('Georgia');
        const heading = { namedStyleType: NamedStyleType.HEADING_1 };
        expect(resolveDocumentParagraphStyle(documentStyle, heading, { styles })).toEqual(
            resolveDocumentParagraphStyle({ ...documentStyle, defaultParagraphStyleId: undefined }, heading, { styles })
        );
        styles.default.textStyle!.ff = 'Verdana';
        expect(resolveDocumentParagraphStyle(documentStyle, undefined, { styles }).textStyle?.ff).toBe('Verdana');
        expect(paragraph).toEqual({ textStyle: { ff: 'Cambria' } });
    });

    it('inherits default numbering without writing an explicit paragraph style', () => {
        const documentStyle: IDocumentStyle = { defaultParagraphStyleId: 'default' };
        const styles: IDocStyles = { default: { name: 'Default', type: DocStyleType.paragraph, bullet: { listId: 'list' } } };
        const paragraph = {};
        expect(resolveDocumentParagraphBullet({ styles, documentStyle }, paragraph)).toEqual({ listId: 'list', listType: 'list', nestingLevel: 0 });
        expect(resolveDocumentParagraphBullet({ styles, documentStyle }, { bullet: null })).toBeUndefined();
        expect(paragraph).toEqual({});
    });
});

describe('resolveDocumentParagraphBullet', () => {
    const lists: ILists = {
        alpha: { listType: 'alpha', counterIds: ['first'], nestingLevel: [] },
        beta: { listType: 'beta', counterIds: ['second'], nestingLevel: [] },
    };

    it('keeps style numbering live and merges only direct overrides', () => {
        const styles: IDocStyles = {
            base: { name: 'Base', type: DocStyleType.paragraph, bullet: { listId: 'first' } },
            child: { name: 'Child', type: DocStyleType.paragraph, basedOn: 'base', bullet: { nestingLevel: 2 } },
        };
        const paragraph = { styleId: 'child', bullet: { nestingLevel: 1 } };
        expect(resolveDocumentParagraphBullet({ styles, lists }, paragraph))
            .toEqual({ listId: 'first', listType: 'alpha', nestingLevel: 1 });
        styles.base.bullet = { listId: 'second' };
        expect(resolveDocumentParagraphBullet({ styles, lists }, paragraph))
            .toEqual({ listId: 'second', listType: 'beta', nestingLevel: 1 });
        expect(paragraph).toEqual({ styleId: 'child', bullet: { nestingLevel: 1 } });
    });

    it('honors explicit suppression and preserves complete legacy bullets', () => {
        const styles: IDocStyles = {
            base: { name: 'Base', type: DocStyleType.paragraph, bullet: { listId: 'first', nestingLevel: 2 } },
            child: { name: 'Child', type: DocStyleType.paragraph, basedOn: 'base', bullet: null },
        };
        expect(resolveDocumentParagraphBullet({ styles, lists }, { styleId: 'base', bullet: null })).toBeUndefined();
        expect(resolveDocumentParagraphBullet({ styles, lists }, { styleId: 'child' })).toBeUndefined();
        expect(resolveDocumentParagraphBullet({ styles, lists }, {
            styleId: 'base',
            bullet: { listId: 'first', listType: 'replacement', nestingLevel: 0 },
        })).toEqual({ listId: 'first', listType: 'replacement', nestingLevel: 0 });
    });

    it('terminates cyclic or missing styles and uses direct numbering when available', () => {
        const styles: IDocStyles = {
            first: { name: 'First', type: DocStyleType.paragraph, basedOn: 'second' },
            second: { name: 'Second', type: DocStyleType.paragraph, basedOn: 'first' },
        };
        expect(resolveDocumentParagraphBullet({ styles, lists }, { styleId: 'first' })).toBeUndefined();
        expect(resolveDocumentParagraphBullet({ styles, lists }, { styleId: 'missing', bullet: { listId: 'second' } }))
            .toEqual({ listId: 'second', listType: 'beta', nestingLevel: 0 });
    });

    it('retains legacy complete bullets with an empty counter id', () => {
        const bullet = { listId: '', listType: 'alpha', nestingLevel: 0 };
        expect(resolveDocumentParagraphBullet({ lists }, { bullet })).toEqual(bullet);
        expect(resolveDocumentParagraphBullet({ lists }, { bullet: { listType: 'alpha' } })).toBeUndefined();
    });
});

describe('zero character first-line indents', () => {
    it('keeps independent Word character and physical indent components through live style edits', () => {
        const styles: IDocStyles = {
            base: {
                name: 'Base',
                type: DocStyleType.paragraph,
                paragraphStyle: {
                    indentStart: { v: 2, u: NumberUnitType.CHARACTER, fallback: 40 / 3 },
                    indentFirstLine: { v: 2, u: NumberUnitType.CHARACTER, fallback: 40 / 3 },
                },
            },
            child: {
                name: 'Child',
                type: DocStyleType.paragraph,
                basedOn: 'base',
                paragraphStyle: { indentStart: { v: 40 }, hanging: { v: 80 / 3 } },
            },
        };
        const options = { styles, paragraphStyleId: 'child' };
        const documentStyle = { documentFlavor: DocumentFlavor.TRADITIONAL };
        const original = structuredClone(styles);
        const resolved = resolveDocumentParagraphStyle(documentStyle, {}, options);
        expect(resolved.indentStart).toEqual({ v: 2, u: NumberUnitType.CHARACTER, fallback: 40 });
        expect(resolved.indentFirstLine).toMatchObject({ v: 2, u: NumberUnitType.CHARACTER });
        expect(resolved.hanging).toBeUndefined();
        const reset = resolveDocumentParagraphStyle(documentStyle, {
            indentStart: { v: 0, u: NumberUnitType.CHARACTER },
            indentFirstLine: { v: 0, u: NumberUnitType.CHARACTER },
        }, options);
        expect(reset.indentStart).toEqual({ v: 0, u: NumberUnitType.CHARACTER, fallback: 40 });
        expect(reset.hanging).toEqual({ v: 80 / 3 });
        expect(styles).toEqual(original);
        styles.base.paragraphStyle!.indentStart!.v = 3;
        expect(resolveDocumentParagraphStyle(documentStyle, {}, options).indentStart?.v).toBe(3);
        expect(resolved.indentStart?.v).toBe(2);
        expect(resolveDocumentParagraphStyle({ documentFlavor: DocumentFlavor.MODERN }, {}, options).indentStart)
            .toEqual({ v: 40 });
    });

    it('resets related Word character indents while retaining their physical fallback', () => {
        const styles: IDocStyles = {
            hanging: { name: 'Hanging', type: DocStyleType.paragraph, paragraphStyle: {
                hanging: { v: 2, u: NumberUnitType.CHARACTER, fallback: 40 / 3 },
            } },
        };
        const options = { styles, paragraphStyleId: 'hanging' };
        const documentStyle = { documentFlavor: DocumentFlavor.TRADITIONAL };
        const zero = resolveDocumentParagraphStyle(documentStyle, {
            indentFirstLine: { v: 0, u: NumberUnitType.CHARACTER },
        }, options);
        expect(zero.hanging).toEqual({ v: 0, u: NumberUnitType.CHARACTER, fallback: 40 / 3 });
        const physical = resolveDocumentParagraphStyle(documentStyle, {
            indentFirstLine: { v: 0, u: NumberUnitType.CHARACTER, fallback: 16 },
        }, options);
        expect(physical.indentFirstLine).toEqual({ v: 0, u: NumberUnitType.CHARACTER, fallback: 16 });
        expect(physical.hanging?.fallback).toBeUndefined();
        expect(physical.hanging?.v ?? 0).toBe(0);
    });

    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('preserves inherited hanging for zero characters and clears it for zero points (%s)', (documentFlavor) => {
        const styles: IDocStyles = {
            base: { name: 'Base', type: DocStyleType.paragraph, paragraphStyle: { hanging: { v: 48 } } },
        };
        const options = { styles, paragraphStyleId: 'base' };
        const direct = { indentFirstLine: { v: 0, u: NumberUnitType.CHARACTER } };
        const before = structuredClone({ styles, direct });
        expect(resolveDocumentParagraphStyle({ documentFlavor }, direct, options)).toMatchObject({
            indentFirstLine: direct.indentFirstLine,
            hanging: { v: 48 },
        });
        expect(resolveDocumentParagraphStyle({ documentFlavor }, { indentFirstLine: { v: 0 } }, options).hanging)
            .toBeUndefined();
        expect(resolveDocumentParagraphStyle({ documentFlavor }, { indentFirstLine: { v: 1, u: NumberUnitType.CHARACTER } }, options).hanging)
            .toBeUndefined();
        expect({ styles, direct }).toEqual(before);
    });

    it('keeps live Word list hanging after zero character overrides a named first-line indent', () => {
        const properties = { indentStart: { v: 192 }, hanging: { v: 48 } };
        const lists: ILists = {
            10: { listType: '10', counterIds: ['14'], nestingLevel: [
                { bulletAlignment: 1, glyphFormat: '%1.', startNumber: 0, paragraphProperties: properties },
            ] },
        };
        const styles: IDocStyles = {
            indented: { name: 'Indented', type: DocStyleType.paragraph, paragraphStyle: { indentFirstLine: { v: 28 } } },
        };
        const direct = { indentFirstLine: { v: 0, u: NumberUnitType.CHARACTER } };
        const bullet = { listId: '14', nestingLevel: 0 };
        const options = { styles, lists, bullet, paragraphStyleId: 'indented' };
        const documentStyle = { documentFlavor: DocumentFlavor.TRADITIONAL };
        const before = structuredClone({ lists, styles, direct });
        const first = resolveDocumentParagraphStyle(documentStyle, direct, options);
        expect(first).toMatchObject({ indentStart: { v: 192 }, hanging: { v: 48 }, indentFirstLine: direct.indentFirstLine });
        expect({ lists, styles, direct }).toEqual(before);
        properties.hanging.v = 64;
        expect(resolveDocumentParagraphStyle(documentStyle, direct, options).hanging).toEqual({ v: 64 });
        expect(first.hanging).toEqual({ v: 48 });
    });
});

describe('Word paragraph line spacing', () => {
    it.each(['spaceAbove', 'spaceBelow'] as const)('retains Word line spacing components through physical and zero overrides (%s)', (key) => {
        const styles: IDocStyles = {
            Lines: { name: 'Lines', type: DocStyleType.paragraph, paragraphStyle: { [key]: { v: 2, u: NumberUnitType.LINE, fallback: 0 } } },
        };
        const options = { styles, paragraphStyleId: 'Lines' };
        const documentStyle = { documentFlavor: DocumentFlavor.TRADITIONAL };
        const original = structuredClone(styles);
        for (const [direct, expected] of [
            [{ v: 16 }, { v: 2, u: NumberUnitType.LINE, fallback: 16 }],
            [{ v: 0, u: NumberUnitType.LINE }, { v: 0, u: NumberUnitType.LINE, fallback: 0 }],
            [{ v: 0, u: NumberUnitType.LINE, fallback: 16 }, { v: 0, u: NumberUnitType.LINE, fallback: 16 }],
        ]) {
            const result = resolveDocumentParagraphStyle(documentStyle, { [key]: direct }, options);
            expect(result[key]).toEqual(expected);
            expect(resolveDocumentParagraphStyle({ documentFlavor: DocumentFlavor.MODERN }, { [key]: direct }, options)[key]).toEqual(direct);
        }
        expect(styles).toEqual(original);
    });
});

describe('inherited paragraph tab stops', () => {
    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('keeps distinct base, child and direct stops and resolves live style changes (%s)', (documentFlavor) => {
        const inherited = { offset: 300, alignment: TabStopAlignment.START, leader: TabStopLeader.DOT };
        const page = { offset: 420, alignment: TabStopAlignment.END };
        const styles: IDocStyles = {
            base: { name: 'Base', type: DocStyleType.paragraph, paragraphStyle: { tabStops: [inherited] } },
            child: { name: 'TOC', type: DocStyleType.paragraph, basedOn: 'base', paragraphStyle: { tabStops: [page] } },
        };
        const direct = { tabStops: [page] };
        const before = structuredClone({ styles, direct });
        const resolve = () => resolveDocumentParagraphStyle({ documentFlavor }, direct, { styles, paragraphStyleId: 'child' });
        const first = resolve();
        expect(first.tabStops).toEqual([inherited, page]);
        expect({ styles, direct }).toEqual(before);
        inherited.leader = TabStopLeader.HYPHEN;
        expect(resolve().tabStops).toEqual([inherited, page]);
        expect(first.tabStops?.[0].leader).toBe(TabStopLeader.DOT);
    });

    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('clears and replaces same-position leaders without removing other inherited stops (%s)', (documentFlavor) => {
        const styles: IDocStyles = {
            base: { name: 'Base', type: DocStyleType.paragraph, paragraphStyle: { tabStops: [
                { offset: 300, alignment: TabStopAlignment.START, leader: TabStopLeader.DOT },
            ] } },
            child: { name: 'TOC', type: DocStyleType.paragraph, basedOn: 'base', paragraphStyle: { tabStops: [
                { offset: 420, alignment: TabStopAlignment.END },
            ] } },
        };
        const before = structuredClone(styles);
        const options = { styles, paragraphStyleId: 'child' };
        const cleared = { offset: 300, alignment: TabStopAlignment.START, clear: true };
        expect(resolveDocumentParagraphStyle({ documentFlavor }, { tabStops: [cleared] }, options).tabStops).toEqual([
            cleared,
            { offset: 420, alignment: TabStopAlignment.END },
        ]);
        const replaced = { offset: 300, alignment: TabStopAlignment.START, leader: TabStopLeader.NONE };
        expect(resolveDocumentParagraphStyle({ documentFlavor }, { tabStops: [replaced] }, options).tabStops).toEqual([
            replaced,
            { offset: 420, alignment: TabStopAlignment.END },
        ]);
        expect(styles).toEqual(before);
    });

    it('retains document default stops through empty additions and can restore a cleared stop later', () => {
        const original = { offset: 48, alignment: TabStopAlignment.START, leader: TabStopLeader.DOT };
        const documentStyle: IDocumentStyle = { defaultParagraphStyle: { tabStops: [original] } };
        const styles: IDocStyles = {
            base: { name: 'Base', type: DocStyleType.paragraph, paragraphStyle: { tabStops: [{ ...original, clear: true }] } },
            child: { name: 'Child', type: DocStyleType.paragraph, basedOn: 'base', paragraphStyle: { tabStops: [] } },
        };
        const options = { styles, paragraphStyleId: 'child' };
        expect(resolveDocumentParagraphStyle(documentStyle, undefined, options).tabStops).toEqual([{ ...original, clear: true }]);
        const restored = { offset: 48, alignment: TabStopAlignment.END };
        expect(resolveDocumentParagraphStyle(documentStyle, { tabStops: [restored] }, options).tabStops).toEqual([restored]);
        expect(documentStyle.defaultParagraphStyle?.tabStops).toEqual([original]);
    });
});
