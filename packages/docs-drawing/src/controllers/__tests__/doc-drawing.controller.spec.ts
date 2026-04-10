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

import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DocDrawingController, DOCS_DRAWING_PLUGIN } from '../doc-drawing.controller';

describe('DocDrawingController', () => {
    it('should serialize snapshot and load resources into drawing services', () => {
        const registerDrawingData = vi.fn();
        const registerDrawingDataForManager = vi.fn();

        let snapshot: any = {
            drawings: { d1: { id: 'd1', drawingType: 'image' } },
            drawingsOrder: ['d1'],
        };

        const doc = {
            getSnapshot: () => snapshot,
            resetDrawing: (data: any, order: any) => {
                snapshot = { ...snapshot, drawings: data, drawingsOrder: order };
            },
            getDrawings: () => snapshot.drawings,
            getDrawingsOrder: () => snapshot.drawingsOrder,
        };

        const univerInstanceService = {
            getUnit: vi.fn((_unitId: string, _type?: UniverInstanceType) => doc),
        };

        let capturedResource: any;
        const resourceManagerService = {
            registerPluginResource: vi.fn((resource: any) => {
                capturedResource = resource;
                return { dispose: vi.fn() };
            }),
        };

        const controller = new DocDrawingController(
            { registerDrawingData } as any,
            { registerDrawingData: registerDrawingDataForManager } as any,
            resourceManagerService as any,
            univerInstanceService as any
        );

        expect(resourceManagerService.registerPluginResource).toHaveBeenCalledTimes(1);
        expect(capturedResource.pluginName).toBe(DOCS_DRAWING_PLUGIN);
        expect(capturedResource.businesses).toEqual([UniverInstanceType.UNIVER_DOC]);

        const json = capturedResource.toJson('doc-1');
        const parsed = JSON.parse(json);
        expect(parsed.data).toEqual(snapshot.drawings);
        expect(parsed.order).toEqual(snapshot.drawingsOrder);

        expect(capturedResource.parseJson('')).toEqual({ data: {}, order: [] });
        expect(capturedResource.parseJson('{bad json')).toEqual({ data: {}, order: [] });

        capturedResource.onLoad('doc-1', { data: { d2: { id: 'd2' } }, order: ['d2'] });
        expect(registerDrawingData).toHaveBeenCalledWith('doc-1', expect.any(Object));
        expect(registerDrawingDataForManager).toHaveBeenCalledWith('doc-1', expect.any(Object));

        capturedResource.onUnLoad('doc-1');
        expect(registerDrawingData).toHaveBeenLastCalledWith('doc-1', {
            'doc-1': {
                unitId: 'doc-1',
                subUnitId: 'doc-1',
                data: {},
                order: [],
            },
        });

        controller.dispose();
    });
});
