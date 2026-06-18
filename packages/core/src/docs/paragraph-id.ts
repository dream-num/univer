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

import type { IDocumentBody, IParagraph } from '../types/interfaces/i-document-data';
import { generateRandomId } from '../shared/random-id';

export const PARAGRAPH_ID_PREFIX = 'para_';

// Reserved so callers can pass the document segment context before ids become scoped.
export interface IParagraphIdScope {
    unitId: string;
    segmentId?: string;
}

export function createParagraphId(existingIds: Set<string>): string {
    let paragraphId = `${PARAGRAPH_ID_PREFIX}${generateRandomId(12)}`;

    while (existingIds.has(paragraphId)) {
        paragraphId = `${PARAGRAPH_ID_PREFIX}${generateRandomId(12)}`;
    }

    existingIds.add(paragraphId);
    return paragraphId;
}

export function cloneBodyWithFreshParagraphIds(body: IDocumentBody, _scope: IParagraphIdScope): IDocumentBody {
    const cloned = cloneBody(body);
    const existingIds = new Set<string>();

    for (const paragraph of cloned.paragraphs ?? []) {
        paragraph.paragraphId = createParagraphId(existingIds);
    }

    return cloned;
}

export function cloneParagraphWithId(paragraph: IParagraph, existingIds: Set<string>, preserveId?: boolean): IParagraph {
    const cloned = cloneParagraph(paragraph);

    if (preserveId !== false && isValidParagraphId(cloned.paragraphId) && !existingIds.has(cloned.paragraphId)) {
        existingIds.add(cloned.paragraphId);
        return cloned;
    }

    cloned.paragraphId = createParagraphId(existingIds);
    return cloned;
}

function isValidParagraphId(value: unknown): value is string {
    return typeof value === 'string' && value.startsWith(PARAGRAPH_ID_PREFIX) && value.length > PARAGRAPH_ID_PREFIX.length;
}

function cloneBody(body: IDocumentBody): IDocumentBody {
    return JSON.parse(JSON.stringify(body)) as IDocumentBody;
}

function cloneParagraph(paragraph: IParagraph): IParagraph {
    return JSON.parse(JSON.stringify(paragraph)) as IParagraph;
}
