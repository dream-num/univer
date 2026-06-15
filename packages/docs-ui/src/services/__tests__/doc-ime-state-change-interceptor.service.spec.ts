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
import { IRenderManagerService } from '@univerjs/engine-render';
import { beforeEach, describe, expect, it } from 'vitest';
import { DocIMEInputManagerService } from '../doc-ime-input-manager.service';
import { DocIMEStateChangeInterceptorService } from '../doc-ime-state-change-interceptor.service';

describe('DocIMEStateChangeInterceptorService', () => {
    let service: DocIMEStateChangeInterceptorService;

    beforeEach(() => {
        const imeInputManagerService = {
            fetchComposedUndoRedoMutationParams: () => ({
                undoMutationParams: { actions: [{ p: ['body'], od: 'old' }] },
                redoMutationParams: { actions: [{ p: ['body'], oi: 'new' }] },
                previousActiveRange: { startOffset: 1, endOffset: 2 },
            }),
        };
        const injector = new Injector();
        injector.add([IRenderManagerService, { useValue: { getRenderUnitById: () => ({ with: (token: unknown) => token === DocIMEInputManagerService ? imeInputManagerService : null }) } as unknown as IRenderManagerService }]);
        injector.add([DocIMEStateChangeInterceptorService]);
        service = injector.get(DocIMEStateChangeInterceptorService);
    });

    it('replaces composition history with the composed IME undo and redo actions', () => {
        expect(service.transformChangeStateInfo({
            unitId: 'doc-1',
            isCompositionEnd: true,
            isSync: false,
            redoState: { actions: [] },
            undoState: { actions: [], textRanges: [] },
        } as never)).toMatchObject({
            redoState: { actions: [{ p: ['body'], oi: 'new' }] },
            undoState: {
                actions: [{ p: ['body'], od: 'old' }],
                textRanges: [{ startOffset: 1, endOffset: 2 }],
            },
        });
    });
});
