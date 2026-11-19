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
import type { IDocStyles, IDocumentData, IDocumentStyle, IParagraph } from '../../../types/interfaces/i-document-data';
import { BooleanNumber } from '../../../types/enum/text-style';
import { DocStyleType, DocumentFlavor } from '../../../types/interfaces/i-document-data';
import { resolveDocumentParagraphStyle, resolveDocumentParagraphWordWrap } from '../paragraph-style';

describe('resolveDocumentParagraphStyle pagination', () => {
    const traditionalDocumentStyle: IDocumentStyle = {
        documentFlavor: DocumentFlavor.TRADITIONAL,
    };

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
