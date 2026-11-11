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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import { ICommandService, IConfigService, Injector, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import {
    CanvasColorService,
    DeviceInputEventType,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
} from '@univerjs/engine-render';
import { SheetInterceptorService, SheetSkeletonService } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { EditorBridgeService, IEditorBridgeService } from '../../../services/editor-bridge.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { SetActivateCellEditOperation } from '../activate-cell-edit.operation';
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
            [IUniverInstanceService, { getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => 'u1' })) }],
            [IEditorBridgeService, { changeVisible }],
        ]);

        expect(SetCellEditVisibleOperation.handler(accessor, undefined as any)).toBe(false);
        expect(SetCellEditVisibleOperation.handler(accessor, { visible: true } as any)).toBe(false);
        expect(changeVisible).not.toHaveBeenCalled();
    });

    it('SetCellEditVisibleOperation returns false when no active workbook', () => {
        const accessor = createAccessor([
            [IConfigService, { getConfig: vi.fn(() => ({ disableEdit: false })) }],
            [IUniverInstanceService, { getCurrentUnitOfType: vi.fn(() => null) }],
            [IEditorBridgeService, { changeVisible: vi.fn() }],
        ]);

        expect(SetCellEditVisibleOperation.handler(accessor, { visible: false } as any)).toBe(false);
    });

    it('SetCellEditVisibleOperation falls back to workbook unitId', () => {
        const changeVisible = vi.fn();
        const accessor = createAccessor([
            [Injector, new Injector()],
            [IConfigService, { getConfig: vi.fn(() => ({ disableEdit: false })) }],
            [IUniverInstanceService, { getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => 'workbook-u1' })) }],
            [IEditorBridgeService, { changeVisible }],
        ]);

        expect(SetCellEditVisibleOperation.handler(accessor, { visible: true } as any)).toBe(true);
        expect(changeVisible).toHaveBeenCalledWith({ visible: true, unitId: 'workbook-u1' });
    });

    it('SetCellEditVisibleWithF2Operation respects workbook existence and delegates command execution', () => {
        const syncExecuteCommand = vi.fn(() => true);
        const commandAccessor = createAccessor([
            [ICommandService, { syncExecuteCommand }],
            [IUniverInstanceService, { getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => 'wb-u2' })) }],
        ]);

        expect(SetCellEditVisibleWithF2Operation.handler(commandAccessor, { visible: true } as any)).toBe(true);
        expect(syncExecuteCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: true,
            unitId: 'wb-u2',
        });

        const noWorkbookAccessor = createAccessor([
            [ICommandService, { syncExecuteCommand: vi.fn() }],
            [IUniverInstanceService, { getCurrentUnitOfType: vi.fn(() => null) }],
        ]);
        expect(SetCellEditVisibleWithF2Operation.handler(noWorkbookAccessor, { visible: true } as any)).toBe(false);
    });

    it('SetCellEditVisibleArrowOperation is a no-op event operation', () => {
        expect(SetCellEditVisibleArrowOperation.handler({} as any, undefined as any)).toBe(true);
    });

    it('blocks activation and opening in the pending pane while allowing its peer to open the editor', () => {
        const canvas = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: () => {}, clearRect: () => {} } as unknown as CanvasRenderingContext2D;
        });
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([SheetSkeletonService]);
            injector.add([SheetInterceptorService]);
            injector.add([DocSelectionManagerService]);
            injector.add([IEditorService, { useClass: EditorService }]);
            injector.add([IEditorBridgeService, { useClass: EditorBridgeService }]);
            const unitId = 'pending-editor';
            const sheetId = 'sheet1';
            const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: unitId,
                sheets: { [sheetId]: { id: sheetId } },
                sheetOrder: [sheetId],
            });
            injector.get(IUniverInstanceService).focusUnit(unitId);
            const renders = injector.get(IRenderManagerService);
            renders.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
            const primary = renders.createRender(unitId);
            const peerId = 'peer-editor';
            renders.createRender(unitId, undefined, peerId);
            primary.with(SheetSkeletonManagerService).setProjectionPending(sheetId, true);
            const commands = injector.get(ICommandService);
            commands.registerCommand(SetActivateCellEditOperation);
            commands.registerCommand(SetCellEditVisibleOperation);
            const editor = injector.get(IEditorBridgeService);
            expect(commands.syncExecuteCommand(SetActivateCellEditOperation.id, {
                unitId,
                sheetId,
                scene: primary.scene,
                engine: primary.engine,
                primary: workbook.getActiveSheet().getCellInfoInMergeData(0, 0),
            })).toBe(false);
            const open = { visible: true, unitId, eventType: DeviceInputEventType.Keyboard };
            expect(commands.syncExecuteCommand(SetCellEditVisibleOperation.id, open)).toBe(false);
            expect(editor.isVisible().visible).toBe(false);
            renders.focusRender?.(peerId);
            expect(commands.syncExecuteCommand(SetCellEditVisibleOperation.id, open)).toBe(true);
            expect(editor.isVisible().visible).toBe(true);
        } finally {
            univer.dispose();
            canvas.mockRestore();
        }
    });
});
