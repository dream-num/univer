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

import { Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DocMentionService } from '../doc-mention.service';

function createService(): DocMentionService {
    const injector = new Injector();
    injector.add([DocMentionService]);
    return injector.get(DocMentionService);
}

describe('DocMentionService', () => {
    it('publishes the mention currently being edited and clears it when editing ends', () => {
        const service = createService();
        const values: unknown[] = [];
        const sub = service.editing$.subscribe((value) => values.push(value));

        service.startEditing({ unitId: 'doc-1', index: 8 });
        expect(service.editing).toEqual({ unitId: 'doc-1', index: 8 });

        service.endEditing();
        expect(service.editing).toBeUndefined();
        expect(values).toEqual([undefined, { unitId: 'doc-1', index: 8 }, undefined]);

        sub.unsubscribe();
    });
});
