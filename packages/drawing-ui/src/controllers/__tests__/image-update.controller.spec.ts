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

import { DrawingTypeEnum, UniverInstanceType } from '@univerjs/core';
import { SetDrawingSelectedOperation } from '@univerjs/drawing';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ImageResetSizeOperation } from '../../commands/operations/image-reset-size.operation';
import { ImageUpdateController } from '../image-update.controller';

afterEach(() => {
    vi.useRealTimers();
});

function createSheetUnit(unitId = 'book-1', subUnitId = 'sheet-1') {
    return {
        type: UniverInstanceType.UNIVER_SHEET,
        getUnitId: () => unitId,
        getActiveSheet: () => ({ getSheetId: () => subUnitId }),
    };
}

describe('ImageUpdateController', () => {
    it('resets image size after command execution and pushes updated drawing state back', () => {
        let commandHandler: ((command: { id: string; params?: unknown }) => void) | undefined;
        const changeNotification = vi.fn();
        const imageShape = {
            resetSize: vi.fn(),
            getNativeSize: vi.fn(() => ({ width: 320, height: 180 })),
        };
        const params = [{ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'shape-1' }];
        const drawingManagerService = {
            add$: new Subject(),
            update$: new Subject(),
            getDrawingByParam: vi.fn(() => ({
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                drawingId: 'shape-1',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                transform: { width: 100, height: 50, angle: 30 },
            })),
            featurePluginUpdateNotification: vi.fn(),
        };
        const commandService = {
            onCommandExecuted: vi.fn((handler) => {
                commandHandler = handler;
                return { dispose: vi.fn() };
            }),
            syncExecuteCommand: vi.fn(),
        };

        const controller = new ImageUpdateController(
            commandService as never,
            {
                getRenderById: vi.fn(() => ({
                    scene: {
                        getObject: vi.fn(() => imageShape),
                        getTransformerByCreate: vi.fn(() => ({
                            refreshControls: vi.fn(() => ({ changeNotification })),
                        })),
                    },
                })),
            } as never,
            drawingManagerService as never,
            {} as never,
            {} as never,
            { getUnit: vi.fn(() => createSheetUnit()), getFocusedUnit: vi.fn(() => createSheetUnit()) } as never,
            { renderImages: vi.fn() } as never
        );

        expect(controller).toBeTruthy();

        commandHandler!({ id: ImageResetSizeOperation.id, params });

        expect(imageShape.resetSize).toHaveBeenCalledTimes(1);
        expect(drawingManagerService.featurePluginUpdateNotification).toHaveBeenCalledWith([
            expect.objectContaining({
                drawingId: 'shape-1',
                srcRect: null,
                prstGeom: null,
                transform: expect.objectContaining({ width: 320, height: 180, angle: 0 }),
            }),
        ]);
        expect(changeNotification).toHaveBeenCalledTimes(1);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDrawingSelectedOperation.id, params);
    });

    it('deduplicates add notifications before rendering newly inserted images', async () => {
        vi.useFakeTimers();
        const add$ = new Subject<Array<{ unitId: string; subUnitId: string; drawingId: string }>>();
        const update$ = new Subject();
        const imageParam = {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            drawingId: 'shape-2',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            transform: { width: 100, height: 50, angle: 0 },
        };
        const drawingManagerService = {
            add$,
            update$,
            getDrawingByParam: vi.fn(() => imageParam),
            refreshTransform: vi.fn(),
        };
        const renderImages = vi.fn(async () => []);

        const controller = new ImageUpdateController(
            { onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })), syncExecuteCommand: vi.fn() } as never,
            {
                getRenderById: vi.fn(() => ({
                    scene: { getTransformerByCreate: vi.fn(), getObject: vi.fn() },
                })),
            } as never,
            drawingManagerService as never,
            {} as never,
            {} as never,
            { getUnit: vi.fn(() => createSheetUnit()), getFocusedUnit: vi.fn(() => createSheetUnit()) } as never,
            { renderImages } as never
        );

        expect(controller).toBeTruthy();

        const duplicated = { unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'shape-2' };
        add$.next([duplicated]);
        add$.next([duplicated]);
        await vi.advanceTimersByTimeAsync(40);

        expect(renderImages).toHaveBeenCalledTimes(1);
        expect(drawingManagerService.refreshTransform).toHaveBeenCalledWith([imageParam]);
    });
});
