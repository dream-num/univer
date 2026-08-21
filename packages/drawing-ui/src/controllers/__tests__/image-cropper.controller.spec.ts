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
import { CURSOR_TYPE, Image } from '@univerjs/engine-render';
import { KeyCode } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AutoImageCropOperation, CloseImageCropOperation, CropType, OpenImageCropOperation } from '../../commands/operations/image-crop.operation';
import { ImageCropperObject } from '../../views/crop/image-cropper-object';
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
        const renderManagerService = { getRenderUnitById: vi.fn(() => ({ scene })) };

        const controller = new ImageCropperController(
            commandService as never,
            drawingManagerService as never,
            renderManagerService as never,
            { getCurrentTypeOfUnit$: vi.fn(() => new Subject()), getFocusedUnit: vi.fn() } as never,
            { show: vi.fn() } as never,
            { t: vi.fn((key: string) => key) } as never,
            { registerShortcut: vi.fn(() => ({ dispose: vi.fn() })) } as never,
            { focus: vi.fn() } as never
        );

        // handlers: [OpenImageCrop, CloseImageCrop, AutoImageCrop]
        commandHandlers[2]({ id: AutoImageCropOperation.id, params: { cropType: CropType.R1_1 } } as never);

        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(CloseImageCropOperation.id, { isAuto: true });
        expect(image.srcRect).toEqual({ left: 25, top: 0, right: 25, bottom: 0 });
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(OpenImageCropOperation.id, focusDrawing);

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
        const renderManagerService = { getRenderUnitById: vi.fn(() => ({ scene })) };

        const controller = new ImageCropperController(
            commandService as never,
            drawingManagerService as never,
            renderManagerService as never,
            { getCurrentTypeOfUnit$: vi.fn(() => new Subject()), getFocusedUnit: vi.fn() } as never,
            messageService as never,
            { t: vi.fn((key: string) => key) } as never,
            { registerShortcut: vi.fn(() => ({ dispose: vi.fn() })) } as never,
            { focus: vi.fn() } as never
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
            detachFrom: vi.fn(),
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
            addObject: vi.fn((obj: ImageCropperObject) => {
                createdCropper = obj;
                return { attachTransformerTo: vi.fn() };
            }),
        };
        const renderManagerService = { getRenderUnitById: vi.fn(() => ({ scene })) };
        const layoutService = { focus: vi.fn() };

        const controller = new ImageCropperController(
            commandService as never,
            drawingManagerService as never,
            renderManagerService as never,
            { getCurrentTypeOfUnit$: vi.fn(() => new Subject()), getFocusedUnit: vi.fn() } as never,
            { show: vi.fn() } as never,
            { t: vi.fn((key: string) => key) } as never,
            { registerShortcut: vi.fn(() => ({ dispose: vi.fn() })) } as never,
            layoutService as never
        );

        // OpenImageCrop handler
        commandHandlers[0]({ id: OpenImageCropOperation.id, params: focusDrawing } as never);

        expect(createdCropper).not.toBeNull();
        createdCropper!.onPointerEnter$.emitEvent({} as never);
        expect(createdCropper!.cursor).toBe(CURSOR_TYPE.MOVE);
        createdCropper!.onPointerLeave$.emitEvent({} as never);
        expect(createdCropper!.cursor).toBe(CURSOR_TYPE.DEFAULT);

        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDrawingSelectedOperation.id, [focusDrawing]);
        expect(layoutService.focus).toHaveBeenCalledOnce();
        controller.dispose();
    });

    it('registers confirm and cancel shortcuts only while crop mode is open', () => {
        const focusDrawing = { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'd1' };
        const imageKey = getDrawingShapeKeyByDrawingSearch(focusDrawing);
        const image = createImage(imageKey);
        const commandHandlers: Array<(cmd: ICommandInfo) => void> = [];
        const commandService = {
            onCommandExecuted: vi.fn((handler) => {
                commandHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
            executeCommand: vi.fn(),
            syncExecuteCommand: vi.fn((id, params) => {
                if (id === CloseImageCropOperation.id) {
                    commandHandlers[1]({ id, params } as never);
                }
                return true;
            }),
        };
        const transformer = {
            clearControls: vi.fn(),
            refreshControls: vi.fn(),
            clearCopperControl: vi.fn(),
            createControlForCopper: vi.fn(),
            detachFrom: vi.fn(),
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
            addObject: vi.fn((object: ImageCropperObject) => {
                createdCropper = object;
                return { attachTransformerTo: vi.fn() };
            }),
        };
        const firstEnterShortcutDisposable = { dispose: vi.fn() };
        const firstCancelShortcutDisposable = { dispose: vi.fn() };
        const secondEnterShortcutDisposable = { dispose: vi.fn() };
        const secondCancelShortcutDisposable = { dispose: vi.fn() };
        const shortcutDisposables = [
            firstEnterShortcutDisposable,
            firstCancelShortcutDisposable,
            secondEnterShortcutDisposable,
            secondCancelShortcutDisposable,
        ];
        const shortcutService = {
            registerShortcut: vi.fn(() => shortcutDisposables.shift()!),
        };
        const controller = new ImageCropperController(
            commandService as never,
            {
                getDrawingByParam: vi.fn(() => ({ drawingType: DrawingTypeEnum.DRAWING_IMAGE })),
                getDrawingOKey: vi.fn(() => ({ ...focusDrawing, transform: image.getState() })),
                featurePluginUpdateNotification: vi.fn(),
            } as never,
            { getRenderUnitById: vi.fn(() => ({ scene })) } as never,
            { getCurrentTypeOfUnit$: vi.fn(() => new Subject()), getFocusedUnit: vi.fn(() => null) } as never,
            { show: vi.fn() } as never,
            { t: vi.fn((key: string) => key) } as never,
            shortcutService as never,
            { focus: vi.fn() } as never
        );

        commandHandlers[0]({ id: OpenImageCropOperation.id, params: focusDrawing } as never);

        expect(shortcutService.registerShortcut).toHaveBeenCalledWith(expect.objectContaining({
            id: CloseImageCropOperation.id,
            binding: KeyCode.ENTER,
        }));
        expect(shortcutService.registerShortcut).toHaveBeenCalledWith(expect.objectContaining({
            id: CloseImageCropOperation.id,
            binding: KeyCode.ESC,
            staticParameters: { isCancel: true },
        }));

        const firstCropperDispose = vi.spyOn(createdCropper!, 'dispose');
        commandHandlers[0]({ id: OpenImageCropOperation.id, params: focusDrawing } as never);
        expect(firstCropperDispose).toHaveBeenCalledOnce();

        const secondCropperDispose = vi.spyOn(createdCropper!, 'dispose');
        commandHandlers[1]({ id: CloseImageCropOperation.id, params: { isCancel: true } } as never);
        expect(transformer.detachFrom).toHaveBeenCalledWith(createdCropper);
        expect(secondCropperDispose).toHaveBeenCalledOnce();
        expect(firstEnterShortcutDisposable.dispose).toHaveBeenCalledOnce();
        expect(firstCancelShortcutDisposable.dispose).toHaveBeenCalledOnce();
        expect(secondEnterShortcutDisposable.dispose).toHaveBeenCalledOnce();
        expect(secondCancelShortcutDisposable.dispose).toHaveBeenCalledOnce();

        controller.dispose();
    });

    it('restores the image state from before auto crop without publishing changes when cancelled', () => {
        const focusDrawing = { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'd1' };
        const imageKey = getDrawingShapeKeyByDrawingSearch(focusDrawing);
        const image = createImage(imageKey);
        image.transformByState({ left: 10, top: 20, width: 100, height: 50, angle: 0 });
        const originalTransform = image.getState();
        const originalSrcRect = image.srcRect;
        const commandHandlers: Array<(cmd: ICommandInfo) => void> = [];
        const commandService = {
            onCommandExecuted: vi.fn((handler) => {
                commandHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
            executeCommand: vi.fn(),
            syncExecuteCommand: vi.fn((id, params) => {
                if (id === OpenImageCropOperation.id) {
                    commandHandlers[0]({ id, params } as never);
                }
                return true;
            }),
        };
        const drawingManagerService = {
            getFocusDrawings: vi.fn(() => [focusDrawing]),
            getDrawingByParam: vi.fn(() => ({ drawingType: DrawingTypeEnum.DRAWING_IMAGE })),
            getDrawingOKey: vi.fn(() => ({ ...focusDrawing, drawingType: DrawingTypeEnum.DRAWING_IMAGE })),
            featurePluginUpdateNotification: vi.fn(),
        };
        const refreshedImageStates: ReturnType<Image['getState']>[] = [];
        const transformer = {
            clearControls: vi.fn(),
            refreshControls: vi.fn(() => refreshedImageStates.push(image.getState())),
            clearCopperControl: vi.fn(),
            createControlForCopper: vi.fn(),
            detachFrom: vi.fn(),
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
            addObject: vi.fn((object: ImageCropperObject) => {
                createdCropper = object;
                return { attachTransformerTo: vi.fn() };
            }),
        };
        const controller = new ImageCropperController(
            commandService as never,
            drawingManagerService as never,
            { getRenderUnitById: vi.fn(() => ({ scene })) } as never,
            { getCurrentTypeOfUnit$: vi.fn(() => new Subject()), getFocusedUnit: vi.fn(() => ({ getUnitId: () => focusDrawing.unitId })) } as never,
            { show: vi.fn() } as never,
            { t: vi.fn((key: string) => key) } as never,
            { registerShortcut: vi.fn(() => ({ dispose: vi.fn() })) } as never,
            { focus: vi.fn() } as never
        );

        commandHandlers[2]({ id: AutoImageCropOperation.id, params: { cropType: CropType.R1_1 } } as never);
        expect(image.srcRect).not.toBeNull();
        expect(createdCropper).not.toBeNull();
        refreshedImageStates.length = 0;
        commandHandlers[1]({ id: CloseImageCropOperation.id, params: { isCancel: true } } as never);

        expect(drawingManagerService.featurePluginUpdateNotification).not.toHaveBeenCalled();
        expect(image.getState()).toEqual(originalTransform);
        expect(image.srcRect).toBe(originalSrcRect);
        expect(refreshedImageStates).toEqual([originalTransform]);

        controller.dispose();
    });
});
