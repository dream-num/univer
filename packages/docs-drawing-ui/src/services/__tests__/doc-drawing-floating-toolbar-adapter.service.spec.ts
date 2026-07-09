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
import { DocDrawingFloatingToolbarAdapterService } from '../doc-drawing-floating-toolbar-adapter.service';

describe('DocDrawingFloatingToolbarAdapterService', () => {
    it('returns the first matching adapter items sorted by index', () => {
        const service = new DocDrawingFloatingToolbarAdapterService();
        service.registerAdapter({
            getItems: () => null,
        });
        service.registerAdapter({
            getItems: () => [
                {
                    label: 'delete',
                    index: 2,
                    commandId: 'delete-command',
                    disable: false,
                },
                {
                    label: 'edit',
                    index: 1,
                    commandId: 'edit-command',
                    disable: false,
                },
            ],
        });

        expect(service.getItems({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawing: { drawingId: 'drawing-1' } as never,
        })?.map((item) => item.commandId)).toEqual(['edit-command', 'delete-command']);
    });

    it('unregisters disposed adapters', () => {
        const service = new DocDrawingFloatingToolbarAdapterService();
        const disposable = service.registerAdapter({
            getItems: () => [{
                label: 'edit',
                index: 0,
                commandId: 'edit-command',
                disable: false,
            }],
        });

        disposable.dispose();

        expect(service.getItems({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawing: { drawingId: 'drawing-1' } as never,
        })).toBeNull();
    });
});
