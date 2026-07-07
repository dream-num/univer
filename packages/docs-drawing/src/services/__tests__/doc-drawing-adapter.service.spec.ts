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
import { DocDrawingAdapterService } from '../doc-drawing-adapter.service';

describe('DocDrawingAdapterService', () => {
    it('collects removal mutations from registered drawing adapters in order', () => {
        const service = new DocDrawingAdapterService();
        service.registerAdapter({
            getRemoveDrawingMutationInfos: () => ({
                redoMutations: [{ id: 'redo-1', params: { value: 1 } }],
                undoMutations: [{ id: 'undo-1', params: { value: 1 } }],
            }),
        });
        service.registerAdapter({
            getRemoveDrawingMutationInfos: () => ({
                redoMutations: [{ id: 'redo-2', params: { value: 2 } }],
                undoMutations: [{ id: 'undo-2', params: { value: 2 } }],
            }),
        });

        expect(service.getRemoveDrawingMutationInfos({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawing: { drawingId: 'drawing-1' } as never,
            removeDrawings: [{ drawingId: 'drawing-1' } as never],
        })).toEqual({
            redoMutations: [
                { id: 'redo-1', params: { value: 1 } },
                { id: 'redo-2', params: { value: 2 } },
            ],
            undoMutations: [
                { id: 'undo-1', params: { value: 1 } },
                { id: 'undo-2', params: { value: 2 } },
            ],
        });
    });

    it('unregisters disposed adapters', () => {
        const service = new DocDrawingAdapterService();
        const disposable = service.registerAdapter({
            getRemoveDrawingMutationInfos: () => ({
                redoMutations: [{ id: 'redo-1', params: {} }],
                undoMutations: [{ id: 'undo-1', params: {} }],
            }),
        });

        disposable.dispose();

        expect(service.getRemoveDrawingMutationInfos({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawing: { drawingId: 'drawing-1' } as never,
            removeDrawings: [{ drawingId: 'drawing-1' } as never],
        })).toEqual({
            redoMutations: [],
            undoMutations: [],
        });
    });
});
