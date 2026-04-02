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

import type { ISheetFloatDom } from '@univerjs/sheets-drawing';
import { DrawingTypeEnum, ImageSourceType, IURLImageService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { InsertSheetDrawingCommand, RemoveSheetDrawingCommand, SetSheetDrawingCommand } from '@univerjs/sheets-drawing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import '../f-event';
import '../f-univer';

function createFloatDomDrawing(drawingId: string): ISheetFloatDom {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_DOM,
        componentKey: 'float-dom',
        data: { label: drawingId },
        transform: {
            left: 10,
            top: 20,
            width: 30,
            height: 40,
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        },
        sheetTransform: {
            from: { row: 1, rowOffset: 0, column: 1, columnOffset: 0 },
            to: { row: 3, rowOffset: 0, column: 4, columnOffset: 0 },
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        },
        axisAlignSheetTransform: {
            from: { row: 1, rowOffset: 0, column: 1, columnOffset: 0 },
            to: { row: 3, rowOffset: 0, column: 4, columnOffset: 0 },
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        },
        imageSourceType: ImageSourceType.URL,
        source: `https://example.com/${drawingId}.png`,
    } as ISheetFloatDom;
}

describe('FUniverSheetsDrawingUIMixin', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('bridges float dom add, update, and delete events through the real command pipeline', async () => {
        const urlImageService = {
            registerURLImageDownloader: vi.fn(() => ({ dispose: vi.fn() })),
        };
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [IURLImageService, { useValue: urlImageService as never }],
        ]);
        const univerAPI = FUniver.newAPI(testBed.univer) as FUniver & {
            registerURLImageDownloader: (downloader: (url: string) => Promise<string>) => { dispose: () => void };
        };
        (univerAPI as any).getActiveWorkbook = () => ({
            getId: () => 'test',
        });

        const beforeAdd = vi.fn();
        const afterAdd = vi.fn();
        const beforeUpdate = vi.fn();
        const afterUpdate = vi.fn();
        const beforeDelete = vi.fn();
        const afterDelete = vi.fn();

        univerAPI.addEvent(univerAPI.Event.BeforeFloatDomAdd, beforeAdd);
        univerAPI.addEvent(univerAPI.Event.FloatDomAdded, afterAdd);
        univerAPI.addEvent(univerAPI.Event.BeforeFloatDomUpdate, beforeUpdate);
        univerAPI.addEvent(univerAPI.Event.FloatDomUpdated, afterUpdate);
        univerAPI.addEvent(univerAPI.Event.BeforeFloatDomDelete, beforeDelete);
        univerAPI.addEvent(univerAPI.Event.FloatDomDeleted, afterDelete);

        const drawing = createFloatDomDrawing('float-1');

        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [drawing],
        })).toBe(true);
        expect(beforeAdd).toHaveBeenCalledWith(expect.objectContaining({
            drawings: [expect.objectContaining({ drawingId: 'float-1' })],
        }));
        expect(afterAdd).toHaveBeenCalledWith(expect.objectContaining({
            drawings: [expect.objectContaining({ drawingId: 'float-1' })],
        }));

        expect(await testBed.commandService.executeCommand(SetSheetDrawingCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'float-1',
                data: { label: 'updated' },
            }],
        })).toBe(true);
        expect(beforeUpdate).toHaveBeenCalledWith(expect.objectContaining({
            drawings: [expect.objectContaining({ drawingId: 'float-1', data: { label: 'float-1' } })],
        }));
        expect(afterUpdate).toHaveBeenCalledWith(expect.objectContaining({
            drawings: [expect.objectContaining({ drawingId: 'float-1', data: { label: 'updated' } })],
        }));

        expect(await testBed.commandService.executeCommand(RemoveSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'float-1',
                drawingType: DrawingTypeEnum.DRAWING_DOM,
            }],
        })).toBe(true);
        expect(beforeDelete).toHaveBeenCalledWith(expect.objectContaining({
            drawings: [expect.objectContaining({ drawingId: 'float-1' })],
        }));
        expect(afterDelete).toHaveBeenCalledWith(expect.objectContaining({
            drawings: ['float-1'],
        }));

        const downloader = vi.fn(async (url: string) => `base64:${url}`);
        const disposable = univerAPI.registerURLImageDownloader(downloader);
        expect(urlImageService.registerURLImageDownloader).toHaveBeenCalledWith(downloader);
        disposable.dispose();

        testBed.univer.dispose();
    });

    it('allows before-events to cancel float dom mutations', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        const univerAPI = FUniver.newAPI(testBed.univer);
        (univerAPI as any).getActiveWorkbook = () => ({
            getId: () => 'test',
        });
        const drawing = createFloatDomDrawing('float-cancel');

        univerAPI.addEvent(univerAPI.Event.BeforeFloatDomAdd, (event) => {
            event.cancel = true;
        });

        await expect(testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [drawing],
        })).resolves.toBe(false);

        testBed.univer.dispose();
    });
});
