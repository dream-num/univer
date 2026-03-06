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

import { ICommandService, IConfigService, IUniverInstanceService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import {
    SetCellEditVisibleArrowOperation,
    SetCellEditVisibleOperation,
    SetCellEditVisibleWithF2Operation,
} from '../cell-edit.operation';

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

describe('cell edit operations', () => {
    it('SetCellEditVisibleOperation guards empty params and disable-edit mode', () => {
        const changeVisible = vi.fn();
        const accessor = createAccessor([
            [IConfigService, { getConfig: vi.fn(() => ({ disableEdit: true })) }],
            [IUniverInstanceService, { getCurrentUnitForType: vi.fn(() => ({ getUnitId: () => 'u1' })) }],
            [IEditorBridgeService, { changeVisible }],
        ]);

        expect(SetCellEditVisibleOperation.handler(accessor, undefined as any)).toBe(false);
        expect(SetCellEditVisibleOperation.handler(accessor, { visible: true } as any)).toBe(false);
        expect(changeVisible).not.toHaveBeenCalled();
    });

    it('SetCellEditVisibleOperation returns false when no active workbook', () => {
        const accessor = createAccessor([
            [IConfigService, { getConfig: vi.fn(() => ({ disableEdit: false })) }],
            [IUniverInstanceService, { getCurrentUnitForType: vi.fn(() => null) }],
            [IEditorBridgeService, { changeVisible: vi.fn() }],
        ]);

        expect(SetCellEditVisibleOperation.handler(accessor, { visible: false } as any)).toBe(false);
    });

    it('SetCellEditVisibleOperation falls back to workbook unitId', () => {
        const changeVisible = vi.fn();
        const accessor = createAccessor([
            [IConfigService, { getConfig: vi.fn(() => ({ disableEdit: false })) }],
            [IUniverInstanceService, { getCurrentUnitForType: vi.fn(() => ({ getUnitId: () => 'workbook-u1' })) }],
            [IEditorBridgeService, { changeVisible }],
        ]);

        expect(SetCellEditVisibleOperation.handler(accessor, { visible: true } as any)).toBe(true);
        expect(changeVisible).toHaveBeenCalledWith({ visible: true, unitId: 'workbook-u1' });
    });

    it('SetCellEditVisibleWithF2Operation respects workbook existence and delegates command execution', () => {
        const syncExecuteCommand = vi.fn(() => true);
        const commandAccessor = createAccessor([
            [ICommandService, { syncExecuteCommand }],
            [IUniverInstanceService, { getCurrentUnitForType: vi.fn(() => ({ getUnitId: () => 'wb-u2' })) }],
        ]);

        expect(SetCellEditVisibleWithF2Operation.handler(commandAccessor, { visible: true } as any)).toBe(true);
        expect(syncExecuteCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: true,
            unitId: 'wb-u2',
        });

        const noWorkbookAccessor = createAccessor([
            [ICommandService, { syncExecuteCommand: vi.fn() }],
            [IUniverInstanceService, { getCurrentUnitForType: vi.fn(() => null) }],
        ]);
        expect(SetCellEditVisibleWithF2Operation.handler(noWorkbookAccessor, { visible: true } as any)).toBe(false);
    });

    it('SetCellEditVisibleArrowOperation is a no-op event operation', () => {
        expect(SetCellEditVisibleArrowOperation.handler({} as any, undefined as any)).toBe(true);
    });
});
