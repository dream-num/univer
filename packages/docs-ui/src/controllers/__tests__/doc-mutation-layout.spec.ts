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

import type { IDocumentData } from '@univerjs/core';
import { CustomRangeType, JSONX, TextX } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getDocumentMutationLayoutImpact } from '../render-controllers/doc-mutation-layout';

describe('document mutation layout range index', () => {
    it.each(['first-note', 'another-note', 'edit-note'])('starts %s layout at the body reference instead of the start of the document', (operation) => {
        const note = { type: 'footnote' as const, noteId: 'note', body: { dataStream: 'Explanation\r\n' } };
        const jsonX = JSONX.getInstance();
        let actions = jsonX.insertOp(['notes'], { note });
        if (operation === 'another-note') {
            actions = jsonX.insertOp(['notes', 'note'], note);
        } else if (operation === 'edit-note') {
            actions = jsonX.editOp(new TextX().insert(1, { dataStream: 'X' }).serialize(), ['notes', 'note', 'body']);
        }
        const impact = getDocumentMutationLayoutImpact(actions, {
            body: { dataStream: '', customRanges: [{
                rangeId: 'ref',
                rangeType: CustomRangeType.FOOTNOTE,
                startIndex: 90_000,
                endIndex: 90_000,
                properties: { noteId: 'note' },
            }] },
        });
        expect(impact).toEqual({ global: false, range: { start: 90_000, end: 90_001 }, unresolvedLocal: false });
    });

    it('indexes table ranges once for a composed table mutation', () => {
        const tableCount = 1_000;
        let indexedReads = 0;
        const tables = new Proxy(Array.from({ length: tableCount }, (_, index) => ({
            tableId: `table-${index}`,
            startIndex: index * 10,
            endIndex: index * 10 + 9,
        })), {
            get(target, property, receiver) {
                if (typeof property === 'string' && /^\d+$/.test(property)) {
                    indexedReads++;
                }
                return Reflect.get(target, property, receiver);
            },
        });
        const jsonX = JSONX.getInstance();
        const actions = JSONX.compose(JSONX.compose(
            jsonX.replaceOp(['tableSource', 'table-999', 'tableColumns', 0], { width: 100 }, { width: 110 }),
            jsonX.replaceOp(['tableSource', 'table-999', 'tableColumns', 1], { width: 100 }, { width: 120 })
        ), jsonX.replaceOp(['tableSource', 'table-999', 'tableColumns', 2], { width: 100 }, { width: 130 }));
        indexedReads = 0;

        const impact = getDocumentMutationLayoutImpact(actions, {
            body: { dataStream: '', tables } as unknown as NonNullable<IDocumentData['body']>,
            styles: {},
        });

        expect(impact).toEqual({
            global: false,
            range: { start: 9_990, end: 9_999 },
            unresolvedLocal: false,
        });
        expect(indexedReads).toBeLessThanOrEqual(tableCount + 1);
    });
});
