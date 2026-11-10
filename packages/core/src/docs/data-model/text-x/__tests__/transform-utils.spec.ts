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
import type { IDocumentBody, IParagraph } from '../../../../types/interfaces/i-document-data';
import type { IRetainAction } from '../action-types';
import { UpdateDocsAttributeType } from '../../../../shared/command-enum';
import { Tools } from '../../../../shared/tools';
import { PresetListType } from '../../preset-list-type';
import { TextXActionType } from '../action-types';
import { updateAttribute } from '../apply-utils/update-apply';
import { transformBody } from '../transform-utils';

function createBody(): IDocumentBody {
    return { dataStream: 'Heading\rBody\r\n', paragraphs: [{
        startIndex: 7,
        paragraphId: 'heading',
        styleId: 'inherited-heading',
        sourceBullet: { listId: 'imported', listType: PresetListType.ORDER_LIST, nestingLevel: 0 },
        directBullet: null,
    }, { startIndex: 12, paragraphId: 'body' }] };
}

function createAction(paragraph: IParagraph, coverType: UpdateDocsAttributeType): IRetainAction {
    return { t: TextXActionType.RETAIN, len: 1, coverType, body: { dataStream: '', paragraphs: [paragraph] } };
}

function apply(body: IDocumentBody, action: Pick<IRetainAction, 'body' | 'coverType'>): void {
    updateAttribute(body, Tools.deepClone(action.body!), 1, 7, action.coverType ?? UpdateDocsAttributeType.COVER);
}

describe('paragraph metadata transforms', () => {
    it.each([true, false])('preserves inherited heading and imported numbering when a fold races with full formatting (priority: %s)', (priority) => {
        const initial = createBody();
        const folded = Tools.deepClone(initial);
        const formatted = Tools.deepClone(initial);
        const fold = createAction({ startIndex: 0, paragraphId: 'heading', headingCollapsed: true }, UpdateDocsAttributeType.COVER);
        const format = createAction({
            ...Tools.deepClone(initial.paragraphs![0]),
            startIndex: 0,
            paragraphStyle: { spaceAbove: { v: 12 } },
        }, UpdateDocsAttributeType.REPLACE);

        apply(folded, fold);
        apply(formatted, format);
        apply(folded, transformBody(fold, format, priority));
        apply(formatted, transformBody(format, fold, !priority));

        expect(folded).toEqual(formatted);
        expect(folded.paragraphs![0]).toEqual({
            ...initial.paragraphs![0],
            paragraphStyle: { spaceAbove: { v: 12 } },
            headingCollapsed: true,
        });
        expect(folded.paragraphs![1]).toEqual(initial.paragraphs![1]);
        expect(folded.dataStream).toBe(initial.dataStream);
    });

    it.each([true, false])('keeps the winning replacement metadata and its explicit numbering reset (priority: %s)', (priority) => {
        const initial = createBody();
        const first = Tools.deepClone(initial);
        const second = Tools.deepClone(initial);
        const replacement = createAction({
            startIndex: 0,
            paragraphId: 'heading',
            styleId: 'replacement-style',
            sourceBullet: null,
            directBullet: { listId: 'direct', listType: PresetListType.BULLET_LIST, nestingLevel: 1 },
            headingCollapsed: true,
        }, UpdateDocsAttributeType.REPLACE);
        const clear = createAction({ startIndex: 0, paragraphId: 'heading' }, UpdateDocsAttributeType.REPLACE);

        apply(first, replacement);
        apply(second, clear);
        apply(first, transformBody(replacement, clear, priority));
        apply(second, transformBody(clear, replacement, !priority));

        expect(first).toEqual(second);
        expect(first.paragraphs![0]).toEqual(priority
            ? { ...replacement.body!.paragraphs![0], startIndex: 7 }
            : { startIndex: 7, paragraphId: 'heading' });
    });
});
