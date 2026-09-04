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
import { JSONX } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getDocumentMutationLayoutImpact } from '../render-controllers/doc-mutation-layout';

describe('document mutation layout range index', () => {
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
