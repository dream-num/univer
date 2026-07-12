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

import type { IDocumentData } from '../../types/interfaces';
import { generateRandomId } from '../../shared/random-id';
import { DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING, DEFAULT_DOCUMENT_PARAGRAPH_SPACE_ABOVE, DEFAULT_DOCUMENT_PARAGRAPH_SPACE_BELOW, MODERN_DOCUMENT_WIDTH, ModernDocumentWidthMode, PAGE_SIZE } from '../../types/const';
import { BooleanNumber } from '../../types/enum';
import { LocaleType } from '../../types/enum/locale-type';
import { DocumentFlavor, PaperType } from '../../types/interfaces';
import { createParagraphId } from '../paragraph-id';
import { createSectionId } from '../section-break-id';

export function getEmptySnapshot(
    unitID = generateRandomId(6),
    locale = LocaleType.EN_US,
    title = '',
    documentFlavor: DocumentFlavor = DocumentFlavor.MODERN
): IDocumentData {
    const EMPTY_DOCUMENT_DATA: IDocumentData = {
        id: unitID,
        locale,
        title, // title should get from request.
        tableSource: {},
        drawings: {},
        drawingsOrder: [],
        headers: {},
        footers: {},
        body: {
            dataStream: '\r\n',
            textRuns: [],
            customBlocks: [],
            tables: [],
            columnGroups: [],
            blockRanges: [],
            customRanges: [],
            customDecorations: [],
            paragraphs: [
                {
                    startIndex: 0,
                    paragraphId: createParagraphId(new Set()),
                    paragraphStyle: {
                        lineSpacing: 1,
                    },
                },
            ],
            sectionBreaks: [
                {
                    sectionId: createSectionId(new Set()),
                    startIndex: 1,
                },
            ],
        },
        documentStyle: {
            pageSize: PAGE_SIZE[PaperType.A4],
            documentFlavor,
            marginTop: 72,
            marginBottom: 72,
            marginRight: 72,
            marginLeft: 72,
            autoHyphenation: BooleanNumber.TRUE,
            doNotHyphenateCaps: BooleanNumber.FALSE,
            consecutiveHyphenLimit: 2,
            defaultHeaderId: '',
            defaultFooterId: '',
            evenPageHeaderId: '',
            evenPageFooterId: '',
            firstPageHeaderId: '',
            firstPageFooterId: '',
            evenAndOddHeaders: BooleanNumber.FALSE,
            useFirstPageHeaderFooter: BooleanNumber.FALSE,
            marginHeader: 30,
            marginFooter: 30,
        },
        settings: {},
    };

    // Set default values for modern document flavor
    if (documentFlavor === DocumentFlavor.MODERN) {
        EMPTY_DOCUMENT_DATA.body!.paragraphs![0].paragraphStyle = {};
        EMPTY_DOCUMENT_DATA.documentStyle.defaultParagraphStyle = {
            spaceAbove: { v: DEFAULT_DOCUMENT_PARAGRAPH_SPACE_ABOVE },
            lineSpacing: DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING,
            spaceBelow: { v: DEFAULT_DOCUMENT_PARAGRAPH_SPACE_BELOW },
        };
        EMPTY_DOCUMENT_DATA.documentStyle.pageSize = {
            width: MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.MEDIUM],
            height: 842 / 0.75,
        };
        EMPTY_DOCUMENT_DATA.documentStyle.marginTop = 50;
        EMPTY_DOCUMENT_DATA.documentStyle.marginBottom = 50;
        EMPTY_DOCUMENT_DATA.documentStyle.marginRight = 50;
        EMPTY_DOCUMENT_DATA.documentStyle.marginLeft = 50;
        EMPTY_DOCUMENT_DATA.documentStyle.renderConfig = {
            zeroWidthParagraphBreak: BooleanNumber.FALSE,
            vertexAngle: 0,
            centerAngle: 0,
            background: {
                rgb: '#ccc',
            },
        };
    }

    return EMPTY_DOCUMENT_DATA;
}
