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

import type { ICommandInfo } from '@univerjs/core';
import { DrawingTypeEnum } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { getDrawingShapeKeyByDrawingSearch, SetDrawingSelectedOperation } from '@univerjs/drawing';
import { ImageCropperObject } from '@univerjs/drawing-ui';
import { CURSOR_TYPE, Image } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AutoImageCropOperation, CloseImageCropOperation, CropType, OpenImageCropOperation } from '../../commands/operations/image-crop.operation';
import { ImageCropperController } from '../image-cropper.controller';

function createImage(id: string) {
    const img = document.createElement('img');
    Object.defineProperty(img, 'width', { value: 100, configurable: true });
    Object.defineProperty(img, 'height', { value: 50, configurable: true });
    return new Image(id, { image: img });
}

describe('ImageCropperController', () => {
    it('auto crops focused image and opens crop panel', () => {
        const focusDrawing = { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'd1' };

        const imageKey = getDrawingShapeKeyByDrawingSearch(focusDrawing);
        const image = createImage(imageKey);
        image.transformByState({ left: 0, top: 0, width: 100, height: 50, angle: 0 });

        const existingCropper = new ImageCropperObject(`${imageKey}-crop`, { applyTransform: image.getState() });

        const commandHandlers: Array<(cmd: ICommandInfo) => void> = [];
        const commandService = {
            onCommandExecuted: vi.fn((handler) => {
                commandHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
            executeCommand: vi.fn(),
            syncExecuteCommand: vi.fn(),
        };

        const drawingManagerService = {
            getFocusDrawings: vi.fn(() => [focusDrawing]),
            getDrawingByParam: vi.fn(() => ({ drawingType: DrawingTypeEnum.DRAWING_IMAGE })),
        };

        const transformer = {
            changeStart$: new Subject(),
            changeEnd$: new Subject(),
            clearControl$: new Subject(),
            clearCopperControl: vi.fn(),
            createControlForCopper: vi.fn(),
        };

        const scene = {
            getAllObjectsByOrder: vi.fn(() => [existingCropper]),
            getObject: vi.fn(() => image),
            getTransformerByCreate: vi.fn(() => transformer),
        };
        const renderManagerService = { getRenderById: vi.fn(() => ({ scene })) };

        const controller = new ImageCropperController(
            commandService as never,
            drawingManagerService as never,
            renderManagerService as never,
            { getCurrentTypeOfUnit$: vi.fn(() => new Subject()), getFocusedUnit: vi.fn() } as never,
            { show: vi.fn() } as never,
            { t: vi.fn((key: string) => key) } as never
        );

        // handlers: [OpenImageCrop, CloseImageCrop, AutoImageCrop]
        commandHandlers[2]({ id: AutoImageCropOperation.id, params: { cropType: CropType.R1_1 } } as never);

        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(CloseImageCropOperation.id, { isAuto: true });
        expect(image.srcRect).toEqual({ left: 25, top: 0, right: 25, bottom: 0 });
        expect(commandService.executeCommand).toHaveBeenCalledWith(OpenImageCropOperation.id, focusDrawing);

        controller.dispose();
    });

    it('shows error message when auto crop target is not an Image', () => {
        const commandHandlers: Array<(cmd: ICommandInfo) => void> = [];
        const messageService = { show: vi.fn() };
        const commandService = {
            onCommandExecuted: vi.fn((handler) => {
                commandHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
            executeCommand: vi.fn(),
            syncExecuteCommand: vi.fn(),
        };

        const drawingManagerService = {
            getFocusDrawings: vi.fn(() => [{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'd1' }]),
            getDrawingByParam: vi.fn(() => ({ drawingType: DrawingTypeEnum.DRAWING_IMAGE })),
        };

        const scene = {
            getAllObjectsByOrder: vi.fn(() => []),
            getObject: vi.fn(() => ({ not: 'image' })),
            getTransformerByCreate: vi.fn(() => ({ changeStart$: new Subject(), changeEnd$: new Subject(), clearControl$: new Subject() })),
        };
        const renderManagerService = { getRenderById: vi.fn(() => ({ scene })) };

        const controller = new ImageCropperController(
            commandService as never,
            drawingManagerService as never,
            renderManagerService as never,
            { getCurrentTypeOfUnit$: vi.fn(() => new Subject()), getFocusedUnit: vi.fn() } as never,
            messageService as never,
            { t: vi.fn((key: string) => key) } as never
        );

        commandHandlers[2]({ id: AutoImageCropOperation.id, params: { cropType: CropType.R1_1 } } as never);

        expect(messageService.show).toHaveBeenCalledWith(expect.objectContaining({
            type: MessageType.Error,
        }));

        controller.dispose();
    });

    it('opens crop mode for image and applies hover cursor changes', () => {
        const focusDrawing = { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'd1' };
        const imageKey = getDrawingShapeKeyByDrawingSearch(focusDrawing);
        const image = createImage(imageKey);
        image.transformByState({ left: 0, top: 0, width: 100, height: 50, angle: 0 });

        const commandHandlers: Array<(cmd: ICommandInfo) => void> = [];
        const commandService = {
            onCommandExecuted: vi.fn((handler) => {
                commandHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
            executeCommand: vi.fn(),
            syncExecuteCommand: vi.fn(),
        };

        const drawingManagerService = {
            getDrawingByParam: vi.fn(() => ({ drawingType: DrawingTypeEnum.DRAWING_IMAGE, srcRect: null, prstGeom: null })),
        };

        const transformer = {
            clearControls: vi.fn(),
            refreshControls: vi.fn(),
            clearCopperControl: vi.fn(),
            createControlForCopper: vi.fn(),
            changeStart$: new Subject(),
            changeEnd$: new Subject(),
            clearControl$: new Subject(),
        };

        let createdCropper: ImageCropperObject | null = null;
        const scene = {
            getAllObjectsByOrder: vi.fn(() => createdCropper ? [createdCropper] : []),
            getObject: vi.fn(() => image),
            getTransformerByCreate: vi.fn(() => transformer),
            getTransformer: vi.fn(() => transformer),
            addObject: vi.fn((obj: any) => {
                createdCropper = obj;
                return { attachTransformerTo: vi.fn() };
            }),
        };
        const renderManagerService = { getRenderById: vi.fn(() => ({ scene })) };

        const controller = new ImageCropperController(
            commandService as never,
            drawingManagerService as never,
            renderManagerService as never,
            { getCurrentTypeOfUnit$: vi.fn(() => new Subject()), getFocusedUnit: vi.fn() } as never,
            { show: vi.fn() } as never,
            { t: vi.fn((key: string) => key) } as never
        );

        // OpenImageCrop handler
        commandHandlers[0]({ id: OpenImageCropOperation.id, params: focusDrawing } as never);

        expect(createdCropper).not.toBeNull();
        createdCropper!.onPointerEnter$.emitEvent({} as never);
        expect(createdCropper!.cursor).toBe(CURSOR_TYPE.MOVE);
        createdCropper!.onPointerLeave$.emitEvent({} as never);
        expect(createdCropper!.cursor).toBe(CURSOR_TYPE.DEFAULT);

        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDrawingSelectedOperation.id, [focusDrawing]);
        controller.dispose();
    });
});
