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
import { describe, expect, it, vi } from 'vitest';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { IFormatPainterService } from '../../../services/format-painter/format-painter.service';
import { SetActivateCellEditOperation } from '../activate-cell-edit.operation';
import { SetFormatPainterOperation } from '../set-format-painter.operation';

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
    } as any;
}

describe('sheets-ui basic operations', () => {
    it('SetFormatPainterOperation should guard empty params and update service', () => {
        const setStatus = vi.fn();
        const accessor = createAccessor([[IFormatPainterService, { setStatus }]]);

        expect(SetFormatPainterOperation.handler(accessor, undefined as any)).toBe(false);
        expect(SetFormatPainterOperation.handler(accessor, { status: 'ONCE' as any })).toBe(true);
        expect(setStatus).toHaveBeenCalledWith('ONCE');
    });

    it('SetActivateCellEditOperation should update current edit cell state', () => {
        const setEditCell = vi.fn();
        const accessor = createAccessor([[Injector, new Injector()], [IEditorBridgeService, { setEditCell }]]);

        expect(SetActivateCellEditOperation.handler(accessor, { unitId: 'u1' } as any)).toBe(true);
        expect(setEditCell).toHaveBeenCalledWith({ unitId: 'u1' });
    });
});
