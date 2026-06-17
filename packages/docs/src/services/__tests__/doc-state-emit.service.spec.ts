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
import { DocStateEmitService } from '../doc-state-emit.service';

function createService(): DocStateEmitService {
    const injector = new Injector();
    injector.add([DocStateEmitService]);
    return injector.get(DocStateEmitService);
}

describe('DocStateEmitService', () => {
    it('publishes document change payloads to collaboration/history consumers', () => {
        const service = createService();
        const emitted: unknown[] = [];
        const sub = service.docStateChangeParams$.subscribe((value) => emitted.push(value));
        const change = {
            commandId: 'doc.command',
            unitId: 'doc-1',
            trigger: 'keyboard',
            redoState: { actions: [], textRanges: null },
            undoState: { actions: [], textRanges: null },
            isSync: true,
        };

        service.emitStateChangeInfo(change);

        expect(emitted).toEqual([null, change]);
        sub.unsubscribe();
    });
});
