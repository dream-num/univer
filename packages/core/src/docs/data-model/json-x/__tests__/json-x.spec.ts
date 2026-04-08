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

import type { IDocumentData } from '../../../../types/interfaces';
import { describe, expect, it } from 'vitest';
import { TextX } from '../../text-x/text-x';
import { JSONX } from '../json-x';

function createDoc(id = 'doc-json-x'): IDocumentData {
    return {
        id,
        body: {
            dataStream: 'Hello\r\n',
            paragraphs: [{ startIndex: 5 }],
        },
        documentStyle: {
            pageSize: { width: 100, height: 100 },
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
        },
    };
}

describe('Basic use of json-x', () => {
    describe('Static methods', () => {
        it('Should return true when the action is null', () => {
            expect(JSONX.isNoop(null)).toBe(true);
        });

        it('should apply insert, replace and remove operations to document snapshots', () => {
            const jsonX = JSONX.getInstance();
            const doc = createDoc();
            const inserted = JSONX.apply(doc, jsonX.insertOp(['settings'], { zoomRatio: 2 })) as unknown as IDocumentData;
            const replaced = JSONX.apply(inserted, jsonX.replaceOp(['id'], 'doc-json-x', 'doc-json-x-2')) as unknown as IDocumentData;
            const removed = JSONX.apply(replaced, jsonX.removeOp(['settings'], { zoomRatio: 2 })) as unknown as IDocumentData;

            expect(inserted.settings).toEqual({ zoomRatio: 2 });
            expect(replaced.id).toBe('doc-json-x-2');
            expect(removed.settings).toBeUndefined();
        });

        it('should compose rich-text edits and transform positions through text-x subtype operations', () => {
            const jsonX = JSONX.getInstance();
            const first = new TextX().retain(5).insert(1, { dataStream: '!' }).serialize();
            const second = new TextX().retain(6).insert(1, { dataStream: '?' }).serialize();
            const firstEdit = jsonX.editOp(first);
            const secondEdit = jsonX.editOp(second);
            const composed = JSONX.compose(firstEdit, secondEdit);
            const transformed = JSONX.transform(firstEdit, secondEdit, 'left');
            const doc = createDoc();
            const edited = JSONX.apply(doc, composed) as unknown as IDocumentData;
            const inverted = JSONX.invertWithDoc(firstEdit, doc);
            const restored = JSONX.apply(JSONX.apply(createDoc(), firstEdit) as unknown as IDocumentData, inverted) as unknown as IDocumentData;

            expect(JSONX.transformPosition(firstEdit, 5, 'right')).toBe(6);
            expect(JSONX.transformPosition(secondEdit, 6, 'left')).toBe(6);
            expect(transformed).toBeTruthy();
            expect(edited.body?.dataStream).toBe('Hello!?\r\n');
            expect(restored).toMatchObject(createDoc());
            expect(restored.body).toMatchObject({ dataStream: 'Hello\r\n', paragraphs: [{ startIndex: 5 }] });
        });
    });
});
