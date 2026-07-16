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

import { BooleanNumber, PositionedObjectLayoutType, UniverInstanceType } from '@univerjs/core';
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
            univerInstanceService as any,
            { registerCommand: vi.fn(() => ({ dispose: vi.fn() })) } as any
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

        capturedResource.onLoad('doc-1', {
            data: {
                mask: {
                    id: 'mask',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: BooleanNumber.FALSE,
                },
                photo: {
                    id: 'photo',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: BooleanNumber.TRUE,
                },
                d2: {
                    id: 'd2',
                    docTransform: {
                        size: { width: 320, height: 180 },
                        positionH: { posOffset: 12 },
                        positionV: { posOffset: 34 },
                        angle: 15,
                    },
                },
            },
            order: ['mask', 'photo', 'd2'],
        });
        expect(registerDrawingData).toHaveBeenCalledWith('doc-1', expect.any(Object));
        expect(registerDrawingDataForManager).toHaveBeenCalledWith('doc-1', expect.any(Object));
        const loadedDrawingData = registerDrawingDataForManager.mock.calls.at(-1)?.[1];
        expect(loadedDrawingData).toMatchObject({
            'doc-1': {
                unitId: 'doc-1',
                subUnitId: 'doc-1',
                data: {
                    d2: expect.objectContaining({
                        docTransform: {
                            size: { width: 320, height: 180 },
                            positionH: { posOffset: 12 },
                            positionV: { posOffset: 34 },
                            angle: 15,
                        },
                    }),
                },
                order: ['photo', 'mask', 'd2'],
            },
        });
        const loadedDocDrawingData = registerDrawingData.mock.calls.at(-1)?.[1];
        expect(loadedDocDrawingData?.['doc-1']?.order).toEqual(['mask', 'photo', 'd2']);
        expect(loadedDrawingData?.['doc-1']?.data?.d2).not.toHaveProperty('transform');

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
