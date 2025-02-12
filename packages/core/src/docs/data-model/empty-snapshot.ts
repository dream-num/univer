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
import { Tools } from '../../shared/tools';
import { BooleanNumber } from '../../types/enum';
import { LocaleType } from '../../types/enum/locale-type';
import { DocumentFlavor } from '../../types/interfaces';

export function getEmptySnapshot(
    unitID = Tools.generateRandomId(6),
    locale = LocaleType.EN_US,
    title = ''
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
            paragraphs: [
                {
                    startIndex: 0,
                    paragraphStyle: {
                        spaceAbove: { v: 5 },
                        lineSpacing: 1,
                        spaceBelow: { v: 0 },
                    },
                },
            ],
            sectionBreaks: [
                {
                    startIndex: 1,
                },
            ],
        },
        documentStyle: {
            pageSize: {
                width: 595 / 0.75,
                height: 842 / 0.75,
            },
            documentFlavor: DocumentFlavor.TRADITIONAL,
            marginTop: 50,
            marginBottom: 50,
            marginRight: 50,
            marginLeft: 50,
            renderConfig: {
                zeroWidthParagraphBreak: BooleanNumber.FALSE,
                vertexAngle: 0,
                centerAngle: 0,
                background: {
                    rgb: '#ccc',
                },
            },
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

    return EMPTY_DOCUMENT_DATA;
}
