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
import { beforeEach, describe, expect, it } from 'vitest';
import { DocContentInsertService } from '../doc-content-insert.service';

describe('DocContentInsertService', () => {
    let service: DocContentInsertService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([DocContentInsertService]);
        service = injector.get(DocContentInsertService);
    });

    it('consumes a pending insert range only for the matching document', () => {
        const range = { unitId: 'doc-1', startOffset: 2, endOffset: 5, segmentId: 'header' };

        service.setInsertRange(range);

        expect(service.consumeInsertRange('doc-2')).toBeNull();
        expect(service.consumeInsertRange('doc-1')).toEqual(range);
        expect(service.consumeInsertRange('doc-1')).toBeNull();
    });

    it('clears stale insert ranges when editing is cancelled', () => {
        service.setInsertRange({ unitId: 'doc-1', startOffset: 2, endOffset: 5 });
        service.clearInsertRange();

        expect(service.consumeInsertRange()).toBeNull();
    });
});
