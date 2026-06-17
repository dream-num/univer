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

import { Injector, JSONX } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DocIMEInputManagerService } from '../doc-ime-input-manager.service';

function createService(): DocIMEInputManagerService {
    const injector = new Injector();
    return injector.createInstance(DocIMEInputManagerService, { unitId: 'doc-1' } as never);
}

describe('DocIMEInputManagerService', () => {
    it('composes IME undo and redo mutation params around the previous active range', () => {
        const service = createService();
        const activeRange = { startOffset: 1, endOffset: 2, collapsed: false };
        const jsonX = JSONX.getInstance();
        service.setActiveRange(activeRange as never);

        service.pushUndoRedoMutationParams(
            { unitId: 'doc-1', actions: jsonX.insertOp(['settings'], { zoomRatio: 1 }), textRanges: [] } as never,
            { unitId: 'doc-1', actions: jsonX.replaceOp(['id'], 'doc-1', 'doc-2'), textRanges: [] } as never
        );

        expect(service.fetchComposedUndoRedoMutationParams()).toMatchObject({
            previousActiveRange: activeRange,
            undoMutationParams: { unitId: 'doc-1' },
            redoMutationParams: { unitId: 'doc-1' },
        });
    });

    it('clears cached IME mutation params', () => {
        const service = createService();
        service.setUndoRedoMutationParamsCache({
            undoCache: [{ unitId: 'doc-1', actions: [], textRanges: [] } as never],
            redoCache: [{ unitId: 'doc-1', actions: [], textRanges: [] } as never],
        });

        service.clearUndoRedoMutationParamsCache();

        expect(service.getUndoRedoMutationParamsCache()).toEqual({ undoCache: [], redoCache: [] });
    });
});
