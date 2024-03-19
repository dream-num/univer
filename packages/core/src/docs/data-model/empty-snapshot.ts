/**
 * Copyright 2023-present DreamNum Inc.
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

import { Tools } from '../../shared/tools';
import { LocaleType } from '../../types/enum/locale-type';
import type { IDocumentData } from '../../types/interfaces';

export function getEmptySnapshot(
    unitID = Tools.generateRandomId(6),
    locale = LocaleType.EN_US,
    title = ''
): IDocumentData {
    const EMPTY_DOCUMENT_DATA: IDocumentData = {
        id: unitID,
        locale,
        title, // title should get from request.
        body: {
            dataStream: '\r\n',
            textRuns: [],
            paragraphs: [
                {
                    startIndex: 0,
                    paragraphStyle: {
                        spaceAbove: 5,
                        lineSpacing: 1,
                        spaceBelow: 0,
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
            marginTop: 50,
            marginBottom: 50,
            marginRight: 40,
            marginLeft: 40,
            renderConfig: {
                vertexAngle: 0,
                centerAngle: 0,
            },
        },
        settings: {},

    };

    return EMPTY_DOCUMENT_DATA;
}
