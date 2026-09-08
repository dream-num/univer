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

import type { IDocDrawing } from '../../services/doc-drawing.service';
import { BooleanNumber, DrawingTypeEnum, IResourceManagerService, PositionedObjectLayoutType, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { describe, expect, it } from 'vitest';
import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { IDocDrawingService } from '../../services/doc-drawing.service';
import { DocDrawingController, DOCS_DRAWING_PLUGIN } from '../doc-drawing.controller';

function drawing(drawingId: string): IDocDrawing {
    return {
        drawingId,
        unitId: 'test-doc',
        subUnitId: 'stale-import-unit',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        layoutType: PositionedObjectLayoutType.WRAP_NONE,
        docTransform: { size: { width: 320, height: 180 }, angle: 15, positionH: { relativeFrom: 0, posOffset: 12 }, positionV: { relativeFrom: 0, posOffset: 34 } },
    };
}

describe('DocDrawingController', () => {
    it('serializes snapshots and loads and unloads resources through drawing services', () => {
        const bed = createFacadeTestBed();
        try {
            const model = bed.documentDataModel;
            model.resetDrawing({ d1: drawing('d1') }, ['d1']);
            const resources = bed.injector.get(IResourceManagerService);
            const hook = resources.getAllResourceHooks().find((hook) => hook.pluginName === DOCS_DRAWING_PLUGIN)!;
            expect(hook.businesses).toEqual([UniverInstanceType.UNIVER_DOC]);
            expect(JSON.parse(hook.toJson('test-doc'))).toEqual({ data: model.getDrawings(), order: ['d1'] });
            expect(hook.parseJson('')).toEqual({ data: {}, order: [] });
            expect(hook.parseJson('{bad json')).toEqual({ data: {}, order: [] });
            hook.onLoad('test-doc', {
                data: {
                    mask: { ...drawing('mask'), behindDoc: BooleanNumber.FALSE },
                    photo: { ...drawing('photo'), behindDoc: BooleanNumber.TRUE },
                    d2: drawing('d2'),
                },
                order: ['mask', 'photo', 'd2'],
            });
            const manager = bed.injector.get(IDrawingManagerService);
            const docDrawings = bed.injector.get(IDocDrawingService);
            expect(manager.getDrawingOrder('test-doc', 'test-doc')).toEqual(['photo', 'mask', 'd2']);
            expect(docDrawings.getDrawingOrder('test-doc', 'test-doc')).toEqual(['mask', 'photo', 'd2']);
            expect(manager.getDrawingData('test-doc', 'test-doc').d2).toMatchObject({
                hidden: true,
                docTransform: drawing('d2').docTransform,
            });
            expect(manager.getDrawingData('test-doc', 'test-doc').d2).not.toHaveProperty('transform');
            expect(docDrawings.getDrawingData('test-doc', 'test-doc').d2).not.toHaveProperty('hidden');
            hook.onUnLoad('test-doc');
            expect(model.getDrawings()).toEqual({});
            expect(model.getDrawingsOrder()).toEqual([]);
            expect(manager.getDrawingData('test-doc', 'test-doc')).toEqual({});
            expect(docDrawings.getDrawingData('test-doc', 'test-doc')).toEqual({});
        } finally {
            bed.univer.dispose();
        }
    });

    it('normalizes imported body and footnote drawing identities without flattening persisted resources', () => {
        const bed = createFacadeTestBed({
            id: 'test-doc',
            documentStyle: {},
            body: { dataStream: '\r\n' },
            drawings: { image: drawing('image') },
            drawingsOrder: ['image'],
            notes: { note: { type: 'footnote' as const, noteId: 'note', body: { dataStream: '\b\r\n' }, drawings: { 'note-image': { ...drawing('note-image'), layoutType: PositionedObjectLayoutType.INLINE } }, drawingsOrder: ['note-image'] } },
        });
        try {
            const controller = bed.injector.get(DocDrawingController);
            expect(controller.loadDrawingDataForUnit('test-doc')).toBe(true);
            for (const service of [bed.injector.get(IDocDrawingService), bed.injector.get(IDrawingManagerService)]) {
                expect(service.getDrawingOrder('test-doc', 'test-doc')).toEqual(['image', 'note-image']);
                expect(service.getDrawingData('test-doc', 'test-doc')).toMatchObject({
                    image: { unitId: 'test-doc', subUnitId: 'test-doc' },
                    'note-image': { unitId: 'test-doc', subUnitId: 'test-doc' },
                });
            }
            expect(bed.documentDataModel.getDrawings()).not.toHaveProperty('note-image');
            expect(bed.documentDataModel.getSnapshot().notes?.note.drawings?.['note-image'].subUnitId).toBe('stale-import-unit');
        } finally {
            bed.univer.dispose();
        }
    });
});
