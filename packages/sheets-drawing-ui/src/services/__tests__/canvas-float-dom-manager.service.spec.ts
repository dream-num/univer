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

import { DrawingApplyType, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import { describe, expect, it, vi } from 'vitest';
import { SheetCanvasFloatDomManagerService } from '../canvas-float-dom-manager.service';

function createService(drawing: unknown) {
    const dispose = vi.fn();
    const removeObject = vi.fn();
    const syncExecuteCommand = vi.fn(() => true);
    const getDrawingByParam = vi.fn(() => drawing);
    const getBatchRemoveOp = vi.fn(() => ({
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        redo: ['redo-op'],
        objects: ['object-1'],
    }));
    const service = Object.create(SheetCanvasFloatDomManagerService.prototype) as any;

    service._domLayerInfoMap = new Map([
        ['float-dom-1', {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            dispose: { dispose },
            rect: { id: 'rect-1' },
        }],
    ]);
    service._drawingManagerService = { getDrawingByParam };
    service._commandService = { syncExecuteCommand };
    service._sheetDrawingService = { getBatchRemoveOp };
    service._getSceneAndTransformerByDrawingSearch = vi.fn(() => ({
        scene: { removeObject },
    }));

    return { service, dispose, removeObject, syncExecuteCommand, getDrawingByParam, getBatchRemoveOp };
}

describe('SheetCanvasFloatDomManagerService', () => {
    it('removes drawing-backed float doms through the shared remove path', () => {
        const drawing = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'float-dom-1',
        };
        const { service, dispose, removeObject, syncExecuteCommand, getDrawingByParam, getBatchRemoveOp } = createService(drawing);

        service.removeFloatDom('float-dom-1');

        expect(dispose).toHaveBeenCalledTimes(1);
        expect(removeObject).toHaveBeenCalledWith({ id: 'rect-1' });
        expect(getDrawingByParam).toHaveBeenCalledWith({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'float-dom-1',
        });
        expect(getBatchRemoveOp).toHaveBeenCalledWith([drawing]);
        expect(syncExecuteCommand).toHaveBeenCalledWith(SetDrawingApplyMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            op: ['redo-op'],
            objects: ['object-1'],
            type: DrawingApplyType.REMOVE,
        });
        expect(service.getFloatDomInfo('float-dom-1')).toBeUndefined();
    });

    it('removes runtime-only float doms directly', () => {
        const { service, dispose, removeObject, syncExecuteCommand } = createService(null);

        service.removeFloatDom('float-dom-1');

        expect(dispose).toHaveBeenCalledTimes(1);
        expect(removeObject).toHaveBeenCalledWith({ id: 'rect-1' });
        expect(syncExecuteCommand).not.toHaveBeenCalled();
        expect(service.getFloatDomInfo('float-dom-1')).toBeUndefined();
    });
});
